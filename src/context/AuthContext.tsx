import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  getDocs,
  collection,
  query,
  where,
  FirebaseUser 
} from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { EXAM_PACKAGES, INITIAL_EXAMS, LEGACY_PACKAGE_ALIASES } from '../data/examsData';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isEmailVerified: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  verifyEmailManually: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  switchRoleDemo: (role: UserRole) => Promise<void>;
  hasExamAccess: (examId: string, isFree?: boolean, packageRequired?: string, examCategory?: string) => boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Listen to Firebase Auth state
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Fetch or listen to Firestore user document
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        unsubscribeSnapshot = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            
            // Sync verified status if currentUser was verified via link
            if (currentUser.emailVerified && !data.emailVerified) {
              try {
                await updateDoc(userDocRef, { emailVerified: true });
                data.emailVerified = true;
              } catch (e) {
                console.warn('Could not sync emailVerified:', e);
              }
            }

            // STRICT ROLE NORMALIZATION:
            // Only yayele492@gmail.com is ever granted the 'admin' role.
            // Any other account is strictly normalized to 'student'.
            const isMasterAdmin = (currentUser.email && currentUser.email.toLowerCase() === 'yayele492@gmail.com') ||
                                  (data.email && data.email.toLowerCase() === 'yayele492@gmail.com');
            if (isMasterAdmin) {
              data.role = 'admin';
            } else {
              data.role = 'student';
            }

            data.paidPackages = data.paidPackages || [];
            data.allowedExams = data.allowedExams || [];

            setUserProfile(data);
          } else {
            const isAdminEmail = currentUser.email?.toLowerCase() === 'yayele492@gmail.com';
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Student',
              email: currentUser.email || '',
              authProvider: currentUser.providerData.some(p => p.providerId === 'google.com') ? 'google' : 'password',
              emailVerified: currentUser.emailVerified || currentUser.providerData.some(p => p.providerId === 'google.com'),
              role: isAdminEmail ? 'admin' : 'student',
              paidPackages: isAdminEmail ? ['ALL_IN_ONE'] : [],
              allowedExams: [],
              createdAt: new Date().toISOString()
            };

            try {
              await setDoc(userDocRef, newProfile);
              setUserProfile(newProfile);
            } catch (err) {
              console.error('Error creating user profile in Firestore:', err);
              // Fallback to local profile state
              setUserProfile(newProfile);
            }
          }
          setLoading(false);
        }, (error) => {
          console.error('Firestore user snapshot error:', error);
          // Fallback basic user profile if firestore read fails
          if (!userProfile) {
            setUserProfile({
              uid: currentUser.uid,
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Student',
              email: currentUser.email || '',
              authProvider: 'google',
              emailVerified: true,
              role: 'student',
              paidPackages: [],
              allowedExams: [],
              createdAt: new Date().toISOString()
            });
          }
          setLoading(false);
        });
      } else {
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
        }
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  // 1. Google Sign In
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedUser = result.user;

      const userDocRef = doc(db, 'users', loggedUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        const newProfile: UserProfile = {
          uid: loggedUser.uid,
          name: loggedUser.displayName || 'Student',
          email: loggedUser.email || '',
          authProvider: 'google',
          emailVerified: true, // Google SSO auto-sets emailVerified: true
          role: 'student',
          paidPackages: [],
          allowedExams: [],
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      throw err;
    }
  };

  // 2. Email & Password Sign Up
  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = result.user;
      
      // Trigger verification email
      try {
        await sendEmailVerification(newUser);
      } catch (e) {
        console.warn('Could not send verification email immediately:', e);
      }

      const newProfile: UserProfile = {
        uid: newUser.uid,
        name: name.trim() || email.split('@')[0],
        email: email.trim(),
        authProvider: 'password',
        emailVerified: false,
        role: 'student',
        paidPackages: [],
        allowedExams: [],
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', newUser.uid), newProfile);
      setUserProfile(newProfile);
    } catch (err: any) {
      console.error('Sign up with email failed:', err);
      throw err;
    }
  };

  // 3. Email & Password Sign In
  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      console.error('Sign in with email failed:', err);
      throw err;
    }
  };

  // 4. Send Email Verification
  const sendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  // 5. Verify Email Manually (e.g. OTP validation or simulation)
  const verifyEmailManually = async () => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { emailVerified: true });
      if (userProfile) {
        setUserProfile({ ...userProfile, emailVerified: true });
      }
    } catch (e) {
      console.error('Error verifying email:', e);
    }
  };

  // 6. Reset Password
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // 7. Sign Out
  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  // 8. Demo Role Switcher — Secured: disabled in production for security
  const switchRoleDemo = async (_role: UserRole) => {
    console.warn('Role switching is disabled for security.');
  };

  // 9. Check Exam Access Permission — Category-based access & strict verification
  const hasExamAccess = (examId: string, _isFree?: boolean, packageRequired?: string, examCategory?: string): boolean => {
    // Must be logged in
    if (!user || !userProfile) return false;

    // Verified Admin always has full access
    if (user.email?.toLowerCase() === 'yayele492@gmail.com' || userProfile.email?.toLowerCase() === 'yayele492@gmail.com') {
      return true;
    }

    // Check if explicitly in allowedExams list
    if (userProfile.allowedExams?.includes(examId)) return true;

    // Check ALL_IN_ONE master VIP package
    if (userProfile.paidPackages?.includes('ALL_IN_ONE')) return true;

    // Resolve exam details for category-based check
    const examObj = INITIAL_EXAMS.find(e => e.id === examId);
    const cat = examCategory || examObj?.category;
    const effectivePackage = packageRequired || examObj?.packageRequired;

    // Check required package directly or through legacy aliases
    if (effectivePackage) {
      if (userProfile.paidPackages?.includes(effectivePackage)) return true;
      const alias = LEGACY_PACKAGE_ALIASES[effectivePackage];
      if (alias && userProfile.paidPackages?.includes(alias)) return true;
    }

    // CATEGORY-BASED UNLOCK:
    // A single payment for a category unlocks ALL exams within that category!
    if (cat === 'GRADE_9') {
      if (userProfile.paidPackages?.some(p => p === 'GRADE_9_ALL' || p === 'GRADE_9_PACK' || p === 'GRADE_9')) return true;
    } else if (cat === 'GRADE_10') {
      if (userProfile.paidPackages?.some(p => p === 'GRADE_10_ALL' || p === 'GRADE_10_PACK' || p === 'GRADE_10')) return true;
    } else if (cat === 'GRADE_11') {
      if (userProfile.paidPackages?.some(p => p === 'GRADE_11_ALL' || p === 'GRADE_11_PACK' || p === 'GRADE_11')) return true;
    } else if (cat === 'GRADE_12' || cat === 'ENTRANCE') {
      if (userProfile.paidPackages?.some(p => 
        p === 'GRADE_12_ALL' || p === 'GRADE_12_PACK' || p === 'ENTRANCE_EUEE' || 
        p === 'ENTRANCE_ALL' || p === 'GRADE_12' || p === 'ENTRANCE'
      )) return true;
    } else if (cat === 'GAT') {
      if (userProfile.paidPackages?.some(p => p === 'GAT_ALL' || p === 'GAT_BASIC' || p === 'GAT_PREM' || p === 'AAU_GAT' || p === 'GAT')) return true;
    } else if (cat === 'NGAT') {
      if (userProfile.paidPackages?.some(p => p === 'NGAT_ALL' || p === 'NGAT_PREM' || p === 'NGAT_MOCK_01' || p === 'NGAT_MOCK_02' || p === 'NGAT')) return true;
    } else if (cat === 'EXIT') {
      if (userProfile.paidPackages?.some(p => p === 'EXIT_ALL' || p === 'EXIT_CS' || p === 'EXIT_LAW' || p === 'EXIT_MED' || p === 'EXIT_ACC' || p === 'EXIT')) return true;
    }

    // Check any paid package that includes this examId
    const matchingPackage = EXAM_PACKAGES.find(pkg =>
      userProfile.paidPackages?.includes(pkg.id) && pkg.includedExamIds.includes(examId)
    );
    if (matchingPackage) return true;

    // No valid grant found — deny access
    return false;
  };

  const refreshUserProfile = async () => {
    if (!user) return;
    try {
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      }
    } catch (e) {
      console.warn('Error refreshing profile:', e);
    }
  };

  const isEmailVerified = Boolean(
    user?.emailVerified || 
    userProfile?.emailVerified || 
    userProfile?.authProvider === 'google'
  );

  // Strict Admin identity verification: only yayele492@gmail.com
  const isAdmin = Boolean(
    (user?.email && user.email.toLowerCase() === 'yayele492@gmail.com') ||
    (userProfile?.email && userProfile.email.toLowerCase() === 'yayele492@gmail.com')
  );

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      isAdmin,
      isEmailVerified,
      signInWithGoogle,
      signUpWithEmail,
      signInWithEmail,
      sendVerificationEmail,
      verifyEmailManually,
      resetPassword,
      signOut,
      switchRoleDemo,
      hasExamAccess,
      refreshUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
