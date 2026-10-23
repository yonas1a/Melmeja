import { PaymentSubmission, ExamPackage } from '../types';
import {
  db,
  defaultDb,
  payalertDb,
  PAYALERT_DATABASE_ID,
  customDbId,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  onSnapshot,
} from '../lib/firebase';
import { EXAM_PACKAGES, INITIAL_EXAMS } from '../data/examsData';

export interface VerificationResult {
  verified: boolean;
  transactionId: string;
  amount: number | null;
  message: string;
  firestoreDocId?: string;
  firestoreCollection?: string;
  firestoreDatabaseId?: string;
  /** Whether the transaction was already used by another user */
  alreadyClaimed?: boolean;
}

const CANDIDATE_COLLECTIONS = ['payment_from_127', 'transactions', 'telebirr_transactions', 'sms_transactions'];

/**
 * Checks Firestore to verify a TeleBirr transaction ID exists and matches the expected amount.
 *
 * Checks:
 * 1. The Melmeja app database: `ai-studio-ethiopianexampre-d579fcab-b085-4d1f-bfd4-3e051124c7f6`
 * 2. The PayAlert Android database: `ai-studio-android-payalert-5431dfbf-6927-4f62-aacf-d8c24a4a964b`
 * 3. The fallback `(default)` database
 */
export async function verifyTransactionInFirestore(
  transactionId: string,
  expectedAmountETB: number
): Promise<VerificationResult> {
  const cleanId = transactionId.trim().toUpperCase();
  const rawId = transactionId.trim();

  if (!cleanId || cleanId.length < 4) {
    return {
      verified: false,
      transactionId: cleanId,
      amount: null,
      message: 'Transaction ID is too short. Please enter the full ID from your TeleBirr confirmation.',
    };
  }

  // Ordered list of databases to check: Melmeja database (payment_from_127) is priority #1
  const dbsToTry = [
    ...(customDbId ? [{ id: customDbId, label: 'Melmeja DB', instance: db }] : []),
    { id: PAYALERT_DATABASE_ID, label: 'PayAlert DB', instance: payalertDb },
    ...(defaultDb !== db && defaultDb !== payalertDb ? [{ id: '(default)', label: 'Default DB', instance: defaultDb }] : []),
  ];

  let lastPermissionError: { dbLabel: string; dbId: string; error: any } | null = null;
  let lastGenericError: any = null;

  for (const dbEntry of dbsToTry) {
    for (const colName of CANDIDATE_COLLECTIONS) {
      try {
        // 1. Try direct document ID lookup (clean uppercase and raw)
        let docSnap = await getDoc(doc(dbEntry.instance, colName, cleanId));
        if (!docSnap.exists() && rawId !== cleanId) {
          docSnap = await getDoc(doc(dbEntry.instance, colName, rawId));
        }

        // 2. If not found by doc ID, query by transactionId field
        if (!docSnap.exists()) {
          const q = query(
            collection(dbEntry.instance, colName),
            where('transactionId', '==', cleanId)
          );
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            docSnap = querySnap.docs[0];
          } else if (rawId !== cleanId) {
            const qRaw = query(
              collection(dbEntry.instance, colName),
              where('transactionId', '==', rawId)
            );
            const rawSnap = await getDocs(qRaw);
            if (!rawSnap.empty) {
              docSnap = rawSnap.docs[0];
            }
          }
        }

        if (docSnap.exists()) {
          const data = docSnap.data();
          const storedAmount = typeof data.amount === 'number'
            ? data.amount
            : data.amount ? parseFloat(data.amount) : null;
          const claimedByUserId = data.claimedByUserId as string | undefined;

          // Check if already claimed by another user
          if (claimedByUserId) {
            return {
              verified: false,
              transactionId: cleanId,
              amount: storedAmount,
              message: 'This transaction has already been used to activate an account. Each transaction can only be used once.',
              alreadyClaimed: true,
              firestoreDocId: docSnap.id,
              firestoreCollection: colName,
              firestoreDatabaseId: dbEntry.id,
            };
          }

          // Verify amount matches (allow storedAmount >= expectedAmountETB or ±2 ETB rounding)
          if (storedAmount !== null && (storedAmount >= expectedAmountETB || Math.abs(storedAmount - expectedAmountETB) <= 2)) {
            return {
              verified: true,
              transactionId: cleanId,
              amount: storedAmount,
              message: `Transaction verified! Amount ${storedAmount} ETB received (required: ${expectedAmountETB} ETB).`,
              firestoreDocId: docSnap.id,
              firestoreCollection: colName,
              firestoreDatabaseId: dbEntry.id,
            };
          } else if (storedAmount !== null) {
            return {
              verified: false,
              transactionId: cleanId,
              amount: storedAmount,
              message: `Paid amount (${storedAmount} ETB) is less than required (${expectedAmountETB} ETB).`,
              firestoreDocId: docSnap.id,
              firestoreCollection: colName,
              firestoreDatabaseId: dbEntry.id,
            };
          }

          // Transaction exists but amount doesn't match
          if (storedAmount !== null) {
            return {
              verified: false,
              transactionId: cleanId,
              amount: storedAmount,
              message: `Transaction found (${storedAmount} ETB) but does not match the selected package price (${expectedAmountETB} ETB). Please select the correct package.`,
              firestoreDocId: docSnap.id,
              firestoreCollection: colName,
              firestoreDatabaseId: dbEntry.id,
            };
          }

          // Transaction exists but no amount recorded
          return {
            verified: true,
            transactionId: cleanId,
            amount: null,
            message: 'Transaction ID confirmed in system. Proceeding with verification.',
            firestoreDocId: docSnap.id,
            firestoreCollection: colName,
            firestoreDatabaseId: dbEntry.id,
          };
        }
      } catch (err: any) {
        console.warn(`[PaymentVerification] Check failed on db=${dbEntry.label} col=${colName}:`, err);
        if (err?.code === 'permission-denied') {
          lastPermissionError = { dbLabel: dbEntry.label, dbId: dbEntry.id, error: err };
        } else {
          lastGenericError = err;
        }
      }
    }
  }

  // If a permission error occurred across attempts, provide a descriptive instruction
  if (lastPermissionError) {
    console.error('[PaymentVerification] Firestore permission-denied error:', lastPermissionError);
    return {
      verified: false,
      transactionId: cleanId,
      amount: null,
      message: `Permission denied on database '${lastPermissionError.dbId}'. Please open this database in Firebase Console and publish the security rules allowing read on the '${CANDIDATE_COLLECTIONS[0]}' collection.`,
    };
  }

  if (lastGenericError) {
    console.error('[PaymentVerification] Firestore query error:', lastGenericError);
    return {
      verified: false,
      transactionId: cleanId,
      amount: null,
      message: `Verification error: ${lastGenericError.message || 'Could not reach database'}. You can still submit for manual admin review.`,
    };
  }

  // Not found at all
  return {
    verified: false,
    transactionId: cleanId,
    amount: null,
    message: "Transaction ID not found in system. If you just sent it, please wait 30 seconds for the SMS sync and try again, or submit for manual review.",
  };
}

