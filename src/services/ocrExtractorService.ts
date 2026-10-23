/**
 * TeleBirr Screenshot OCR Extractor
 *
 * Extracts the Transaction Number from a TeleBirr payment confirmation screenshot
 * using Tesseract.js (runs entirely in the browser — no server required).
 *
 * TeleBirr screenshots have a consistent format:
 *   - "Transaction Number:" followed by the alphanumeric ID (e.g. "DH82M9EPFC")
 *   - Amount displayed prominently (e.g. "-10,008.00 (ETB)")
 *   - Transaction Time, Type, and "Transaction To" fields
 */

export interface OcrExtractionResult {
  transactionId: string | null;
  amount: number | null;
  confidence: number;
  rawText: string;
  error?: string;
}

/**
 * Extract the TeleBirr transaction number from a screenshot image.
 *
 * Uses regex patterns tailored to the TeleBirr receipt format.
 * Falls back to general alphanumeric sequence detection.
 *
 * @param imageSource - Data URL, Blob, or File object of the screenshot
 * @returns Extracted transaction ID and amount
 */
export async function extractTransactionFromScreenshot(
  imageSource: string | File | Blob
): Promise<OcrExtractionResult> {
  try {
    // Dynamically import Tesseract.js so it only loads when needed
    const Tesseract = await import('tesseract.js');

    const result = await Tesseract.recognize(imageSource, 'eng', {
      logger: (info: any) => {
        // Optionally log OCR progress
        if (info.status === 'recognizing text') {
          console.debug(`[OCR] Progress: ${Math.round((info.progress || 0) * 100)}%`);
        }
      },
    });

    const rawText = result.data.text;
    const confidence = result.data.confidence;

    // Parse transaction ID and amount from the recognized text
    const extracted = parseTeleBirrReceiptText(rawText);

    return {
      transactionId: extracted.transactionId,
      amount: extracted.amount,
      confidence,
      rawText,
    };
  } catch (err: any) {
    console.error('[OCR] Tesseract extraction failed:', err);
    return {
      transactionId: null,
      amount: null,
      confidence: 0,
      rawText: '',
      error: err.message || 'OCR processing failed. Please enter the Transaction ID manually.',
    };
  }
}

/**
 * Parse the raw OCR text from a TeleBirr receipt screenshot.
 *
 * Expected format (from the shared screenshot):
 * ```
 * Successful
 * -10,008.00 (ETB)
 * Transaction Time: 2026/08/08 10:57:00
 * Transaction Type: Transfer Money
 * Transaction To: Gebrela
 * Transaction Number: DH82M9EPFC
 * ```
 */
function parseTeleBirrReceiptText(text: string): {
  transactionId: string | null;
  amount: number | null;
} {
  // Normalize text: collapse whitespace, fix common OCR mistakes
  const normalizedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  // --- Extract Transaction Number ---
  let transactionId: string | null = null;

  // Pattern 1: "Transaction Number:" or "Transaction Number" followed by alphanumeric ID
  // This is the primary pattern for TeleBirr receipts
  const txnPatterns = [
    /Transaction\s*(?:Number|No|ID|#)[:\s]+([A-Za-z0-9]{6,20})/i,
    /Trans(?:action)?\s*(?:Number|No|ID|#)[:\s]+([A-Za-z0-9]{6,20})/i,
    // Handle OCR misread like "Transactlon" or "Tronsaction"
    /Tr[ao]ns[ao]ct[il1][o0]n\s*(?:Number|No|ID|#)[:\s]+([A-Za-z0-9]{6,20})/i,
    // "Number:" at the end near QR Code section
    /(?:Number|No)[:\s]+([A-Z0-9]{6,20})\s*(?:\n|QR|$)/i,
  ];

  for (const pattern of txnPatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      transactionId = match[1].trim();
      break;
    }
  }

  // Fallback: Look for a standalone alphanumeric sequence that looks like a TeleBirr
  // transaction ID (8-12 uppercase alphanumeric characters)
  if (!transactionId) {
    const lines = normalizedText.split('\n');
    for (const line of lines) {
      // Look for lines containing "Number" or "Transaction" hint
      if (/number|transaction|trans/i.test(line)) {
        const idMatch = line.match(/\b([A-Z0-9]{8,12})\b/);
        if (idMatch) {
          transactionId = idMatch[1];
          break;
        }
      }
    }
  }

  // Final fallback: Find any 8-12 char uppercase alphanumeric that isn't a common word
  if (!transactionId) {
    const allMatches = normalizedText.match(/\b([A-Z][A-Z0-9]{7,11})\b/g);
    if (allMatches) {
      // Filter out common false positives
      const excluded = ['TRANSFER', 'SUCCESSFUL', 'MONEY', 'FINISHED', 'DOWNLOAD', 'SHARE'];
      const candidates = allMatches.filter(m => !excluded.includes(m));
      if (candidates.length > 0) {
        // Prefer the one that appears last (transaction number is usually at the bottom)
        transactionId = candidates[candidates.length - 1];
      }
    }
  }

  // --- Extract Amount ---
  let amount: number | null = null;

  // TeleBirr shows amount like "-10,008.00" or "10,008.00 (ETB)"
  const amountPatterns = [
    /[-−]?\s*([0-9]{1,3}(?:[,\s][0-9]{3})*(?:\.[0-9]{1,2})?)\s*\(?ETB\)?/i,
    /ETB\s*[-−]?\s*([0-9]{1,3}(?:[,\s][0-9]{3})*(?:\.[0-9]{1,2})?)/i,
    /[-−]\s*([0-9]{1,3}(?:[,\s][0-9]{3})*\.[0-9]{2})\s*$/m,
  ];

  for (const pattern of amountPatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      const numStr = match[1].replace(/[,\s]/g, '');
      const parsed = parseFloat(numStr);
      if (!isNaN(parsed) && parsed > 0) {
        amount = parsed;
        break;
      }
    }
  }

  return { transactionId, amount };
}
