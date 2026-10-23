import { PaymentSubmission } from '../types';

export const MAKE_PAYMENT_WEBHOOK_URL = 'https://hook.eu2.make.com/07i3ogkndao7sih66i3ct4ml8n5er3qg';

export interface WebhookPayload {
  event: 'payment_submitted' | 'payment_recheck' | 'admin_manual_trigger';
  submissionId: string;
  userId: string;
  userEmail: string;
  userName: string;
  packageId: string;
  packageName: string;
  packageCategory?: string;
  amountETB: number;
  receiverPhone: string;
  transactionId: string;
  senderPhone?: string;
  screenshotUrl: string;
  submittedAt: string;
  triggeredAt: string;
  source: 'web_client' | 'admin_dashboard';
}

export interface WebhookResult {
  success: boolean;
  statusCode?: number;
  responseBody?: any;
  error?: string;
}

/**
 * Sends payment submission data to the Make.com automation webhook
 * URL: https://hook.eu2.make.com/07i3ogkndao7sih66i3ct4ml8n5er3qg
 */
export async function sendPaymentToWebhook(
  submission: PaymentSubmission,
  event: 'payment_submitted' | 'payment_recheck' | 'admin_manual_trigger' = 'payment_submitted',
  source: 'web_client' | 'admin_dashboard' = 'web_client'
): Promise<WebhookResult> {
  const payload: WebhookPayload = {
    event,
    submissionId: submission.id,
    userId: submission.userId,
    userEmail: submission.userEmail,
    userName: submission.userName,
    packageId: submission.packageId,
    packageName: submission.packageName,
    amountETB: submission.amountETB,
    receiverPhone: submission.receiverPhone || '+251963155856',
    transactionId: submission.transactionId,
    senderPhone: submission.senderPhone || '',
    screenshotUrl: submission.screenshotUrl || '',
    submittedAt: submission.submittedAt,
    triggeredAt: new Date().toISOString(),
    source
  };

  try {
    const response = await fetch(MAKE_PAYMENT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let parsed: any = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      // plain text like 'Accepted' from Make.com
    }

    return {
      success: response.ok,
      statusCode: response.status,
      responseBody: parsed
    };
  } catch (err: any) {
    console.warn('Error dispatching payment to Make.com webhook:', err);
    return {
      success: false,
      error: err.message || 'Network error triggering webhook'
    };
  }
}
