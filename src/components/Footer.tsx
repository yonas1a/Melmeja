import React from 'react';
import { GraduationCap, Phone, ShieldCheck, Mail, Sparkles, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('landing')}>
              <img src="/logo.png" alt="Melmeja Logo" className="w-8 h-8 object-contain rounded-lg shadow-xs" />
              <span className="font-bold text-base text-slate-900 tracking-tight">Melmeja Prep</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              The premier national standardized examination preparation system for Ethiopian students aiming for NGAT, GAT, MoE Exit Exams, and University Entrance.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Addis Ababa, Ethiopia</span>
            </div>
          </div>

          {/* Exam Programs */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Exam Categories</h4>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>
                <button onClick={() => onNavigate('hub')} className="hover:text-purple-700 transition-colors">
                  NGAT Graduate Admission (Verbal & Quant)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('hub')} className="hover:text-purple-700 transition-colors">
                  AAU GAT National Prep
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('hub')} className="hover:text-purple-700 transition-colors">
                  MoE Exit Exam: Law & Jurisprudence
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('hub')} className="hover:text-purple-700 transition-colors">
                  MoE Exit Exam: Computer Science & IT
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('hub')} className="hover:text-purple-700 transition-colors">
                  MoE Exit Exam: Medicine & Health
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('hub')} className="hover:text-purple-700 transition-colors">
                  Grade 12 EUEE Natural & Social Science
                </button>
              </li>
            </ul>
          </div>

          {/* Telebirr & Payments */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>Telebirr Payment</span>
              <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200 font-bold">Official</span>
            </h4>
            <p className="text-xs text-slate-500 mb-2.5">
              Direct and manual verification via Telebirr mobile transfer for all regional candidates.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1">
              <div className="text-[10px] text-slate-500 font-medium">Receiver Phone Number:</div>
              <div className="font-mono text-xs font-bold text-amber-800 tracking-wider">
                +251963155856
              </div>
              <div className="text-[10px] text-slate-400">
                Active 7 days/week (Fast 5–15 min approvals)
              </div>
            </div>
          </div>

          {/* Platform Standards */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Platform Standards</h4>
            <div className="flex items-start gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span>Aligned 100% with FDRE Ministry of Education blueprint competencies.</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
              <span>Full timer countdown, question flag palette, and detailed explanations.</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-slate-500">
              <Mail className="w-3.5 h-3.5 text-purple-600 mt-0.5 shrink-0" />
              <span>Support: yayele492@gmail.com</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} Melmeja Prep Platform. Built for Ethiopian Academic Excellence.</p>
          <div className="flex items-center gap-4">
            <span>Powered by Firebase Auth & Firestore</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for Ethiopia
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
