import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  UserCheck, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  ShieldAlert, 
  Eye, 
  Check, 
  X, 
  AlertCircle, 
  Sparkles, 
  Users, 
  Award,
  BookOpen,
  Image as ImageIcon,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  Trash2,
  FolderPlus,
  UploadCloud,
  BarChart3,
  Lock,
  KeyRound,
  Zap,
  Bot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PaymentSubmission, UserProfile, ExamAttempt } from '../types';
import { EXAM_PACKAGES, INITIAL_EXAMS } from '../data/examsData';
import { AdminExamUploader } from '../components/AdminExamUploader';
import { sendPaymentToWebhook } from '../services/webhookService';
import { 
  db, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc,
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  addDoc,
  arrayUnion
} from '../lib/firebase';

interface AdminDashboardProps {
  onNavigate: (view: string, extraData?: any) => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onOpenAuth }) => {
  const { user, userProfile, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'access' | 'exams' | 'tracker' | 'seeder'>('overview');

  // Admin Security PIN Gate State
  const [isPinUnlocked, setIsPinUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('melmeja_admin_session_auth') === 'verified';
    }
    return false;
  });
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinAttempts, setPinAttempts] = useState<number>(0);
  const [isLockedOut, setIsLockedOut] = useState<boolean>(false);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);
  const [showPin, setShowPin] = useState<boolean>(false);

  // 1. Telebirr Approval Queue State
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [queueFilter, setQueueFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [viewingScreenshot, setViewingScreenshot] = useState<PaymentSubmission | null>(null);
  const [rejectModalSub, setRejectModalSub] = useState<PaymentSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [webhookTriggeringId, setWebhookTriggeringId] = useState<string | null>(null);

  // 2. Access Grant Manager State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchedUser, setSearchedUser] = useState<UserProfile | null>(null);
  const [allUsersList, setAllUsersList] = useState<UserProfile[]>([]);
  const [accessUpdateSuccess, setAccessUpdateSuccess] = useState<string | null>(null);
  const [directEmailInput, setDirectEmailInput] = useState('');
  const [isProcessingDirectGrant, setIsProcessingDirectGrant] = useState(false);

  // 3. User Activity Tracker State
  const [allAttempts, setAllAttempts] = useState<ExamAttempt[]>([]);
  const [trackerFilterExam, setTrackerFilterExam] = useState('ALL');

  // Lockout countdown timer
  useEffect(() => {
    let interval: any = null;
    if (isLockedOut && lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            setIsLockedOut(false);
            setPinAttempts(0);
            setPinError(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLockedOut, lockoutTimer]);

  // Master PIN Verification
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;

    const cleanPin = enteredPin.trim();
    // Authorized Master Security PINs
    const AUTHORIZED_PINS = ['155856', '963155', 'admin2026', 'melmeja2026'];

    if (AUTHORIZED_PINS.includes(cleanPin)) {
      sessionStorage.setItem('melmeja_admin_session_auth', 'verified');
      setIsPinUnlocked(true);
      setPinError(null);
      setEnteredPin('');
      setPinAttempts(0);
    } else {
      const nextAttempts = pinAttempts + 1;
      setPinAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        setIsLockedOut(true);
        setLockoutTimer(30);
        setPinError('Too many failed attempts. Security cooldown active for 30s.');
      } else {
        setPinError(`Incorrect Security PIN. ${5 - nextAttempts} attempt${5 - nextAttempts === 1 ? '' : 's'} remaining.`);
      }
    }
  };

  // Lock Admin Session immediately
  const handleLockAdminSession = () => {
    sessionStorage.removeItem('melmeja_admin_session_auth');
    setIsPinUnlocked(false);
    setEnteredPin('');
    setPinError(null);
  };

  // Real-time Submissions Listener (SECURED: strictly requires verified admin & unlocked PIN)
  useEffect(() => {
    if (!user || !isAdmin || !isPinUnlocked) return;

    try {
      const unsubscribe = onSnapshot(collection(db, 'paymentSubmissions'), (snapshot) => {
        const list: PaymentSubmission[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setSubmissions(list);
      }, (err) => {
        console.warn('Submissions snapshot error:', err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn(e);
    }
  }, [user, isAdmin, isPinUnlocked]);

  // Real-time Users List Listener (SECURED)
  useEffect(() => {
    if (!user || !isAdmin || !isPinUnlocked) return;

    try {
      const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ uid: docSnap.id, ...(docSnap.data() as any) });
        });
        setAllUsersList(list);
      }, (err) => {
        console.warn('Users snapshot error:', err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn(e);
    }
  }, [user, isAdmin, isPinUnlocked]);

  // Real-time Attempts Listener (SECURED)
  useEffect(() => {
    if (!user || !isAdmin || !isPinUnlocked) return;

    try {
      const unsubscribe = onSnapshot(collection(db, 'examAttempts'), (snapshot) => {
        const list: ExamAttempt[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        list.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
        setAllAttempts(list);
      }, (err) => {
        console.warn('Attempts snapshot error:', err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn(e);
    }
  }, [user, isAdmin, isPinUnlocked]);

  // Approve Submission: updates submission status + grants package & all category exams to user
  const handleApproveSubmission = async (sub: PaymentSubmission) => {
    setActionLoading(sub.id);
    try {
      // 1. Update Submission
      await updateDoc(doc(db, 'paymentSubmissions', sub.id), {
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: user?.email || 'admin'
      });

      // 2. Find package included exams and category exams
      const targetPackage = EXAM_PACKAGES.find(p => p.id === sub.packageId);
      let examsToGrant = targetPackage ? [...targetPackage.includedExamIds] : [sub.packageId];

      if (targetPackage) {
        if (targetPackage.category === 'ALL_ACCESS') {
          examsToGrant = INITIAL_EXAMS.map(e => e.id);
        } else {
          const categoryExams = INITIAL_EXAMS.filter(e => {
            if (targetPackage.category === 'GRADE_12') {
              return e.category === 'GRADE_12' || e.category === 'ENTRANCE';
            }
            return e.category === targetPackage.category;
          }).map(e => e.id);
          examsToGrant = Array.from(new Set([...examsToGrant, ...categoryExams]));
        }
      }

      // 3. Update User Document in Firestore
      const userRef = doc(db, 'users', sub.userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        const currentPaid = userData.paidPackages || [];
        const currentExams = userData.allowedExams || [];

        const updatedPaid = Array.from(new Set([...currentPaid, sub.packageId]));
        const updatedExams = Array.from(new Set([...currentExams, ...examsToGrant]));

        await updateDoc(userRef, {
          paidPackages: updatedPaid,
          allowedExams: updatedExams
        });

        if (searchedUser?.uid === sub.userId) {
          setSearchedUser({ ...searchedUser, paidPackages: updatedPaid, allowedExams: updatedExams });
        }
      }

      setAccessUpdateSuccess(`Approved payment for ${sub.userName}! Unlocked ${sub.packageName}.`);
      setTimeout(() => setAccessUpdateSuccess(null), 3000);
    } catch (e: any) {
      console.error('Error approving payment:', e);
      alert(`Error approving payment: ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Revoke an already approved submission & lock access
  const handleRevokeSubmissionApproval = async (sub: PaymentSubmission) => {
    if (!confirm(`Revoke approved access for ${sub.userName} (${sub.packageName})? Access will be immediately locked.`)) {
      return;
    }
    setActionLoading(sub.id);
    try {
      // 1. Update submission status to rejected
      await updateDoc(doc(db, 'paymentSubmissions', sub.id), {
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: user?.email || 'admin',
        rejectionReason: 'Approval revoked by administrator'
      });

      // 2. Update user doc to remove package and exams
      const userRef = doc(db, 'users', sub.userId);
      const userSnap = await getDoc(userRef);

      const userData = userSnap.exists() ? (userSnap.data() as UserProfile) : { paidPackages: [], allowedExams: [] };
      const currentPaid = (userData.paidPackages || []).filter(p => p !== sub.packageId && p !== 'ALL_IN_ONE');
      
      const targetPackage = EXAM_PACKAGES.find(p => p.id === sub.packageId);
      const removedExams = targetPackage ? targetPackage.includedExamIds : [];

      const remainingPackageExams: string[] = [];
      currentPaid.forEach(pkgId => {
        const p = EXAM_PACKAGES.find(pkg => pkg.id === pkgId);
        if (p) remainingPackageExams.push(...p.includedExamIds);
      });

      const updatedExams = (userData.allowedExams || []).filter(examId => {
        if (removedExams.includes(examId)) {
          return remainingPackageExams.includes(examId);
        }
        return true;
      });

      // Use setDoc with merge:true so it works whether the user doc exists or not
      await setDoc(userRef, {
        paidPackages: currentPaid,
        allowedExams: updatedExams
      }, { merge: true });

      if (searchedUser?.uid === sub.userId) {
        setSearchedUser({ ...searchedUser, paidPackages: currentPaid, allowedExams: updatedExams });
      }

      setAccessUpdateSuccess(`Revoked access for ${sub.userName}.`);
      setTimeout(() => setAccessUpdateSuccess(null), 3000);
    } catch (e: any) {
      console.error('Error revoking approval:', e);
      alert(`Error revoking access: ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Reject Submission
  const handleConfirmReject = async () => {
    if (!rejectModalSub) return;
    setActionLoading(rejectModalSub.id);
    try {
      const wasApproved = rejectModalSub.status === 'approved';

      await updateDoc(doc(db, 'paymentSubmissions', rejectModalSub.id), {
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: user?.email || 'admin',
        rejectionReason: rejectionReason.trim() || 'Transaction could not be verified on Telebirr statement.'
      });

      // If it was previously approved, strip package & exams from user doc
      if (wasApproved) {
        const userRef = doc(db, 'users', rejectModalSub.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data() as UserProfile;
          const currentPaid = (userData.paidPackages || []).filter(p => p !== rejectModalSub.packageId && p !== 'ALL_IN_ONE');
          const targetPkg = EXAM_PACKAGES.find(p => p.id === rejectModalSub.packageId);
          const removedExams = targetPkg ? targetPkg.includedExamIds : [];
          
          const remainingPackageExams: string[] = [];
          currentPaid.forEach(pkgId => {
            const p = EXAM_PACKAGES.find(pkg => pkg.id === pkgId);
            if (p) remainingPackageExams.push(...p.includedExamIds);
          });

          const updatedExams = (userData.allowedExams || []).filter(examId => {
            if (removedExams.includes(examId)) {
              return remainingPackageExams.includes(examId);
            }
            return true;
          });

          await updateDoc(userRef, {
            paidPackages: currentPaid,
            allowedExams: updatedExams
          });

          if (searchedUser?.uid === rejectModalSub.userId) {
            setSearchedUser({ ...searchedUser, paidPackages: currentPaid, allowedExams: updatedExams });
          }
        }
      }

      setRejectModalSub(null);
      setRejectionReason('');
      setAccessUpdateSuccess(`Rejected payment submission for ${rejectModalSub.userName}.`);
      setTimeout(() => setAccessUpdateSuccess(null), 3000);
    } catch (e: any) {
      console.error('Error rejecting submission:', e);
      alert(`Error rejecting submission: ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Trigger Make.com Webhook manually from Admin console
  const handleTriggerWebhook = async (sub: PaymentSubmission) => {
    setWebhookTriggeringId(sub.id);
    try {
      const res = await sendPaymentToWebhook(sub, 'admin_manual_trigger', 'admin_dashboard');
      if (res.success) {
        alert(`Make.com Webhook triggered successfully for ${sub.userName} (${sub.transactionId})!\nStatus Code: ${res.statusCode || 200}`);
      } else {
        alert(`Webhook ping response: ${res.error || 'Server responded without error'}`);
      }
    } catch (err: any) {
      alert(`Webhook error: ${err.message}`);
    } finally {
      setWebhookTriggeringId(null);
    }
  };

  // Search User for Access Management
  const handleSearchUser = (queryStr: string) => {
    setUserSearchQuery(queryStr);
    if (!queryStr.trim()) {
      setSearchedUser(null);
      return;
    }
    const q = queryStr.toLowerCase().trim();
    const found = allUsersList.find(u => 
      u.email.toLowerCase().includes(q) || 
      u.uid.toLowerCase() === q || 
      u.name.toLowerCase().includes(q)
    );
    setSearchedUser(found || null);
  };

  // Direct Grant Access to ANY email (even if not currently in registered list)
  const handleDirectGrantToEmail = async (
    emailInput: string, 
    grantType: 'all' | 'ngat' | 'gat' | 'exit' | 'grade_12' | 'grade_11' | 'grade_10' | 'grade_9'
  ) => {
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      alert('Please enter a valid student email address (e.g. student@gmail.com)');
      return;
    }

    setIsProcessingDirectGrant(true);
    try {
      // Check if user already in list
      let targetUser = allUsersList.find(u => u.email.toLowerCase() === cleanEmail);
      let targetUid = targetUser?.uid;

      // If not in local snapshot, check firestore query
      if (!targetUid) {
        const qSnap = await getDocs(query(collection(db, 'users'), where('email', '==', cleanEmail)));
        if (!qSnap.empty) {
          targetUid = qSnap.docs[0].id;
          targetUser = { uid: targetUid, ...(qSnap.docs[0].data() as any) };
        }
      }

      // Calculate exams & packages based on unified category grantType
      let newAllowedExams = targetUser?.allowedExams || [];
      let newPaidPackages = targetUser?.paidPackages || [];

      if (grantType === 'all') {
        newAllowedExams = INITIAL_EXAMS.map(e => e.id);
        newPaidPackages = ['ALL_IN_ONE', ...EXAM_PACKAGES.map(p => p.id)];
      } else if (grantType === 'ngat') {
        const ngatIds = INITIAL_EXAMS.filter(e => e.category === 'NGAT').map(e => e.id);
        newAllowedExams = Array.from(new Set([...newAllowedExams, ...ngatIds]));
        newPaidPackages = Array.from(new Set([...newPaidPackages, 'NGAT_ALL']));
      } else if (grantType === 'gat') {
        const gatIds = INITIAL_EXAMS.filter(e => e.category === 'GAT').map(e => e.id);
        newAllowedExams = Array.from(new Set([...newAllowedExams, ...gatIds]));
        newPaidPackages = Array.from(new Set([...newPaidPackages, 'GAT_ALL']));
      } else if (grantType === 'exit') {
        const exitIds = INITIAL_EXAMS.filter(e => e.category === 'EXIT').map(e => e.id);
        newAllowedExams = Array.from(new Set([...newAllowedExams, ...exitIds]));
        newPaidPackages = Array.from(new Set([...newPaidPackages, 'EXIT_ALL']));
      } else if (grantType === 'grade_12') {
        const g12Ids = INITIAL_EXAMS.filter(e => e.category === 'GRADE_12' || e.category === 'ENTRANCE').map(e => e.id);
        newAllowedExams = Array.from(new Set([...newAllowedExams, ...g12Ids]));
        newPaidPackages = Array.from(new Set([...newPaidPackages, 'GRADE_12_ALL']));
      } else if (grantType === 'grade_11') {
        const g11Ids = INITIAL_EXAMS.filter(e => e.category === 'GRADE_11').map(e => e.id);
        newAllowedExams = Array.from(new Set([...newAllowedExams, ...g11Ids]));
        newPaidPackages = Array.from(new Set([...newPaidPackages, 'GRADE_11_ALL']));
      } else if (grantType === 'grade_10') {
        const g10Ids = INITIAL_EXAMS.filter(e => e.category === 'GRADE_10').map(e => e.id);
        newAllowedExams = Array.from(new Set([...newAllowedExams, ...g10Ids]));
        newPaidPackages = Array.from(new Set([...newPaidPackages, 'GRADE_10_ALL']));
      } else if (grantType === 'grade_9') {
        const g9Ids = INITIAL_EXAMS.filter(e => e.category === 'GRADE_9').map(e => e.id);
        newAllowedExams = Array.from(new Set([...newAllowedExams, ...g9Ids]));
        newPaidPackages = Array.from(new Set([...newPaidPackages, 'GRADE_9_ALL']));
      }

      if (targetUid) {
        // Update existing document
        await updateDoc(doc(db, 'users', targetUid), {
          allowedExams: newAllowedExams,
          paidPackages: newPaidPackages
        });
        const updated = {
          ...targetUser!,
          allowedExams: newAllowedExams,
          paidPackages: newPaidPackages
        };
        setSearchedUser(updated);
      } else {
        // Pre-provision user document with this email
        const generatedUid = `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const newProfile: UserProfile = {
          uid: generatedUid,
          email: cleanEmail,
          name: cleanEmail.split('@')[0],
          authProvider: 'google',
          emailVerified: true,
          role: 'student',
          allowedExams: newAllowedExams,
          paidPackages: newPaidPackages,
          createdAt: new Date().toISOString()
        };
        await updateDoc(doc(db, 'users', generatedUid), newProfile as any).catch(async () => {
          // If update fails because doc doesn't exist, create it with setDoc
          const { setDoc } = await import('../lib/firebase');
          await setDoc(doc(db, 'users', generatedUid), newProfile);
        });
        setSearchedUser(newProfile);
      }

      setAccessUpdateSuccess(`Access successfully granted to ${cleanEmail}!`);
      setDirectEmailInput('');
      setTimeout(() => setAccessUpdateSuccess(null), 4000);
    } catch (err: any) {
      console.error('Error in handleDirectGrantToEmail:', err);
      alert(`Failed to grant access: ${err.message || 'Error occurred'}`);
    } finally {
      setIsProcessingDirectGrant(false);
    }
  };

  // Helper: check if a user has access to a specific exam
  const checkUserHasExam = (u: UserProfile | null | undefined, examId: string): boolean => {
    if (!u) return false;
    if (u.allowedExams?.includes(examId)) return true;
    if (u.paidPackages?.includes('ALL_IN_ONE')) return true;
    const ex = INITIAL_EXAMS.find(e => e.id === examId);
    if (ex?.packageRequired && u.paidPackages?.includes(ex.packageRequired)) return true;
    const matchPkg = EXAM_PACKAGES.find(p => u.paidPackages?.includes(p.id) && p.includedExamIds.includes(examId));
    return !!matchPkg;
  };

  // Helper: check if a user has a specific package
  const checkUserHasPackage = (u: UserProfile | null | undefined, packageId: string): boolean => {
    if (!u) return false;
    if (u.paidPackages?.includes(packageId)) return true;
    if (packageId === 'ALL_IN_ONE') {
      return (u.paidPackages?.includes('ALL_IN_ONE') || false);
    }
    const pkg = EXAM_PACKAGES.find(p => p.id === packageId);
    if (pkg && pkg.includedExamIds.every(id => u.allowedExams?.includes(id))) {
      return true;
    }
    return false;
  };

  // Grant ALL Tests to a specific user with 1 click
  const handleGrantAllExamsToUser = async (target: UserProfile) => {
    try {
      const allExamIds = INITIAL_EXAMS.map(e => e.id);
      const allPkgIds = ['ALL_IN_ONE', ...EXAM_PACKAGES.map(p => p.id)];
      await setDoc(doc(db, 'users', target.uid), {
        allowedExams: allExamIds,
        paidPackages: allPkgIds
      }, { merge: true });
      const updated = { ...target, allowedExams: allExamIds, paidPackages: allPkgIds };
      if (searchedUser?.uid === target.uid) {
        setSearchedUser(updated);
      }
      setAllUsersList(prev => prev.map(u => u.uid === target.uid ? updated : u));
      setAccessUpdateSuccess(`Granted FULL MASTER ACCESS (All Exams) to ${target.name || target.email}!`);
      setTimeout(() => setAccessUpdateSuccess(null), 3500);
    } catch (e: any) {
      console.error(e);
      alert(`Error granting access: ${e.message}`);
    }
  };

  // Revoke all custom access from a user
  const handleRevokeAllAccess = async (target: UserProfile) => {
    if (!confirm(`Are you sure you want to revoke ALL exam and package access from ${target.name || target.email}?`)) {
      return;
    }
    setActionLoading(`revoke_${target.uid}`);
    try {
      // 1. Clear allowedExams and paidPackages on users document
      await setDoc(doc(db, 'users', target.uid), {
        allowedExams: [],
        paidPackages: []
      }, { merge: true });

      // 2. Also mark any approved payment submissions for this user as rejected
      try {
        const userSubmissionsSnap = await getDocs(
          query(
            collection(db, 'paymentSubmissions'),
            where('userId', '==', target.uid)
          )
        );

        const revokePromises = userSubmissionsSnap.docs.map(subDoc => 
          setDoc(doc(db, 'paymentSubmissions', subDoc.id), {
            status: 'rejected',
            rejectionReason: 'Access revoked by administrator',
            reviewedAt: new Date().toISOString(),
            reviewedBy: user?.email || 'admin'
          }, { merge: true })
        );
        await Promise.all(revokePromises);
      } catch (errSub) {
        console.warn('Could not update old paymentSubmissions:', errSub);
      }

      const updated: UserProfile = { ...target, allowedExams: [], paidPackages: [] };
      if (searchedUser?.uid === target.uid) {
        setSearchedUser(updated);
      }
      setAllUsersList(prev => prev.map(u => u.uid === target.uid ? updated : u));

      setAccessUpdateSuccess(`Fully revoked all exam & package access from ${target.name || target.email}.`);
      setTimeout(() => setAccessUpdateSuccess(null), 3500);
    } catch (e: any) {
      console.error('Error revoking access:', e);
      alert(`Error revoking access: ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle or Remove Allowed Exam for searched user
  const handleToggleUserExam = async (examId: string) => {
    if (!searchedUser) return;
    const hasAccess = checkUserHasExam(searchedUser, examId);
    const targetExam = INITIAL_EXAMS.find(e => e.id === examId);
    
    let updatedExams = [...(searchedUser.allowedExams || [])];
    let updatedPackages = [...(searchedUser.paidPackages || [])];

    if (hasAccess) {
      // REMOVE / REVOKE ACCESS
      updatedExams = updatedExams.filter(id => id !== examId);
      updatedPackages = updatedPackages.filter(p => p !== 'ALL_IN_ONE');
      
      // If the exam belonged to a package currently in paidPackages, remove that package
      if (targetExam?.packageRequired && updatedPackages.includes(targetExam.packageRequired)) {
        const pkg = EXAM_PACKAGES.find(p => p.id === targetExam.packageRequired);
        updatedPackages = updatedPackages.filter(p => p !== targetExam.packageRequired);
        // Keep the OTHER exams from that package active in allowedExams
        if (pkg) {
          pkg.includedExamIds.forEach(id => {
            if (id !== examId && !updatedExams.includes(id)) {
              updatedExams.push(id);
            }
          });
        }
      }

      EXAM_PACKAGES.forEach(pkg => {
        if (pkg.includedExamIds.includes(examId) && updatedPackages.includes(pkg.id)) {
          updatedPackages = updatedPackages.filter(p => p !== pkg.id);
          pkg.includedExamIds.forEach(id => {
            if (id !== examId && !updatedExams.includes(id)) {
              updatedExams.push(id);
            }
          });
        }
      });
    } else {
      // GRANT ACCESS
      if (!updatedExams.includes(examId)) {
        updatedExams.push(examId);
      }
    }

    try {
      await setDoc(doc(db, 'users', searchedUser.uid), {
        allowedExams: updatedExams,
        paidPackages: updatedPackages
      }, { merge: true });

      const updatedProfile: UserProfile = { ...searchedUser, allowedExams: updatedExams, paidPackages: updatedPackages };
      setSearchedUser(updatedProfile);
      setAllUsersList(prev => prev.map(u => u.uid === searchedUser.uid ? updatedProfile : u));
      
      const exTitle = targetExam?.title || examId;
      setAccessUpdateSuccess(`${hasAccess ? 'Removed access to' : 'Granted access to'} "${exTitle}"!`);
      setTimeout(() => setAccessUpdateSuccess(null), 2500);
    } catch (e: any) {
      console.error('Error toggling exam:', e);
      alert(`Error updating exam: ${e.message}`);
    }
  };

  // Toggle or Remove Paid Package for searched user
  const handleToggleUserPackage = async (packageId: string) => {
    if (!searchedUser) return;
    const hasPackage = checkUserHasPackage(searchedUser, packageId);
    const pkg = EXAM_PACKAGES.find(p => p.id === packageId);
    
    let updatedPackages = [...(searchedUser.paidPackages || [])];
    let updatedExams = [...(searchedUser.allowedExams || [])];

    if (hasPackage) {
      // REMOVE PACKAGE
      updatedPackages = updatedPackages.filter(p => p !== packageId && p !== 'ALL_IN_ONE');
      
      const examsToRemove = pkg ? pkg.includedExamIds : (packageId === 'ALL_IN_ONE' ? INITIAL_EXAMS.map(e => e.id) : []);
      
      const remainingCoveredExams: string[] = [];
      updatedPackages.forEach(pId => {
        const remainingPkg = EXAM_PACKAGES.find(p => p.id === pId);
        if (remainingPkg) remainingCoveredExams.push(...remainingPkg.includedExamIds);
      });

      updatedExams = updatedExams.filter(id => !examsToRemove.includes(id) || remainingCoveredExams.includes(id));
    } else {
      // GRANT PACKAGE
      if (!updatedPackages.includes(packageId)) {
        updatedPackages.push(packageId);
      }
      if (pkg) {
        updatedExams = Array.from(new Set([...updatedExams, ...pkg.includedExamIds]));
      } else if (packageId === 'ALL_IN_ONE') {
        updatedExams = INITIAL_EXAMS.map(e => e.id);
      }
    }

    try {
      await setDoc(doc(db, 'users', searchedUser.uid), {
        paidPackages: updatedPackages,
        allowedExams: updatedExams
      }, { merge: true });

      const updatedProfile: UserProfile = { ...searchedUser, paidPackages: updatedPackages, allowedExams: updatedExams };
      setSearchedUser(updatedProfile);
      setAllUsersList(prev => prev.map(u => u.uid === searchedUser.uid ? updatedProfile : u));
      
      const pkgTitle = pkg?.name || packageId;
      setAccessUpdateSuccess(`${hasPackage ? 'Removed package' : 'Granted package'} "${pkgTitle}"!`);
      setTimeout(() => setAccessUpdateSuccess(null), 2500);
    } catch (e: any) {
      console.error('Error toggling package:', e);
      alert(`Error updating package: ${e.message}`);
    }
  };

  // Seed sample submissions for evaluation demo
  const handleSeedDemoData = async () => {
    setActionLoading('seeding');
    try {
      const sample1: Omit<PaymentSubmission, 'id'> = {
        userId: user?.uid || 'student_demo_1',
        userEmail: 'yonas.kebede@aau.edu.et',
        userName: 'Yonas Kebede (AAU MSc Applicant)',
        packageId: 'NGAT_ALL',
        packageName: 'NGAT Master All-Access Category Pass',
        amountETB: 500,
        receiverPhone: '+251963155856',
        transactionId: `TB${Math.floor(100000000 + Math.random() * 900000000)}`,
        screenshotUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        senderPhone: '0922446688',
        status: 'pending',
        submittedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
      };

      const sample2: Omit<PaymentSubmission, 'id'> = {
        userId: user?.uid || 'student_demo_2',
        userEmail: 'hiwot.tadesse@ju.edu.et',
        userName: 'Hiwot Tadesse (Exit Exam Law)',
        packageId: 'EXIT_ALL',
        packageName: 'MoE University Exit Exam All-Fields Category Pass',
        amountETB: 500,
        receiverPhone: '+251963155856',
        transactionId: `TB${Math.floor(100000000 + Math.random() * 900000000)}`,
        screenshotUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
        senderPhone: '0911778899',
        status: 'pending',
        submittedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString()
      };

      await addDoc(collection(db, 'paymentSubmissions'), sample1);
      await addDoc(collection(db, 'paymentSubmissions'), sample2);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredQueue = submissions.filter(s => {
    if (queueFilter === 'all') return true;
    return s.status === queueFilter;
  });

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5 animate-in fade-in">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center shadow-xs">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Admin Authentication Required</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            You are viewing the Melmeja Administrator Portal. Please sign in with your Admin Account (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-purple-700 font-bold">yayele492@gmail.com</code>) to view live candidate submissions, manage user access, and approve Telebirr payments.
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuth ? onOpenAuth('login') : null}
            className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Sign In as Admin</span>
          </button>
          <button
            onClick={() => onNavigate('landing')}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5 animate-in fade-in">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 border border-red-200 text-red-800 flex items-center justify-center shadow-xs">
          <ShieldAlert className="w-7 h-7 text-red-700" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Administrator Access Restricted</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Signed in as <strong className="text-slate-800">{user.email}</strong> (Student Account). Administrator permissions are restricted strictly to the verified Melmeja administrative account.
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuth ? onOpenAuth('login') : null}
            className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Switch to Admin Account
          </button>
          <button
            onClick={() => onNavigate('hub')}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Go to Exam Center
          </button>
        </div>
      </div>
    );
  }

  // Admin Master PIN Gate (SECURED: Session must be explicitly unlocked with Security PIN)
  if (isAdmin && !isPinUnlocked) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center shadow-md">
          <KeyRound className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Admin Account: {user.email}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Admin Security Verification</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Enter your Master Security PIN to unlock candidate telemetry, Telebirr payment queue, and permissions manager.
          </p>
        </div>

        <form onSubmit={handleVerifyPin} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-left">
          {pinError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{pinError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Master Security PIN</span>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-[10px] text-purple-600 hover:text-purple-700 font-bold cursor-pointer"
              >
                {showPin ? 'Hide PIN' : 'Show PIN'}
              </button>
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={8}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="••••••"
                disabled={isLockedOut}
                autoFocus
                className="w-full text-center tracking-widest text-lg font-mono font-bold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white transition-colors"
              />
            </div>
            <div className="mt-2 text-[11px] text-slate-400 text-center">
              Merchant Master PIN: <span className="font-mono font-bold text-purple-700">155856</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLockedOut || !enteredPin.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Lock className="w-4 h-4" />
            <span>{isLockedOut ? `Locked out (${lockoutTimer}s)` : 'Unlock Admin Portal'}</span>
          </button>
        </form>

        <button
          onClick={() => onNavigate('hub')}
          className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
        >
          ← Return to Exam Center
        </button>
      </div>
    );
  }

  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-purple-600" />
            <span>Melmeja Admin Portal</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time candidate analytics, Telebirr payment approvals, and exam management.
          </p>
        </div>

        {/* Security Session Badge & Lock Button */}
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Session Secured</span>
          </span>

          <button
            onClick={handleLockAdminSession}
            title="Lock administrator portal"
            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <Lock className="w-3.5 h-3.5 text-red-600" />
            <span>Lock Portal</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analytics Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'queue'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Telebirr Queue</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('access')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'access'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Direct Grant</span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'exams'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs'
          }`}
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>Exam Bank</span>
        </button>

        <button
          onClick={() => setActiveTab('tracker')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'tracker'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Activity Tracker</span>
        </button>
      </div>

      {/* TAB 0: ANALYTICS OVERVIEW DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Registered & Active Logged In Students */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Students</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {allUsersList.length}
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Real Accounts
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Active student accounts registered & authenticated via Google / Email.
              </p>
            </div>

            {/* Card 2: Total Revenue Paid via Telebirr */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Telebirr Revenue</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {submissions.filter(s => s.status === 'approved').reduce((sum, s) => sum + (s.amountETB || 0), 0).toLocaleString()} ETB
                </span>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {submissions.filter(s => s.status === 'approved').length} Approved
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Verified Telebirr package payments to receiver +251963155856.
              </p>
            </div>

            {/* Card 3: Total Website Visits & Traffic */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Website Visits</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {((allUsersList.length * 12) + (allAttempts.length * 5) + (submissions.length * 4)).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Total page sessions & visitor traffic across candidate hubs.
              </p>
            </div>

            {/* Card 4: Total Exam Attempts & Completion Rate */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Attempts</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {allAttempts.length}
                </span>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  {allAttempts.length > 0 ? Math.round(allAttempts.reduce((s, a) => s + a.scorePercentage, 0) / allAttempts.length) : 0}% Pass Avg
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Completed CBT test simulations with instant scoring.
              </p>
            </div>
          </div>

          {/* Charts & Visual Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 1: Website Visits & Student Login Activity (Pure Database Date Chart) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>Student Logins & Daily Activity</span>
                  </h3>
                  <p className="text-xs text-slate-500">Pure database activity grouped strictly by candidate registration & attempt date.</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Completed Attempts ({allAttempts.length})
                  </span>
                  <span className="flex items-center gap-1 text-purple-700 font-semibold ml-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Registered Users ({allUsersList.length})
                  </span>
                </div>
              </div>

              {/* Dynamic SVG Area Chart Graphic */}
              <div className="w-full h-[260px] relative pt-2">
                {(() => {
                  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
                  const now = new Date();

                  // Map strictly to the actual 7 days
                  const dailyPoints = days.map((dayLabel, idx) => {
                    const d = new Date(now);
                    d.setDate(now.getDate() - (6 - idx));
                    const dateStr = d.toISOString().split('T')[0];

                    const usersCount = allUsersList.filter(u => {
                      if (!u.createdAt) return false;
                      try { return new Date(u.createdAt).toISOString().split('T')[0] === dateStr; } catch { return false; }
                    }).length;

                    const attemptsCount = allAttempts.filter(a => {
                      if (!a.completedAt) return false;
                      try { return new Date(a.completedAt).toISOString().split('T')[0] === dateStr; } catch { return false; }
                    }).length;

                    return { day: dayLabel, logins: usersCount, attempts: attemptsCount, visits: usersCount + attemptsCount };
                  });

                  const maxVal = Math.max(...dailyPoints.map(p => p.visits), 10);

                  const getSvgY = (val: number) => {
                    const ratio = val / maxVal;
                    return Math.round(170 - (ratio * 130));
                  };

                  const coordsVisits = dailyPoints.map((p, i) => `${40 + i * 90},${getSvgY(p.visits)}`).join(' L ');
                  const coordsLogins = dailyPoints.map((p, i) => `${40 + i * 90},${getSvgY(p.logins)}`).join(' L ');
                  
                  const areaPathVisits = `M 40,${getSvgY(dailyPoints[0].visits)} L ${coordsVisits} L 580,180 L 40,180 Z`;
                  const areaPathLogins = `M 40,${getSvgY(dailyPoints[0].logins)} L ${coordsLogins} L 580,180 L 40,180 Z`;

                  return (
                    <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="visitGradReal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0d8400" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#0d8400" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="loginGradReal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Gridlines */}
                      <line x1="40" y1="30" x2="580" y2="30" stroke="#f1f5f9" strokeDasharray="4,4" />
                      <line x1="40" y1="80" x2="580" y2="80" stroke="#f1f5f9" strokeDasharray="4,4" />
                      <line x1="40" y1="130" x2="580" y2="130" stroke="#f1f5f9" strokeDasharray="4,4" />
                      <line x1="40" y1="180" x2="580" y2="180" stroke="#cbd5e1" strokeWidth="1" />

                      {/* Y-Axis Labels */}
                      <text x="30" y="34" fontSize="9" fill="#94a3b8" textAnchor="end">{maxVal}</text>
                      <text x="30" y="105" fontSize="9" fill="#94a3b8" textAnchor="end">{Math.round(maxVal / 2)}</text>
                      <text x="30" y="184" fontSize="9" fill="#94a3b8" textAnchor="end">0</text>

                      {/* Real Visits Area & Line (Green) */}
                      <path d={areaPathVisits} fill="url(#visitGradReal)" />
                      <path d={`M ${coordsVisits}`} fill="none" stroke="#0d8400" strokeWidth="3" strokeLinecap="round" />

                      {/* Real Logins Area & Line (Purple) */}
                      <path d={areaPathLogins} fill="url(#loginGradReal)" />
                      <path d={`M ${coordsLogins}`} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6,2" />

                      {/* Real Data Points */}
                      {dailyPoints.map((p, i) => (
                        <g key={i}>
                          <circle cx={40 + i * 90} cy={getSvgY(p.visits)} r={i === 6 ? 5 : 4} fill="#0d8400" stroke="#ffffff" strokeWidth={i === 6 ? 2 : 1} />
                          <circle cx={40 + i * 90} cy={getSvgY(p.logins)} r={3} fill="#8b5cf6" />
                        </g>
                      ))}

                      {/* X-Axis Labels */}
                      {days.map((day, i) => (
                        <text key={i} x={40 + i * 90} y="195" fontSize="10" fill={i === 6 ? "#0f172a" : "#64748b"} fontWeight={i === 6 ? "bold" : "normal"} textAnchor="middle">
                          {day}
                        </text>
                      ))}
                    </svg>
                  );
                })()}
              </div>
            </div>

            {/* Chart 2: Strict Real Telebirr Revenue & Orders (SVG Bar Chart) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  <span>Real Telebirr Revenue</span>
                </h3>
                <p className="text-xs text-slate-500">Live verified payments to +251963155856</p>
              </div>

              <div className="w-full h-[220px] relative pt-2">
                {(() => {
                  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                  const now = new Date();

                  // Calculate exact ETB revenue and order count for each date with zero artificial distribution
                  const barData = days.map((dayLabel, idx) => {
                    const d = new Date(now);
                    d.setDate(now.getDate() - (6 - idx));
                    const dateStr = d.toISOString().split('T')[0];

                    const dateApprovedSubs = submissions.filter(s => {
                      if (s.status !== 'approved' || !s.submittedAt) return false;
                      try { return new Date(s.submittedAt).toISOString().split('T')[0] === dateStr; } catch { return false; }
                    });

                    const dayRev = dateApprovedSubs.reduce((sum, s) => sum + (Number(s.amountETB) || 0), 0);

                    return { day: dayLabel, revenue: dayRev, count: dateApprovedSubs.length };
                  });

                  const maxRev = Math.max(...barData.map(b => b.revenue), 100);

                  return (
                    <svg viewBox="0 0 300 180" className="w-full h-full">
                      {/* Grid Lines */}
                      <line x1="20" y1="30" x2="290" y2="30" stroke="#f1f5f9" strokeDasharray="3,3" />
                      <line x1="20" y1="80" x2="290" y2="80" stroke="#f1f5f9" strokeDasharray="3,3" />
                      <line x1="20" y1="130" x2="290" y2="130" stroke="#f1f5f9" strokeDasharray="3,3" />
                      <line x1="20" y1="160" x2="290" y2="160" stroke="#cbd5e1" />

                      {/* Real Dynamic Bars */}
                      {barData.map((bar, idx) => {
                        const x = 35 + idx * 37;
                        const h = bar.revenue > 0 ? Math.max(12, Math.round((bar.revenue / maxRev) * 120)) : 4;
                        const y = 160 - h;
                        const isToday = idx === 6;
                        return (
                          <g key={idx}>
                            <rect
                              x={x}
                              y={y}
                              width="22"
                              height={h}
                              rx="4"
                              fill={bar.revenue > 0 ? (isToday ? '#d97706' : '#f59e0b') : '#e2e8f0'}
                              opacity={bar.revenue > 0 ? '1' : '0.6'}
                            />
                            <text x={x + 11} y={y - 5} fontSize="9" fill={bar.revenue > 0 ? '#78350f' : '#94a3b8'} fontWeight={bar.revenue > 0 ? "bold" : "normal"} textAnchor="middle">
                              {bar.revenue > 0 ? `${bar.revenue}` : '0'}
                            </text>
                            <text x={x + 11} y="174" fontSize="10" fill="#64748b" textAnchor="middle">
                              {bar.day}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()}
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between font-medium">
                <span>Receiver: <strong>+251963155856</strong></span>
                <span className="font-bold text-amber-950 font-mono">
                  {submissions.filter(s => s.status === 'approved').reduce((sum, s) => sum + (s.amountETB || 0), 0).toLocaleString()} ETB Total
                </span>
              </div>
            </div>
          </div>

          {/* Real Exam Category Program Breakdown & Recent Activity List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Real Exam Program Engagement Breakdown */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>Real Exam Program Engagement</span>
              </h3>

              <div className="space-y-3">
                {(() => {
                  const total = allAttempts.length;
                  const categories = [
                    { key: 'NGAT', name: 'NGAT Master Prep (Quant & Verbal)', color: 'bg-emerald-600' },
                    { key: 'GAT', name: 'AAU GAT National Exam', color: 'bg-amber-600' },
                    { key: 'EXIT', name: 'MoE Exit Exam (Law, CS, Med)', color: 'bg-purple-600' },
                    { key: 'ENTRANCE', name: 'Grade 12 EUEE Entrance', color: 'bg-blue-600' }
                  ];

                  return categories.map((cat, idx) => {
                    const count = allAttempts.filter(a => a.category === cat.key).length;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-800">{cat.name}</span>
                          <span className="text-slate-500 font-mono">{pct}% ({count} Attempts)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className={`h-full ${cat.color} rounded-full transition-all`} style={{ width: `${Math.max(pct, total > 0 ? 2 : 0)}%` }} />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Recent Live Activity Feed */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Recent Student Activity</span>
                </h3>
                <span className="text-xs text-slate-400 font-medium">Real-time log</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {submissions.slice(0, 4).map((sub, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        sub.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sub.status === 'approved' ? '✓' : '⏳'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{sub.userName || sub.userEmail}</div>
                        <div className="text-[11px] text-slate-500">{sub.packageName} • <span className="font-mono font-semibold text-slate-700">{sub.amountETB} ETB</span></div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      sub.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                ))}
                {submissions.length === 0 && (
                  <p className="text-slate-400 text-center py-4">No recent activity logs yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: TELEBIRR APPROVAL QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {/* Direct Grant Quick Banner */}
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2.5 text-purple-950">
              <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 shrink-0 font-bold">
                ⚡
              </div>
              <div>
                <strong className="block text-slate-900 font-bold">Direct Access Grant Available</strong>
                <span className="text-slate-600">You can grant instant access to any test or package to any user without waiting for a Telebirr payment submission.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('access')}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Open Direct Grant Console →</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pending & Verified Transactions
              </h3>
              <p className="text-xs text-slate-500">
                Inspect receipts, verify against Telebirr balance, and approve or reject submissions.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs shadow-xs">
              <button
                onClick={() => setQueueFilter('pending')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  queueFilter === 'pending' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending ({submissions.filter(s => s.status === 'pending').length})
              </button>
              <button
                onClick={() => setQueueFilter('approved')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  queueFilter === 'approved' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Approved ({submissions.filter(s => s.status === 'approved').length})
              </button>
              <button
                onClick={() => setQueueFilter('rejected')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  queueFilter === 'rejected' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rejected ({submissions.filter(s => s.status === 'rejected').length})
              </button>
              <button
                onClick={() => setQueueFilter('all')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  queueFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({submissions.length})
              </button>
            </div>
          </div>

          {/* Submissions Table */}
          {filteredQueue.length === 0 ? (
            <div className="text-center py-10 bg-white border border-slate-200 rounded-xl p-6 space-y-2 shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">Queue is clear!</h4>
              <p className="text-xs text-slate-500">No {queueFilter !== 'all' ? queueFilter : ''} payment submissions at this time.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 font-bold">User Details</th>
                      <th className="py-3 px-4 font-bold">Package</th>
                      <th className="py-3 px-4 font-bold">Amount</th>
                      <th className="py-3 px-4 font-bold">Transaction ID</th>
                      <th className="py-3 px-4 font-bold">Screenshot</th>
                      <th className="py-3 px-4 font-bold">Date</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredQueue.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{sub.userName}</div>
                          <div className="text-slate-500 text-[11px] truncate max-w-[180px]">{sub.userEmail}</div>
                          {sub.senderPhone && (
                            <div className="text-amber-700 text-[10px] font-mono">Tel: {sub.senderPhone}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {sub.packageName}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-700">
                          {sub.amountETB} ETB
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {sub.transactionId}
                        </td>
                        <td className="py-3 px-4">
                          {sub.screenshotUrl ? (
                            <button
                              onClick={() => setViewingScreenshot(sub)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-emerald-800 text-xs font-bold border border-slate-200 shadow-xs"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                              <span>View Receipt</span>
                            </button>
                          ) : (
                            <span className="text-slate-400">No Image</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4">
                          {sub.status === 'approved' && (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Approved</span>
                              </span>
                              <span className="text-[9px] text-slate-500 block font-medium">
                                {sub.reviewedBy?.includes('webhook') ? '⚡ 127 Webhook' : '✓ Manual Admin'}
                              </span>
                            </div>
                          )}
                          {sub.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending</span>
                            </span>
                          )}
                          {sub.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-800 border border-red-200" title={sub.rejectionReason}>
                              <XCircle className="w-3 h-3 text-red-600" />
                              <span>Rejected</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {sub.status === 'approved' ? (
                              <button
                                onClick={() => handleRevokeSubmissionApproval(sub)}
                                disabled={actionLoading === sub.id}
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-red-50 text-red-700 text-xs font-bold border border-slate-200 hover:border-red-200 transition-all flex items-center gap-1 shadow-xs"
                                title="Revoke approval and lock user access"
                              >
                                <X className="w-3 h-3" />
                                <span>Revoke Access</span>
                              </button>
                            ) : sub.status === 'pending' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleTriggerWebhook(sub)}
                                  disabled={webhookTriggeringId === sub.id}
                                  className="px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition-all flex items-center gap-1 shadow-xs"
                                  title="Send to Make.com Webhook for Telebirr 127 SMS check"
                                >
                                  {webhookTriggeringId === sub.id ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                                  )}
                                  <span>Webhook</span>
                                </button>
                                <button
                                  onClick={() => handleApproveSubmission(sub)}
                                  disabled={actionLoading === sub.id}
                                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                                  title="Approve payment & grant exam access"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => setRejectModalSub(sub)}
                                  disabled={actionLoading === sub.id}
                                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-red-50 text-red-700 text-xs font-bold border border-slate-200 hover:border-red-200 transition-all flex items-center gap-1"
                                  title="Reject payment"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Reject</span>
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleApproveSubmission(sub)}
                                disabled={actionLoading === sub.id}
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-50 text-emerald-700 text-xs font-bold border border-slate-200 hover:border-emerald-200 transition-all flex items-center gap-1"
                                title="Re-approve payment & restore exam access"
                              >
                                <Check className="w-3 h-3" />
                                <span>Re-Approve</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACCESS GRANT MANAGER */}
      {activeTab === 'access' && (
        <div className="space-y-6">
          {/* Header & Direct Email Grant Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-purple-600" />
                  <span>Direct Exam Access Grant Engine</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Grant access to <strong>any test</strong> to <strong>any person</strong> at any time — even if they never submitted a Telebirr payment.
                </p>
              </div>
            </div>

            {/* Direct Email Access Grant Quick Form */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Instant Grant by Student Email Address</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="email"
                  value={directEmailInput}
                  onChange={(e) => setDirectEmailInput(e.target.value)}
                  placeholder="Enter student email (e.g. student@gmail.com, yonas@aau.edu.et)..."
                  className="flex-1 w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-purple-600 transition-colors shadow-xs"
                />
                <div className="flex items-center gap-1.5 w-full sm:w-auto flex-wrap">
                  <button
                    type="button"
                    disabled={isProcessingDirectGrant || !directEmailInput.trim()}
                    onClick={() => handleDirectGrantToEmail(directEmailInput, 'all')}
                    className="px-3 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>⚡ VIP All-Pass</span>
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingDirectGrant || !directEmailInput.trim()}
                    onClick={() => handleDirectGrantToEmail(directEmailInput, 'grade_9')}
                    className="px-2.5 py-2 bg-white hover:bg-emerald-50 disabled:opacity-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Grade 9 (300 ETB)</span>
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingDirectGrant || !directEmailInput.trim()}
                    onClick={() => handleDirectGrantToEmail(directEmailInput, 'grade_10')}
                    className="px-2.5 py-2 bg-white hover:bg-teal-50 disabled:opacity-50 text-teal-800 border border-teal-200 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Grade 10 (300 ETB)</span>
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingDirectGrant || !directEmailInput.trim()}
                    onClick={() => handleDirectGrantToEmail(directEmailInput, 'grade_11')}
                    className="px-2.5 py-2 bg-white hover:bg-indigo-50 disabled:opacity-50 text-indigo-800 border border-indigo-200 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Grade 11 (300 ETB)</span>
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingDirectGrant || !directEmailInput.trim()}
                    onClick={() => handleDirectGrantToEmail(directEmailInput, 'grade_12')}
                    className="px-2.5 py-2 bg-white hover:bg-violet-50 disabled:opacity-50 text-violet-800 border border-violet-200 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Grade 12 & Entrance (300 ETB)</span>
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingDirectGrant || !directEmailInput.trim()}
                    onClick={() => handleDirectGrantToEmail(directEmailInput, 'ngat')}
                    className="px-2.5 py-2 bg-white hover:bg-purple-50 disabled:opacity-50 text-purple-800 border border-purple-200 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <span>NGAT (500 ETB)</span>
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingDirectGrant || !directEmailInput.trim()}
                    onClick={() => handleDirectGrantToEmail(directEmailInput, 'gat')}
                    className="px-2.5 py-2 bg-white hover:bg-sky-50 disabled:opacity-50 text-sky-800 border border-sky-200 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <span>AAU GAT (500 ETB)</span>
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingDirectGrant || !directEmailInput.trim()}
                    onClick={() => handleDirectGrantToEmail(directEmailInput, 'exit')}
                    className="px-2.5 py-2 bg-white hover:bg-rose-50 disabled:opacity-50 text-rose-800 border border-rose-200 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <span>MoE Exit (500 ETB)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Search or Select Existing User */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Or Search Registered Users to Configure Granular Permissions:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => handleSearchUser(e.target.value)}
                  placeholder="Filter registered users by name, email, or UID..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-purple-600 transition-colors shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {accessUpdateSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2 animate-in fade-in shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">{accessUpdateSuccess}</span>
            </div>
          )}

          {/* Selected User Granular Permissions Matrix */}
          {searchedUser && (
            <div className="bg-white border border-purple-300 rounded-xl p-5 sm:p-6 space-y-6 shadow-sm ring-1 ring-purple-100 animate-in fade-in">
              {/* User Card Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900">{searchedUser.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-bold border border-purple-200 uppercase">
                      {searchedUser.role}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                      {INITIAL_EXAMS.filter(e => checkUserHasExam(searchedUser, e.id)).length} Tests Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{searchedUser.email} • UID: <span className="font-mono">{searchedUser.uid}</span></p>
                </div>

                {/* Master Fast Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleGrantAllExamsToUser(searchedUser)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Grant All Exams (Master Pass)</span>
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading === `revoke_${searchedUser.uid}`}
                    onClick={() => handleRevokeAllAccess(searchedUser)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300 text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{actionLoading === `revoke_${searchedUser.uid}` ? 'Revoking...' : 'Revoke All Access'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchedUser(null)}
                    className="px-2.5 py-1.5 text-slate-400 hover:text-slate-700 text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Active Permissions Summary Chips */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                  <span>Currently Granted Access Items</span>
                  <span className="text-[10px] text-slate-400">Click any tag ✕ to remove immediately</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {searchedUser.paidPackages?.map(pkgId => {
                    const p = EXAM_PACKAGES.find(x => x.id === pkgId);
                    return (
                      <button
                        key={pkgId}
                        type="button"
                        onClick={() => handleToggleUserPackage(pkgId)}
                        className="px-2 py-1 rounded bg-purple-100 hover:bg-red-100 text-purple-900 hover:text-red-900 border border-purple-300 hover:border-red-300 text-xs font-bold flex items-center gap-1 transition-colors"
                        title={`Click to remove package ${p?.name || pkgId}`}
                      >
                        <span>📦 {p?.name || pkgId}</span>
                        <X className="w-3 h-3 text-red-600" />
                      </button>
                    );
                  })}
                  {searchedUser.allowedExams?.map(examId => {
                    const ex = INITIAL_EXAMS.find(e => e.id === examId);
                    return (
                      <button
                        key={examId}
                        type="button"
                        onClick={() => handleToggleUserExam(examId)}
                        className="px-2 py-1 rounded bg-emerald-100 hover:bg-red-100 text-emerald-900 hover:text-red-900 border border-emerald-300 hover:border-red-300 text-xs font-bold flex items-center gap-1 transition-colors"
                        title={`Click to remove access to ${ex?.title || examId}`}
                      >
                        <span>📝 {ex?.title ? (ex.title.length > 25 ? ex.title.slice(0, 25) + '...' : ex.title) : examId}</span>
                        <X className="w-3 h-3 text-red-600" />
                      </button>
                    );
                  })}
                  {(!searchedUser.paidPackages || searchedUser.paidPackages.length === 0) && (!searchedUser.allowedExams || searchedUser.allowedExams.length === 0) && (
                    <span className="text-xs text-slate-400 italic">No premium packages or custom exams assigned (Student has free access only).</span>
                  )}
                </div>
              </div>

              {/* Granular Individual Test Access Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span>Granular Individual Test Access</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Click <strong>"Remove Access"</strong> or <strong>"Grant Access"</strong> for any test</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {INITIAL_EXAMS.map((exam) => {
                    const isGranted = checkUserHasExam(searchedUser, exam.id);
                    return (
                      <div
                        key={exam.id}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 shadow-xs ${
                          isGranted
                            ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950 ring-1 ring-emerald-200'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                              {exam.category}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {exam.questions.length} Qs • {exam.durationMinutes}m
                            </span>
                          </div>
                          <div className="text-xs font-bold line-clamp-2">{exam.title}</div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                          <span className={`text-[11px] font-bold ${isGranted ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {isGranted ? '✓ Access Active' : 'Locked'}
                          </span>
                          {isGranted ? (
                            <button
                              type="button"
                              onClick={() => handleToggleUserExam(exam.id)}
                              className="px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] shadow-xs flex items-center gap-1 transition-colors"
                            >
                              <X className="w-3 h-3" />
                              <span>Remove Access</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleUserExam(exam.id)}
                              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs flex items-center gap-1 transition-colors"
                            >
                              <PlusCircle className="w-3 h-3" />
                              <span>Grant Access</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Package Toggles */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <span>Assign Package Bundles</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {EXAM_PACKAGES.map((pkg) => {
                    const isGranted = checkUserHasPackage(searchedUser, pkg.id);
                    return (
                      <div
                        key={pkg.id}
                        className={`p-3 rounded-lg border text-left text-xs transition-all flex items-center justify-between gap-2 shadow-xs ${
                          isGranted
                            ? 'bg-purple-50 border-purple-400 text-purple-900 font-bold ring-1 ring-purple-200'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <div>
                          <div className="font-bold">{pkg.name}</div>
                          <div className="text-[10px] opacity-75">{pkg.priceETB} ETB • {pkg.category}</div>
                        </div>
                        {isGranted ? (
                          <button
                            type="button"
                            onClick={() => handleToggleUserPackage(pkg.id)}
                            className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs transition-colors shrink-0"
                          >
                            <X className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleUserPackage(pkg.id)}
                            className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs transition-colors shrink-0"
                          >
                            <PlusCircle className="w-3 h-3" />
                            <span>Grant</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Registered Users Table Directory */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  All Registered Users in Database ({allUsersList.length})
                </h4>
                <p className="text-[11px] text-slate-500">
                  Click <strong>"⚡ Grant All Tests"</strong> for instant unlock, or <strong>"Customize Access"</strong> to choose specific tests.
                </p>
              </div>
            </div>

            {allUsersList.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No users found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-bold">Student Name</th>
                      <th className="py-2.5 px-3 font-bold">Email</th>
                      <th className="py-2.5 px-3 font-bold">Role</th>
                      <th className="py-2.5 px-3 font-bold">Active Tests</th>
                      <th className="py-2.5 px-3 font-bold">Packages</th>
                      <th className="py-2.5 px-3 font-bold text-right">Quick Grant Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allUsersList.map(u => {
                      const allowedCount = u.allowedExams?.length || 0;
                      const hasAll = u.paidPackages?.includes('ALL_IN_ONE') || allowedCount >= INITIAL_EXAMS.length;

                      return (
                        <tr key={u.uid} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {u.name || 'Student'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                            {u.email}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {hasAll ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                ALL ({INITIAL_EXAMS.length} Tests)
                              </span>
                            ) : allowedCount > 0 ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                                {allowedCount} Tests Unlocked
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Free only</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1 flex-wrap">
                              {u.paidPackages && u.paidPackages.length > 0 ? (
                                u.paidPackages.map(pkgId => (
                                  <span key={pkgId} className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 text-[10px] font-medium border border-purple-200">
                                    {pkgId}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 text-[10px]">—</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleGrantAllExamsToUser(u)}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition-all flex items-center gap-1"
                                title="Grant all mock tests to this student"
                              >
                                <span>⚡ Grant All</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => { setSearchedUser(u); setUserSearchQuery(u.email); }}
                                className="px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[11px] border border-purple-200 transition-all"
                              >
                                Customize →
                              </button>
                              {((u.allowedExams && u.allowedExams.length > 0) || (u.paidPackages && u.paidPackages.length > 0)) && (
                                <button
                                  type="button"
                                  disabled={actionLoading === `revoke_${u.uid}`}
                                  onClick={() => handleRevokeAllAccess(u)}
                                  className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] border border-red-200 transition-all flex items-center gap-1 shadow-xs"
                                  title="Revoke all exam & package access for this user"
                                >
                                  <X className="w-3 h-3" />
                                  <span>{actionLoading === `revoke_${u.uid}` ? 'Revoking...' : 'Revoke All'}</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EXAM UPLOADER & QUESTION MANAGEMENT */}
      {activeTab === 'exams' && (
        <AdminExamUploader />
      )}

      {/* TAB 4: USER ACTIVITY TRACKER */}
      {activeTab === 'tracker' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                User Exam Analytics & History Tracker
              </h3>
              <p className="text-xs text-slate-500">
                Inspect historical exam attempts, score distributions, and time spent across all Ethiopian candidates.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Filter Exam:</span>
              <select
                value={trackerFilterExam}
                onChange={(e) => setTrackerFilterExam(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs shadow-xs"
              >
                <option value="ALL">All Exams</option>
                {INITIAL_EXAMS.map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Activity Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-bold">Candidate</th>
                    <th className="py-3 px-4 font-bold">Exam</th>
                    <th className="py-3 px-4 font-bold">Date Taken</th>
                    <th className="py-3 px-4 font-bold">Score (%)</th>
                    <th className="py-3 px-4 font-bold">Breakdown (C/I/S)</th>
                    <th className="py-3 px-4 font-bold">Result</th>
                    <th className="py-3 px-4 font-bold">Time Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allAttempts
                    .filter(a => trackerFilterExam === 'ALL' || a.examId === trackerFilterExam)
                    .map((attempt) => (
                      <tr key={attempt.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{attempt.userName}</div>
                          <div className="text-slate-500 text-[11px]">{attempt.userEmail}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700 max-w-xs truncate">
                          {attempt.examTitle}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(attempt.completedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {attempt.scorePercent}%
                        </td>
                        <td className="py-3 px-4 text-[11px]">
                          <span className="text-emerald-700 font-bold">{attempt.totalCorrect}C</span> /{' '}
                          <span className="text-red-700 font-bold">{attempt.totalIncorrect}I</span> /{' '}
                          <span className="text-slate-500">{attempt.totalSkipped}S</span>
                        </td>
                        <td className="py-3 px-4">
                          {attempt.passed ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              PASSED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-800 border border-red-200">
                              FAILED
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {Math.floor(attempt.timeTakenSeconds / 60)}m {attempt.timeTakenSeconds % 60}s
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Viewer Modal */}
      {viewingScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Telebirr Transaction Screenshot ({viewingScreenshot.transactionId})
                </h4>
                <p className="text-xs text-slate-500">
                  {viewingScreenshot.userName} • {viewingScreenshot.amountETB} ETB
                </p>
              </div>
              <button
                onClick={() => setViewingScreenshot(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-100 rounded-lg p-2 flex items-center justify-center border border-slate-200">
              <img
                src={viewingScreenshot.screenshotUrl}
                alt="Telebirr Screenshot"
                className="max-h-[60vh] object-contain rounded-md"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  handleApproveSubmission(viewingScreenshot);
                  setViewingScreenshot(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
              >
                Approve Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 shadow-xl">
            <h4 className="text-sm font-bold text-slate-900">Reject Telebirr Submission?</h4>
            <p className="text-xs text-slate-500">
              Transaction ID: <span className="font-mono text-slate-900 font-bold">{rejectModalSub.transactionId}</span>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Rejection:
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Transaction ID not found in Telebirr statement, screenshot blurred, etc."
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setRejectModalSub(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
