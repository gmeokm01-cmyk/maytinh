import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  writeBatch,
  getDocs,
  getDocFromServer,
} from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { HistoryItem } from '../types';

// User's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAmTMzjWLZdJHoK2Ho_8JcpPgVKZW25y_k",
  authDomain: "quanlythoigiandocsach.firebaseapp.com",
  projectId: "quanlythoigiandocsach",
  storageBucket: "quanlythoigiandocsach.firebasestorage.app",
  messagingSenderId: "160621229391",
  appId: "1:160621229391:web:ee161cf671a1fa66e1413a",
  measurementId: "G-38LXJD25V1",
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics (optional/supported in browser environments)
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    })
    .catch((err) => {
      console.warn('Analytics initialization skipped:', err);
    });
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

export const COLLECTION_NAME = 'calculator_history';

// Test connection on startup
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is currently offline or unreachable.');
    }
    return false;
  }
}

/**
 * Save or update a single calculation history item into Firestore
 */
export async function saveHistoryToFirestore(item: HistoryItem): Promise<void> {
  const path = `${COLLECTION_NAME}/${item.id}`;
  try {
    // Sanitize object for Firestore (remove undefined values)
    const payload: Record<string, unknown> = {
      id: item.id,
      timestamp: item.timestamp,
      timestampFormatted: item.timestampFormatted || new Date(item.timestamp).toLocaleString('vi-VN'),
      mode: item.mode,
      modeLabel: item.modeLabel,
      expression: item.expression,
      displayExpression: item.displayExpression || item.expression,
      result: item.result,
      category: item.category || 'Standard',
    };

    if (item.decimalResult) payload.decimalResult = item.decimalResult;
    if (item.exactResult) payload.exactResult = item.exactResult;
    if (item.note) payload.note = item.note;
    if (item.variablesSnapshot) payload.variablesSnapshot = item.variablesSnapshot;

    await setDoc(doc(db, COLLECTION_NAME, item.id), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a history item by ID from Firestore
 */
export async function deleteHistoryFromFirestore(id: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Clear all history items in Firestore
 */
export async function clearAllFirestoreHistory(): Promise<void> {
  const path = COLLECTION_NAME;
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Real-time subscription to calculation history stored in Firestore
 */
export function subscribeToFirestoreHistory(
  onUpdate: (items: HistoryItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = COLLECTION_NAME;
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('timestamp', 'desc'),
    limit(100)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: HistoryItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: data.id || docSnap.id,
          timestamp: data.timestamp || Date.now(),
          timestampFormatted: data.timestampFormatted || new Date(data.timestamp || Date.now()).toLocaleString('vi-VN'),
          mode: data.mode || 'calculate',
          modeLabel: data.modeLabel || 'Mode 1: Tính toán',
          expression: data.expression || '',
          displayExpression: data.displayExpression || data.expression || '',
          result: data.result || '',
          decimalResult: data.decimalResult,
          exactResult: data.exactResult,
          note: data.note,
          variablesSnapshot: data.variablesSnapshot,
          category: data.category || 'Standard',
        };
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      if (onError) onError(error);
    }
  );
}
