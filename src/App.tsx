import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExamProvider, useExam } from './context/ExamContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './pages/LandingPage';
import { ExamCenterHub } from './pages/ExamCenterHub';
import { LiveExamWorkspace } from './pages/LiveExamWorkspace';
import { ExamResultsPage } from './pages/ExamResultsPage';
import { PaymentPage } from './pages/PaymentPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';

function AppContent() {
  const { user, isAdmin, userProfile, hasExamAccess } = useAuth();
  const { currentExam, exitExamToHub } = useExam();

  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/admin' || path.startsWith('/admin')) return 'admin';
      if (path === '/hub' || path.startsWith('/hub')) return 'hub';
      if (path === '/payment' || path.startsWith('/payment')) return 'payment';
      if (path === '/profile' || path.startsWith('/profile')) return 'profile';
    }
    return 'landing';
  });
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [navigationExtra, setNavigationExtra] = useState<any>(null);

  // Sync route with browser history back/forward and initial path
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin' || path.startsWith('/admin')) {
        setCurrentView('admin');
      } else if (path === '/hub') {
        setCurrentView('hub');
      } else if (path === '/payment') {
        setCurrentView('payment');
      } else if (path === '/profile') {
        setCurrentView('profile');
      } else {
        setCurrentView('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // If user is inside an active exam, stay in workspace
  useEffect(() => {
    if (currentExam && currentView !== 'workspace' && currentView !== 'results') {
      setCurrentView('workspace');
    }
  }, [currentExam]);

  // Real-time access guard: if user's access is revoked while they are mid-exam, eject immediately
  useEffect(() => {
    if (currentExam && !isAdmin) {
      const stillHasAccess = hasExamAccess(currentExam.id, false, currentExam.packageRequired);
      if (!stillHasAccess) {
        exitExamToHub();
        setCurrentView('hub');
      }
    }
  }, [userProfile, currentExam, isAdmin]);

  const handleNavigate = (view: string, extraData?: any) => {
    setNavigationExtra(extraData || null);
    setCurrentView(view);
    
    // Update browser URL path
    const targetPath = view === 'landing' ? '/' : `/${view}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white antialiased">
      {/* Hide standard navbar when in live examination workspace to maintain focus mode */}
      {currentView !== 'workspace' && (
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === 'hub' && (
          <ExamCenterHub
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
            initialCategory={navigationExtra?.initialCategory}
            initialSelectedExamId={navigationExtra?.initialSelectedExamId}
          />
        )}

        {currentView === 'workspace' && (
          <LiveExamWorkspace
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'results' && (
          <ExamResultsPage
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'payment' && (
          <PaymentPage
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
            preselectedPackageId={navigationExtra?.preselectedPackageId}
          />
        )}

        {currentView === 'profile' && (
          <UserProfilePage
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Hide footer when in live exam workspace */}
      {currentView !== 'workspace' && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authInitialMode}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ExamProvider>
        <AppContent />
      </ExamProvider>
    </AuthProvider>
  );
}
