import React from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  CreditCard, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, extraData?: any) => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onOpenAuthModal?: () => void;
}

import { motion } from 'motion/react';

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  onNavigate, 
  onOpenAuth, 
  onOpenAuthModal 
}) => {
  const { user, userProfile, isEmailVerified, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    if (onOpenAuth) {
      onOpenAuth(mode);
    } else if (onOpenAuthModal) {
      onOpenAuthModal();
    }
  };

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-xs"
    >
      {/* Top Notification Bar if Email Unverified */}
      {user && !isEmailVerified && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-medium">Email verification pending. Verify to unlock Telebirr payments and exam certificates.</span>
            <button 
              onClick={() => handleNav('profile')} 
              className="underline font-bold text-amber-900 hover:text-amber-700 transition-colors ml-1"
            >
              Verify Now
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav('landing')}>
            <img src="/logo.png" alt="Melmeja Logo" className="w-30  object-contain rounded-lg shadow-xs" />
            
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleNav('hub')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentView === 'hub' 
                  ? 'bg-slate-100 text-slate-900 border border-slate-200 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exams</span>
            </button>

            <button
              onClick={() => handleNav('payment')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentView === 'payment' 
                  ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-600" />
              <span>Payment</span>
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-all text-xs cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    {userProfile?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xs leading-none text-slate-800">
                      {userProfile?.name || 'Student Account'}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <span className="text-emerald-700 font-medium">Student</span>
                      {isEmailVerified && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    </div>
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Signed in as</p>
                      <p className="text-xs font-semibold text-slate-800 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => handleNav('profile')}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>My Profile & Attempts</span>
                    </button>

                    <button
                      onClick={() => handleNav('payment')}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                      <span>Telebirr Submissions</span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={async () => {
                        await signOut();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="navbar-sign-in-btn"
                  onClick={() => handleOpenAuth('login')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sign In / Register</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center gap-2">
            {user ? (
              <button
                onClick={() => handleNav('profile')}
                className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs"
              >
                {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
              </button>
            ) : (
              <button
                id="navbar-mobile-sign-in-btn"
                onClick={() => handleOpenAuth('login')}
                className="px-2.5 py-1 text-xs font-bold bg-emerald-600 text-white rounded-lg cursor-pointer"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-5 space-y-1 shadow-md">
          <button
            onClick={() => handleNav('hub')}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Exam Center Hub</span>
          </button>

          <button
            onClick={() => handleNav('payment')}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5"
          >
            <CreditCard className="w-4 h-4 text-amber-600" />
            <span>Telebirr Payment</span>
          </button>

          {user && (
            <>
              <button
                onClick={() => handleNav('profile')}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <UserIcon className="w-4 h-4 text-emerald-600" />
                <span>My Profile & Attempts</span>
              </button>

              <button
                onClick={async () => {
                  await signOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </>
          )}
        </div>
      )}
    </motion.header>
  );
};
