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
import { EXAM_PACKAGES } from '../data/examsData';

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
  hasExamAccess: (examId: string, isFree?: boolean, packageRequired?: string) => boolean;
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

            // Ensure role is normalized to student for standard accounts unless admin
            if (data.role !== 'admin' && data.email !== 'yayele492@gmail.com') {
              if (data.role !== 'student') {
                data.role = 'student';
              }
            }

            data.paidPackages = data.paidPackages || [];
            data.allowedExams = data.allowedExams || [];

            setUserProfile(data);
          } else {
            // Document doesn't exist yet, create default student profile with NO free or auto-unlocked exams
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Student',
              email: currentUser.email || '',
              authProvider: currentUser.providerData.some(p => p.providerId === 'google.com') ? 'google' : 'password',
              emailVerified: currentUser.emailVerified || currentUser.providerData.some(p => p.providerId === 'google.com'),
              role: 'student',
              paidPackages: [],
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

  // 8. Demo Role Switcher (Student <-> Admin for easy developer testing)
  const switchRoleDemo = async (role: UserRole) => {
    if (!user || !userProfile) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const isNowAdmin = role === 'admin';
      const allExams = [
        'ngat_mock_01', 'ngat_mock_02', 'gat_mock_01', 
        'exit_cs_2026', 'exit_law_2026', 'exit_med_2026', 'euee_nat_sci_2026'
      ];
      
      let targetPaidPackages: string[] = [];
      let targetAllowedExams: string[] = [];

      if (isNowAdmin) {
        targetPaidPackages = ['ALL_IN_ONE'];
        targetAllowedExams = allExams;
      } else {
        // Fetch actual approved submissions if returning to student
        const approvedSnap = await getDocs(
          query(
            collection(db, 'paymentSubmissions'),
            where('userId', '==', user.uid),
            where('status', '==', 'approved')
          )
        );
        approvedSnap.forEach(d => {
          const pData = d.data() as any;
          if (pData.packageId) {
            targetPaidPackages.push(pData.packageId);
            const targetPkg = EXAM_PACKAGES.find(p => p.id === pData.packageId);
            if (targetPkg) {
              targetPkg.includedExamIds.forEach(id => {
                if (!targetAllowedExams.includes(id)) targetAllowedExams.push(id);
              });
            }
          }
        });
      }

      const updateData = {
        role,
        paidPackages: targetPaidPackages,
        allowedExams: targetAllowedExams
      };

      await updateDoc(userDocRef, updateData);
      setUserProfile({
        ...userProfile,
        ...updateData
      });
    } catch (e) {
      console.error('Error updating role:', e);
    }
  };

  // 9. Check Exam Access Permission — STRICT: only allow if explicitly granted
  const hasExamAccess = (examId: string, _isFree?: boolean, packageRequired?: string): boolean => {
    // Must be logged in
    if (!user || !userProfile) return false;

    // Admin always has full access
    if (userProfile.role === 'admin' || user.email === 'yayele492@gmail.com') return true;

    // Check if explicitly in allowedExams list
    if (userProfile.allowedExams?.includes(examId)) return true;

    // Check ALL_IN_ONE master package
    if (userProfile.paidPackages?.includes('ALL_IN_ONE')) return true;

    // Check required package specifically
    if (packageRequired && userProfile.paidPackages?.includes(packageRequired)) return true;

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

  const isAdmin = Boolean(userProfile?.role === 'admin');

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
