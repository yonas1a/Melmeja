import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Copy, 
  Check, 
  FileText, 
  PhoneCall, 
  Image as ImageIcon, 
  Sparkles, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EXAM_PACKAGES } from '../data/examsData';
import { PaymentSubmission, ExamPackage } from '../types';
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
  const { user, userProfile, isEmailVerified } = useAuth();

  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    preselectedPackageId || 'NGAT_PREM'
  );
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState<string>('');
  const [screenshotSizeKb, setScreenshotSizeKb] = useState<number>(0);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  // Fast client-side image compressor: scales any high-res mobile screenshot to ~50-90KB
  const compressImage = (file: File): Promise<{ dataUrl: string; sizeKb: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 900;
          const maxHeight = 900;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            const rawUrl = e.target?.result as string;
            resolve({ dataUrl: rawUrl, sizeKb: Math.round(rawUrl.length / 1024) });
            return;
          }

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.75);
          const sizeKb = Math.round((compressed.length * 3) / 4 / 1024);
          resolve({ dataUrl: compressed, sizeKb });
        };
        img.onerror = () => {
          const rawUrl = e.target?.result as string;
          resolve({ dataUrl: rawUrl, sizeKb: Math.round(rawUrl.length / 1024) });
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  };

  // Image Upload handler (File picker & Drag and drop)
  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
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

    try {
      const { dataUrl, sizeKb } = await compressImage(file);
      setScreenshotDataUrl(dataUrl);
      setScreenshotFileName(file.name);
      setScreenshotSizeKb(sizeKb);
    } catch (err: any) {
      console.error('Image compression error:', err);
      setErrorMsg('Failed to process image. Please try a different screenshot.');
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

      const generatedTxId = `TB-${Date.now().toString().slice(-8)}`;

      const submission: Omit<PaymentSubmission, 'id'> = {
        userId: user.uid,
        userEmail: user.email || '',
        userName: userProfile?.name || user.displayName || 'Student',
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        amountETB: selectedPackage.priceETB,
        receiverPhone: RECEIVER_PHONE,
        transactionId: generatedTxId,
        screenshotUrl: finalImageUrl,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'paymentSubmissions'), submission);

      setSubmitSuccess(true);
      setScreenshotDataUrl(null);
      setScreenshotFileName('');
      setScreenshotSizeKb(0);

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 7000);
    } catch (err: any) {
      console.error('Error submitting payment:', err);
      setErrorMsg(err.message || 'Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in">
      {/* Email Verification Banner */}
      <EmailVerificationNotice />

      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Telebirr Verified Gateway
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Telebirr Payment & Exam Package Activation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Follow the step-by-step transfer guide below, submit your Telebirr Transaction ID and screenshot, and start your exam preparation.
        </p>
      </div>

      {/* Alert Notice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-xs">
        <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900">
          <strong className="text-amber-950 font-bold block mb-0.5">
            Notice: Approval may take from 5 minutes to an hour. Access will update automatically.
          </strong>
          <span>
            Once our verification team confirms your Telebirr transaction receipt, your exam access badges will automatically turn green to <strong>"Available"</strong> across all devices.
          </span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Payment Instructions Box & Step-by-Step Guide (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Receiver Phone Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Official Telebirr Merchant
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                Active 24/7
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1.5 text-center">
              <div className="text-[11px] text-slate-500 font-medium">Receiver Phone Number:</div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-amber-800 tracking-wider">
                {RECEIVER_PHONE}
              </div>
              <button
                type="button"
                onClick={handleCopyReceiver}
                className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition-all active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copied Number!' : 'Copy Phone Number'}</span>
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-0.5">
              <div className="font-semibold text-slate-900">Registered Account Name:</div>
              <div className="text-slate-500 text-[11px]">EthioExam Prep Service / National Academic Hub</div>
            </div>
          </div>

          {/* Step-by-Step Transfer Guide */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>Step-by-Step Telebirr Guide</span>
            </h3>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-slate-900 block">Initiate Transfer</strong>
                  Dial <span className="font-mono text-purple-700 font-bold">*127#</span> on your mobile or launch the <strong>Telebirr App</strong>.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <strong className="text-slate-900 block">Send Money</strong>
                  Select <strong>Send Money</strong> and enter receiver: <span className="font-mono text-purple-700 font-bold">+251963155856</span>.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <strong className="text-slate-900 block">Enter Package Price</strong>
                  Enter the exact amount in ETB for your desired package (e.g. 350 ETB) and confirm with PIN.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold flex items-center justify-center shrink-0">4</span>
                <div>
                  <strong className="text-slate-900 block">Capture & Upload Screenshot</strong>
                  Save the Telebirr success SMS / screen receipt and upload the screenshot image on the form.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Upload Section & Submission Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-0.5">
              Submit Transaction Verification
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Select your package and upload your Telebirr screenshot receipt. No manual codes needed!
            </p>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Message */}
            {submitSuccess && (
              <div className="mb-5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-emerald-800 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Telebirr Receipt Received Successfully!</span>
                </div>
                <p className="text-xs text-slate-600 pl-6">
                  Your payment screenshot has been submitted for admin verification. Access will unlock automatically within 5–60 minutes.
                </p>
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
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-medium focus:outline-none focus:border-purple-600 transition-colors shadow-xs"
                >
                  {EXAM_PACKAGES.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — {pkg.priceETB} ETB ({pkg.category})
                    </option>
                  ))}
                </select>
                <div className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Amount Transferred: <strong className="text-amber-800 font-bold">{selectedPackage.priceETB} ETB</strong></span>
                </div>
              </div>

              {/* Transaction Screenshot Image Uploader */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload Payment Screenshot Receipt <span className="text-red-500">*</span>
                </label>

                {isProcessingImage ? (
                  <div className="p-5 bg-purple-50/50 border border-purple-200 rounded-lg flex items-center justify-center gap-2.5 text-purple-800 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <span className="font-medium">Optimizing receipt image for instant upload...</span>
                  </div>
                ) : screenshotDataUrl ? (
                  <div className="relative p-3 bg-slate-50 border border-emerald-300 rounded-lg flex items-center gap-3">
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
                        onClick={() => { setScreenshotDataUrl(null); setScreenshotFileName(''); setScreenshotSizeKb(0); }}
                        className="mt-1 text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove & Re-upload
                      </button>
                    </div>
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
                        if (e.target.files && e.target.files[0]) {
                          handleImageFile(e.target.files[0]);
                        }
                      }}
                    />
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-purple-600 mx-auto mb-1.5 transition-colors" />
                    <div className="text-xs font-semibold text-slate-700">
                      Click to upload or drag & drop screenshot
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Supports JPG, PNG, WEBP (Phone screenshots auto-compressed)
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading & Submitting to Verification Queue...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Submit Telebirr Payment ({selectedPackage.priceETB} ETB)</span>
                  </>
                )}
              </button>
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
                  <th className="py-2.5 px-3 font-bold">Transaction ID</th>
                  <th className="py-2.5 px-3 font-bold">Date Submitted</th>
                  <th className="py-2.5 px-3 font-bold">Status</th>
                  <th className="py-2.5 px-3 font-bold">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mySubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-800">{sub.packageName}</td>
                    <td className="py-2.5 px-3 font-mono text-amber-700 font-bold">{sub.amountETB} ETB</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{sub.transactionId}</td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3">
                      {sub.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Approved & Unlocked</span>
                        </span>
                      )}
                      {sub.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Under Verification</span>
                        </span>
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
