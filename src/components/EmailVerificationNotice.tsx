import React, { useState } from 'react';
import { Mail, CheckCircle2, RefreshCw, AlertTriangle, Sparkles, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const EmailVerificationNotice: React.FC = () => {
  const { user, isEmailVerified, sendVerificationEmail, verifyEmailManually, refreshUserProfile } = useAuth();
  const [resending, setResending] = useState(false);
  const [sentNotice, setSentNotice] = useState(false);
  const [verifying, setVerifying] = useState(false);

  if (!user || isEmailVerified) {
    return null;
  }

  const handleResend = async () => {
    setResending(true);
    try {
      await sendVerificationEmail();
      setSentNotice(true);
      setTimeout(() => setSentNotice(false), 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setResending(false);
    }
  };

  const handleManualSimulationVerify = async () => {
    setVerifying(true);
    try {
      await verifyEmailManually();
      await refreshUserProfile();
    } catch (e) {
      console.error(e);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 sm:p-4 shadow-xs mb-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 border border-amber-200">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                Email Verification Required for {user.email}
              </h4>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                Action Required
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
              To prevent fraudulent Telebirr claims and unlock official exam participation & certificates, please click the verification link sent to your inbox.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleResend}
            disabled={resending}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3 h-3 text-amber-600" />
            <span>{resending ? 'Sending...' : 'Resend Link'}</span>
          </button>

          {/* Quick Instant Verification button for sandbox testing */}
          <button
            onClick={handleManualSimulationVerify}
            disabled={verifying}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
            title="Simulate / Verify Instantly"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            <span>{verifying ? 'Verifying...' : 'Verify Now (1-Click)'}</span>
          </button>
        </div>
      </div>

      {sentNotice && (
        <div className="mt-2.5 pt-2.5 border-t border-amber-200 text-xs text-emerald-800 flex items-center gap-1.5 animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Verification email successfully sent! Please check your spam/junk folder as well.</span>
        </div>
      )}
    </div>
  );
};
