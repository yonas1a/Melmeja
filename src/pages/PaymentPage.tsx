import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  XCircle,
  Zap,
  RefreshCw,
  ScanLine,
  Unlock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EXAM_PACKAGES } from '../data/examsData';
import { PaymentSubmission, ExamPackage } from '../types';
import { sendPaymentToWebhook } from '../services/webhookService';
import { verifyTransactionInFirestore, grantAccessAfterVerification, VerificationResult } from '../services/paymentVerificationService';
import { extractTransactionFromScreenshot, OcrExtractionResult } from '../services/ocrExtractorService';
import { 
  db, 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  storage,
  ref,
  uploadString,
  getDownloadURL
} from '../lib/firebase';
import { EmailVerificationNotice } from '../components/EmailVerificationNotice';

interface PaymentPageProps {
  onNavigate: (view: string, extraData?: any) => void;
  onOpenAuth: () => void;
  preselectedPackageId?: string;
}

const RECEIVER_PHONE = '+251963155856';

export const PaymentPage: React.FC<PaymentPageProps> = ({ onNavigate, onOpenAuth, preselectedPackageId }) => {
  const { user, userProfile, isEmailVerified, refreshUserProfile } = useAuth();

  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    preselectedPackageId || 'NGAT_ALL'
  );
  const [transactionIdInput, setTransactionIdInput] = useState<string>('');
  const [senderPhoneInput, setSenderPhoneInput] = useState<string>('');
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState<string>('');
  const [screenshotSizeKb, setScreenshotSizeKb] = useState<number>(0);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [webhookSentNotice, setWebhookSentNotice] = useState<string | null>(null);
  const [verifyingSubId, setVerifyingSubId] = useState<string | null>(null);
  const [webhookFeedback, setWebhookFeedback] = useState<{ id: string; message: string; isSuccess: boolean } | null>(null);

  // Auto-Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isGrantingAccess, setIsGrantingAccess] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);

  // OCR State
  const [isRunningOcr, setIsRunningOcr] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrExtractionResult | null>(null);

  // User's previous payment submissions
  const [mySubmissions, setMySubmissions] = useState<PaymentSubmission[]>([]);

  // Listen to user's payment submissions in Firestore
  useEffect(() => {
    if (!user) {
      setMySubmissions([]);
      return;
    }

    try {
      const q = query(
        collection(db, 'paymentSubmissions'),
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: PaymentSubmission[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        // sort by submittedAt descending
        list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setMySubmissions(list);
      }, (err) => {
        console.warn('Error fetching submissions snapshot:', err);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Error setting up submissions listener:', e);
    }
  }, [user]);

  const selectedPackage = EXAM_PACKAGES.find(p => p.id === selectedPackageId) || EXAM_PACKAGES[0];

  const handleCopyReceiver = () => {
    navigator.clipboard.writeText(RECEIVER_PHONE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compress supported screenshots, but keep the original if the browser cannot decode them.
  const compressImage = (file: File): Promise<{ dataUrl: string; sizeKb: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const originalDataUrl = e.target?.result;
        if (typeof originalDataUrl !== 'string') {
          reject(new Error('The selected file could not be read.'));
          return;
        }

        const useOriginal = () => resolve({
          dataUrl: originalDataUrl,
          sizeKb: Math.round(file.size / 1024),
        });
        const img = new Image();
        img.onload = () => {
          try {
            const maxWidth = 1200;
            const maxHeight = 1600;
            const scale = Math.min(1, maxWidth / img.naturalWidth, maxHeight / img.naturalHeight);
            const width = Math.max(1, Math.round(img.naturalWidth * scale));
            const height = Math.max(1, Math.round(img.naturalHeight * scale));
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              useOriginal();
              return;
            }

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.8);
            resolve({
              dataUrl: compressed,
              sizeKb: Math.round((compressed.length * 3) / 4 / 1024),
            });
          } catch (error) {
            console.warn('Screenshot compression unavailable; using original image:', error);
            useOriginal();
          }
        };
        img.onerror = () => {
          useOriginal();
        };
        img.src = originalDataUrl;
      };
      reader.onerror = () => reject(reader.error || new Error('Failed to read image file'));
      try {
        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Image Upload handler (File picker & Drag and drop) — now includes OCR extraction
  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/') && !/\.(jpe?g|png|webp|gif|bmp|heic|heif)$/i.test(file.name)) {
      setErrorMsg('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image is too large. Maximum allowed size is 10MB.');
      return;
    }

    setIsProcessingImage(true);
    setErrorMsg(null);
    setOcrResult(null);
    setVerificationResult(null);
    setAccessGranted(false);

    try {
      const { dataUrl, sizeKb } = await compressImage(file);
      setScreenshotDataUrl(dataUrl);
      setScreenshotFileName(file.name);
      setScreenshotSizeKb(sizeKb);

      // Run OCR extraction on the uploaded screenshot
      setIsRunningOcr(true);
      try {
        const ocr = await extractTransactionFromScreenshot(dataUrl);
        setOcrResult(ocr);

        // Auto-fill the transaction ID if extracted
        if (ocr.transactionId) {
          setTransactionIdInput(ocr.transactionId);
        }
      } catch (ocrErr: any) {
        console.warn('OCR extraction failed:', ocrErr);
        // Non-blocking — user can still type it manually
      } finally {
        setIsRunningOcr(false);
      }
    } catch (err: any) {
      console.error('Image compression error:', err);
      setErrorMsg('Could not read this screenshot. Try saving it as JPG or PNG and upload it again.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  // Auto-verify the transaction against Firestore 'transactions' collection
  const handleVerifyTransaction = async () => {
    if (!transactionIdInput.trim()) {
      setErrorMsg('Please enter a Transaction ID or upload a screenshot to extract it.');
      return;
    }

    if (!user) {
      onOpenAuth();
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);
    setErrorMsg(null);
    setAccessGranted(false);

    
    try {
      const result = await verifyTransactionInFirestore(
        transactionIdInput.trim(),
        selectedPackage.priceETB
      );
      setVerificationResult(result);

      // If verified, automatically grant access
      if (result.verified && result.firestoreDocId && user) {
        setIsGrantingAccess(true);
        try {
          const grantResult = await grantAccessAfterVerification(
            user.uid,
            result.transactionId,
            result.firestoreDocId,
            selectedPackage.id,
            result.firestoreCollection || 'transactions',
            result.firestoreDatabaseId
          );

          if (grantResult.success) {
            setAccessGranted(true);
            try {
              await refreshUserProfile();
            } catch (e) {
              console.warn('Profile refresh notice:', e);
            }

            // Also create a payment submission record for history
            const submission: Omit<PaymentSubmission, 'id'> = {
              userId: user.uid,
              userEmail: user.email || '',
              userName: userProfile?.name || user.displayName || 'Student',
              packageId: selectedPackage.id,
              packageName: selectedPackage.name,
              amountETB: selectedPackage.priceETB,
              receiverPhone: RECEIVER_PHONE,
              transactionId: result.transactionId,
              senderPhone: senderPhoneInput.trim() || '',
              screenshotUrl: screenshotDataUrl || '',
              status: 'approved',
              submittedAt: new Date().toISOString(),
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'auto_verification_sms',
              verifiedBy: 'webhook',
              webhookSentAt: new Date().toISOString(),
              webhookStatus: 'verified',
            };

            await addDoc(collection(db, 'paymentSubmissions'), submission);
          } else {
            setErrorMsg(grantResult.error || 'Verification succeeded but access could not be granted. Please contact support.');
          }
        } catch (grantErr: any) {
          console.error('Grant access error:', grantErr);
          setErrorMsg('Transaction verified but access grant failed. Please contact support.');
        } finally {
          setIsGrantingAccess(false);
        }
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setErrorMsg('Verification failed. You can still submit for manual review.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Fallback: manual submission for admin review (original flow)
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      onOpenAuth();
      return;
    }

    if (!screenshotDataUrl) {
      setErrorMsg('Please upload a screenshot of your Telebirr payment confirmation.');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = screenshotDataUrl;

      // Fast-timeout attempt for Cloud Storage (max 1.5s), otherwise fallback to lightweight compressed Data URL
      try {
        const uploadPromise = (async () => {
          const storagePath = `telebirr_receipts/${user.uid}_${Date.now()}_${screenshotFileName || 'receipt.jpg'}`;
          const storageRef = ref(storage, storagePath);
          await uploadString(storageRef, screenshotDataUrl, 'data_url');
          return await getDownloadURL(storageRef);
        })();

        const timeoutPromise = new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error('Storage timeout')), 1500)
        );

        finalImageUrl = await Promise.race([uploadPromise, timeoutPromise]);
      } catch (storageErr) {
        // Fallback directly to compressed data URL without blocking
        console.info('Using direct compressed image data URL for submission');
      }

      const finalTxId = transactionIdInput.trim() || `TB-${Date.now().toString().slice(-8)}`;
      const finalSenderPhone = senderPhoneInput.trim() || '';

      const submission: Omit<PaymentSubmission, 'id'> = {
        userId: user.uid,
        userEmail: user.email || '',
        userName: userProfile?.name || user.displayName || 'Student',
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        amountETB: selectedPackage.priceETB,
        receiverPhone: RECEIVER_PHONE,
        transactionId: finalTxId,
        senderPhone: finalSenderPhone,
        screenshotUrl: finalImageUrl,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        webhookSentAt: new Date().toISOString(),
        webhookStatus: 'sent'
      };

      const docRef = await addDoc(collection(db, 'paymentSubmissions'), submission);

      const savedSub: PaymentSubmission = {
        id: docRef.id,
        ...submission
      };

      // Automatically dispatch to Make.com verification webhook
      sendPaymentToWebhook(savedSub, 'payment_submitted', 'web_client')
        .then((res) => {
          if (res.success) {
            setWebhookSentNotice('Transaction dispatched to Make.com Telebirr webhook! Automated approval will trigger as soon as 127 SMS matches.');
          }
        })
        .catch((err) => {
          console.warn('Webhook dispatch caught:', err);
        });

      setSubmitSuccess(true);
      setScreenshotDataUrl(null);
      setScreenshotFileName('');
      setScreenshotSizeKb(0);
      setTransactionIdInput('');
      setSenderPhoneInput('');
      setOcrResult(null);
      setVerificationResult(null);

      setTimeout(() => {
        setSubmitSuccess(false);
        setWebhookSentNotice(null);
      }, 8000);
    } catch (err: any) {
      console.error('Error submitting payment:', err);
      setErrorMsg(err.message || 'Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualWebhookCheck = async (sub: PaymentSubmission) => {
    setVerifyingSubId(sub.id);
    setWebhookFeedback(null);
    try {
      const res = await sendPaymentToWebhook(sub, 'payment_recheck', 'web_client');
      if (res.success) {
        setWebhookFeedback({
          id: sub.id,
          message: 'Webhook checked! If matching 127 SMS was received, your exam access will update automatically in seconds.',
          isSuccess: true
        });
      } else {
        setWebhookFeedback({
          id: sub.id,
          message: res.error || 'Webhook pinged. Administrator manual verification is also active.',
          isSuccess: false
        });
      }
    } catch (e: any) {
      setWebhookFeedback({
        id: sub.id,
        message: 'Could not contact verification webhook. Admin manual review remains active.',
        isSuccess: false
      });
    } finally {
      setVerifyingSubId(null);
      setTimeout(() => setWebhookFeedback(null), 8000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-4 sm:space-y-6 animate-in fade-in">
      {/* Email Verification Banner */}
      <EmailVerificationNotice />

      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Pay for exam access
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Send payment, then verify your transaction.
        </p>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* LEFT COLUMN: Payment Instructions Box & Step-by-Step Guide (5 cols) */}
        <div className="lg:col-span-5">
          
          {/* Receiver Phone Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="text-sm font-semibold text-slate-900">Pay with Telebirr</div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4 space-y-2 text-center">
              <div className="text-xs text-slate-500">Send {selectedPackage.priceETB} ETB to</div>
              <div className="text-xl sm:text-3xl font-mono font-black text-amber-800 tracking-normal sm:tracking-wider break-all">
                {RECEIVER_PHONE}
              </div>
              <button
                type="button"
                onClick={handleCopyReceiver}
                className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition-all active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copied' : 'Copy number'}</span>
              </button>
            </div>

            <div className="text-xs text-slate-500">
              Account: <span className="text-slate-700">EthioExam Prep Service</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Upload Section & Submission Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Verify payment</h3>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Access Granted Success */}
            {accessGranted && (
              <div className="mb-5 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <Unlock className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm">🎉 Exam Access Unlocked!</span>
                </div>
                <p className="text-xs text-emerald-700 pl-7">
                  Your payment has been <strong>automatically verified</strong> and <strong>{selectedPackage.name}</strong> is now active! 
                  You can start your exams immediately.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('examCenter')}
                  className="ml-7 mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Go to Exam Center</span>
                </button>
              </div>
            )}

            {/* Manual Submit Success Message */}
            {submitSuccess && (
              <div className="mb-5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-emerald-800 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Telebirr Receipt Submitted for Admin Review!</span>
                </div>
                <p className="text-xs text-slate-600 pl-6">
                  Your payment screenshot has been submitted for admin verification. Access will unlock automatically within 5–60 minutes.
                </p>
                {webhookSentNotice && (
                  <div className="mt-2 pl-6 text-[11px] text-purple-700 font-medium flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                    <span>{webhookSentNotice}</span>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmitPayment} className="space-y-4">
              {/* Package Selection Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Exam Package to Unlock
                </label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => {
                    setSelectedPackageId(e.target.value);
                    setVerificationResult(null);
                    setAccessGranted(false);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-medium focus:outline-none focus:border-purple-600 transition-colors shadow-xs"
                >
                  {EXAM_PACKAGES.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — {pkg.priceETB} ETB ({pkg.category})
                    </option>
                  ))}
                </select>
                <div className="mt-2 text-xs text-slate-500">
                  {selectedPackage.priceETB} ETB · Includes {selectedPackage.category === 'ALL_ACCESS' ? 'all exams' : `${selectedPackage.category} exams`}
                </div>
              </div>

              {/* Transaction Screenshot Image Uploader with OCR */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload Payment Screenshot <span className="text-red-500">*</span>
                </label>

                {isProcessingImage ? (
                  <div className="p-5 bg-purple-50/50 border border-purple-200 rounded-lg flex items-center justify-center gap-2.5 text-purple-800 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <span className="font-medium">Optimizing receipt image...</span>
                  </div>
                ) : screenshotDataUrl ? (
                  <div className="relative p-3 bg-slate-50 border border-emerald-300 rounded-lg space-y-2.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={screenshotDataUrl}
                        alt="Receipt Preview"
                        className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {screenshotFileName || 'Telebirr_Receipt.jpg'}
                        </div>
                        <div className="text-[11px] text-emerald-700 mt-0.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Receipt Ready ({screenshotSizeKb > 0 ? `${screenshotSizeKb} KB` : 'Optimized'})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { 
                            setScreenshotDataUrl(null); 
                            setScreenshotFileName(''); 
                            setScreenshotSizeKb(0); 
                            setOcrResult(null);
                            setVerificationResult(null);
                            setAccessGranted(false);
                          }}
                          className="mt-1 text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Remove & Re-upload
                        </button>
                      </div>
                    </div>

                    {/* OCR Status */}
                    {isRunningOcr && (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                        <ScanLine className="w-3.5 h-3.5 animate-pulse text-blue-600" />
                        <span className="font-medium">Scanning screenshot for Transaction ID...</span>
                      </div>
                    )}

                    {ocrResult && !isRunningOcr && (
                      <div className={`flex items-center gap-2 p-2 rounded-lg text-xs border ${
                        ocrResult.transactionId 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                          : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}>
                        {ocrResult.transactionId ? (
                          <>
                            <ScanLine className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>
                              <strong>Extracted:</strong> Transaction ID <span className="font-mono font-bold">{ocrResult.transactionId}</span>
                              {ocrResult.amount && <> • Amount <span className="font-mono font-bold">{ocrResult.amount} ETB</span></>}
                              <span className="text-[10px] text-slate-500 ml-1">(Confidence: {Math.round(ocrResult.confidence)}%)</span>
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Could not auto-extract Transaction ID. Please enter it manually below.</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-lg p-5 text-center bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group"
                    onClick={() => document.getElementById('screenshotFileInput')?.click()}
                  >
                    <input
                      id="screenshotFileInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.currentTarget.value = '';
                        if (file) {
                          handleImageFile(file);
                        }
                      }}
                    />
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-purple-600 mx-auto mb-1.5 transition-colors" />
                    <div className="text-xs font-semibold text-slate-700">Upload payment screenshot</div>
                    <p className="text-[10px] text-slate-500 mt-0.5">JPG, PNG or WEBP · Up to 10 MB</p>
                  </div>
                )}
              </div>

              {/* Transaction ID Input + Verify Button */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Transaction ID</label>
                    <input
                      type="text"
                      value={transactionIdInput}
                      onChange={(e) => {
                        setTransactionIdInput(e.target.value.toUpperCase());
                        setVerificationResult(null);
                        setAccessGranted(false);
                      }}
                      placeholder="e.g. DH82M9EPFC"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-purple-600 transition-colors shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Sender phone (optional)</label>
                    <input
                      type="tel"
                      value={senderPhoneInput}
                      onChange={(e) => setSenderPhoneInput(e.target.value)}
                      placeholder="e.g. 0912345678"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-purple-600 transition-colors shadow-xs"
                    />
                  </div>
                </div>

                {/* Verification Result Display */}
                {verificationResult && !accessGranted && (
                  <div className={`p-3 rounded-lg border text-xs animate-in fade-in ${
                    verificationResult.verified 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : verificationResult.alreadyClaimed
                        ? 'bg-red-50 border-red-200 text-red-900'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}>
                    <div className="flex items-start gap-2">
                      {verificationResult.verified ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : verificationResult.alreadyClaimed ? (
                        <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <span>{verificationResult.message}</span>
                    </div>
                  </div>
                )}

                {/* Verify & Unlock Button */}
                <button
                  type="button"
                  onClick={handleVerifyTransaction}
                  disabled={isVerifying || isGrantingAccess || accessGranted || !transactionIdInput.trim()}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isGrantingAccess ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Granting Access...</span>
                    </>
                  ) : isVerifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying Transaction in System...</span>
                    </>
                  ) : accessGranted ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Access Granted — You're All Set!</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>⚡ Verify & Unlock Exam Access Instantly</span>
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}
              {!accessGranted && (
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px]">
                    <span className="bg-white px-3 text-slate-400 font-medium">
                      OR submit for manual admin review
                    </span>
                  </div>
                </div>
              )}

              {/* Submit for Manual Review Button (fallback) */}
              {!accessGranted && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading & Submitting to Admin Queue...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Submit for Manual Review ({selectedPackage.priceETB} ETB)</span>
                    </>
                  )}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* 3. My Previous Payment Submissions Tracker */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>My Telebirr Submissions History</span>
            </h3>
            <p className="text-xs text-slate-500">
              Track the verification status of all your submitted transaction receipts.
            </p>
          </div>
          <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-mono font-medium">
            {mySubmissions.length} Record{mySubmissions.length === 1 ? '' : 's'}
          </span>
        </div>

        {webhookFeedback && (
          <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 animate-in fade-in ${
            webhookFeedback.isSuccess 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{webhookFeedback.message}</span>
            </div>
            <button
              onClick={() => setWebhookFeedback(null)}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {mySubmissions.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-2">
            <CreditCard className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500">No payment submissions found for your account yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Package</th>
                  <th className="py-2.5 px-3 font-bold">Amount</th>
                  <th className="py-2.5 px-3 font-bold">Transaction / Phone</th>
                  <th className="py-2.5 px-3 font-bold">Date Submitted</th>
                  <th className="py-2.5 px-3 font-bold">Approval Status</th>
                  <th className="py-2.5 px-3 font-bold">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mySubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-800">{sub.packageName}</td>
                    <td className="py-2.5 px-3 font-mono text-amber-700 font-bold">{sub.amountETB} ETB</td>
                    <td className="py-2.5 px-3">
                      <div className="font-mono text-slate-800 font-bold">{sub.transactionId}</div>
                      {sub.senderPhone && (
                        <div className="text-[10px] text-slate-500 font-mono">From: {sub.senderPhone}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3">
                      {sub.status === 'approved' && (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Approved &amp; Unlocked</span>
                          </span>
                          <span className="text-[9px] text-slate-500 block font-medium">
                            {sub.reviewedBy?.includes('webhook') || sub.reviewedBy?.includes('auto_verification') 
                              ? '⚡ Auto-Verified (SMS)' 
                              : '✓ Verified by Admin'}
                          </span>
                        </div>
                      )}
                      {sub.status === 'pending' && (
                        <div className="space-y-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Under Verification</span>
                          </span>
                          <div>
                            <button
                              type="button"
                              onClick={() => handleManualWebhookCheck(sub)}
                              disabled={verifyingSubId === sub.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-bold transition-colors disabled:opacity-50"
                              title="Trigger Make.com automated verification"
                            >
                              {verifyingSubId === sub.id ? (
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              ) : (
                                <RefreshCw className="w-2.5 h-2.5" />
                              )}
                              <span>Check Webhook</span>
                            </button>
                          </div>
                        </div>
                      )}
                      {sub.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-800 border border-red-200" title={sub.rejectionReason}>
                          <XCircle className="w-3 h-3 text-red-600" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {sub.screenshotUrl && (
                        <a
                          href={sub.screenshotUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-purple-600 hover:underline font-medium"
                        >
                          <ImageIcon className="w-3 h-3" />
                          <span>View Image</span>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