/**
 * After successful verification, marks the transaction as claimed and grants
 * the user access to the specified exam package.
 */
export async function grantAccessAfterVerification(
  userId: string,
  transactionId: string,
  firestoreDocId: string,
  packageId: string,
  firestoreCollection: string = 'transactions',
  firestoreDatabaseId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Mark transaction as claimed in the database where it was verified
    const txTargetDb = firestoreDatabaseId === PAYALERT_DATABASE_ID
      ? payalertDb
      : db;

    try {
      const txDocRef = doc(txTargetDb, firestoreCollection, firestoreDocId);
      await setDoc(txDocRef, {
        claimedByUserId: userId,
        claimedAt: new Date().toISOString(),
        claimedPackageId: packageId,
      }, { merge: true });
    } catch (claimErr) {
      console.warn(`[PaymentVerification] Could not mark transaction as claimed:`, claimErr);
    }

    // 2. Grant the user access to the package and all included exams in Melmeja DB
    const targetPackage = EXAM_PACKAGES.find(p => p.id === packageId);
    let examsToGrant: string[] = targetPackage ? [...targetPackage.includedExamIds] : [];

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

    // 3. Update user document in the main Melmeja database
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const currentPaid = (userData.paidPackages as string[]) || [];
      const currentExams = (userData.allowedExams as string[]) || [];

      const updatedPaid = Array.from(new Set([...currentPaid, packageId]));
      const updatedExams = Array.from(new Set([...currentExams, ...examsToGrant]));

      await updateDoc(userRef, {
        paidPackages: updatedPaid,
        allowedExams: updatedExams,
      });
    } else {
      await setDoc(userRef, {
        id: userId,
        role: 'student',
        paidPackages: [packageId],
        allowedExams: examsToGrant,
        createdAt: new Date().toISOString(),
      }, { merge: true });
    }

    return { success: true };
  } catch (err: any) {
    console.error('[PaymentVerification] Error granting access:', err);
    return {
      success: false,
      error: err.message || 'Failed to grant access after verification.',
    };
  }
}

/**
 * 1. Verify Payment by Transaction ID:
 * Checks if the user's entered transaction ID exists in 'payment_from_127' and matches the required amount.
 */
export async function verifyPayment(
  transactionId: string,
  expectedAmount: number
): Promise<{ success: boolean; payment?: any; error?: string }> {
  const trimmedTxId = transactionId.trim().toUpperCase();
  const docRef = doc(db, 'payment_from_127', trimmedTxId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    // Also try general verifyTransactionInFirestore as fallback across candidate collections
    const fallback = await verifyTransactionInFirestore(transactionId, expectedAmount);
    if (fallback.verified) {
      return { 
        success: true, 
        payment: { transactionId: fallback.transactionId, amount: fallback.amount } 
      };
    }
    return { 
      success: false, 
      error: fallback.message || 'Payment not found yet. Please wait a moment and try again.' 
    };
  }

  const payment = docSnap.data();
  const amount = typeof payment.amount === 'number' ? payment.amount : parseFloat(payment.amount);
  if (amount < expectedAmount) {
    return {
      success: false,
      error: `Paid amount (${amount} ETB) is less than required (${expectedAmount} ETB).`
    };
  }

  return { success: true, payment };
}

/**
 * 2. Real-Time Listener on Checkout Screen:
 * Listens for when the transaction appears in Firestore and automatically triggers callback.
 */
export function listenForPayment(
  transactionId: string,
  onReceived: (payment: any) => void
) {
  const trimmedTxId = transactionId.trim().toUpperCase();
  const docRef = doc(db, 'payment_from_127', trimmedTxId);

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onReceived(docSnap.data());
    }
  });
}

