import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'signup' | 'login' | 'register';
  initialMode?: 'signin' | 'signup' | 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialTab,
  initialMode 
}) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();

  const getEffectiveTab = (): 'signin' | 'signup' | 'forgot' => {
    const mode = initialMode || initialTab;
    if (mode === 'signup' || mode === 'register') return 'signup';
    return 'signin';
  };

  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>(getEffectiveTab());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Update tab when modal opens or initialMode changes
  React.useEffect(() => {
    if (isOpen) {
      setTab(getEffectiveTab());
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode, initialTab]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setErrorMsg('Unauthorized Domain: Please add your current domain (e.g., localhost) to Firebase Console -> Authentication -> Settings -> Authorized Domains.');
      } else {
        setErrorMsg(err.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (tab === 'signin') {
        if (!email || !password) {
          setErrorMsg('Please provide both email and password.');
          setLoading(false);
          return;
        }
        await signInWithEmail(email, password);
        onClose();
      } else if (tab === 'signup') {
        if (!email || !password || !name) {
          setErrorMsg('Please complete all required fields.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, name);
        setSuccessMsg('Account created! A verification link has been sent to your email.');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else if (tab === 'forgot') {
        if (!email) {
          setErrorMsg('Please enter your registered email address.');
          setLoading(false);
          return;
        }
        await resetPassword(email);
        setSuccessMsg('Password reset link sent to your email inbox.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setErrorMsg('Unauthorized Domain: Please add your current domain/IP to Firebase Console -> Authentication -> Settings -> Authorized Domains.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password credentials.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('This email address is already registered. Please sign in.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('Email/Password sign-in is currently disabled in your Firebase project. Please click "Continue with Google" above or enable Email/Password in your Firebase Console (Authentication > Sign-in method).');
      } else {
        setErrorMsg(err.message || 'Authentication error. Please check your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
        {/* Header decoration */}
        <div className="h-1 bg-purple-600"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 sm:p-6">
          {/* Brand header */}
          <div className="text-center mb-5">
            <img src="/logo.png" alt="Melmeja Logo" className="w-10 h-10 mx-auto object-contain rounded-lg mb-2.5 shadow-xs" />
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {tab === 'signin' && 'Sign in to Melmeja'}
              {tab === 'signup' && 'Create your Student Account'}
              {tab === 'forgot' && 'Reset your Password'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Prepare for NGAT, GAT, EXIT & Entrance Exams
            </p>
          </div>

          {/* Google SSO Button */}
          {tab !== 'forgot' && (
            <div className="space-y-3 mb-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-2 px-4 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs border border-slate-200 transition-all shadow-xs active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google (Auto-Verified)</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-2.5 text-[10px] uppercase tracking-wider text-slate-400 absolute font-semibold">
                  or email & password
                </span>
              </div>
            </div>
          )}

          {/* Feedback messages */}
          {errorMsg && (
            <div className="mb-3.5 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-3.5 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Abebe Bikila"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-purple-600 transition-colors shadow-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-purple-600 transition-colors shadow-xs"
                />
              </div>
            </div>

            {tab !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">Password</label>
                  {tab === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setTab('forgot')}
                      className="text-[11px] text-purple-700 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-purple-600 transition-colors shadow-xs"
                  />
                </div>
                {tab === 'signup' && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    An email verification link/OTP will be sent automatically.
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-2 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>
                    {tab === 'signin' && 'Sign In to Workspace'}
                    {tab === 'signup' && 'Register & Send Verification'}
                    {tab === 'forgot' && 'Send Reset Email'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Switch tabs footer */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 text-center text-xs text-slate-500">
            {tab === 'signin' && (
              <p>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => {
                    setTab('signup');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-purple-700 font-semibold hover:underline cursor-pointer"
                >
                  Create Student Account
                </button>
              </p>
            )}

            {tab === 'signup' && (
              <p>
                Already registered?{' '}
                <button
                  onClick={() => {
                    setTab('signin');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-purple-700 font-semibold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            )}

            {tab === 'forgot' && (
              <p>
                Remembered your password?{' '}
                <button
                  onClick={() => {
                    setTab('signin');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-purple-700 font-semibold hover:underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
