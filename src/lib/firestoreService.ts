import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  writeBatch 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { JournalEntry, ChatMessage, BrainstormBoard } from '../types';
import { sanitizePayload } from '../utils/storage';

/**
 * Helper to get local isolated storage key for a user
 */
function getLocalKey(uid: string, category: string): string {
  return `paradigm_isolated_${uid}_${category}`;
}

// ================= JOURNAL ENTRIES ================= //

export async function fetchUserEntries(uid: string, isDemo = false): Promise<JournalEntry[]> {
  if (isFirebaseConfigured && db && !isDemo) {
    try {
      const entriesRef = collection(db, 'users', uid, 'entries');
      const q = query(entriesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      // Return empty array if user has no entries - NEVER auto-seed on read!
      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs.map((d) => d.data() as JournalEntry);
    } catch (err) {
      console.warn('[Firestore] Error fetching entries, reading isolated local store:', err);
    }
  }

  // Isolated local storage fallback
  const localKey = getLocalKey(uid, 'entries');
  const raw = localStorage.getItem(localKey);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveUserEntry(uid: string, entry: JournalEntry, isDemo = false): Promise<void> {
  const sanitized = sanitizePayload(entry);

  if (isFirebaseConfigured && db && !isDemo) {
    try {
      const entryRef = doc(db, 'users', uid, 'entries', entry.id);
      await setDoc(entryRef, sanitized, { merge: true });
      return;
    } catch (err) {
      console.warn('[Firestore] Error saving entry to cloud:', err);
    }
  }

  // Isolated local storage
  const localKey = getLocalKey(uid, 'entries');
  const raw = localStorage.getItem(localKey);
  let existing: JournalEntry[] = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) existing = parsed;
    } catch {
      existing = [];
    }
  }

  const idx = existing.findIndex((e) => e.id === entry.id);
  let updated: JournalEntry[];
  if (idx >= 0) {
    updated = existing.map((e) => (e.id === entry.id ? sanitized : e));
  } else {
    updated = [sanitized, ...existing];
  }
  localStorage.setItem(localKey, JSON.stringify(updated));
}

export async function deleteUserEntry(uid: string, entryId: string, isDemo = false): Promise<void> {
  if (isFirebaseConfigured && db && !isDemo) {
    try {
      const entryRef = doc(db, 'users', uid, 'entries', entryId);
      await deleteDoc(entryRef);
      return;
    } catch (err) {
      console.warn('[Firestore] Error deleting entry from cloud:', err);
    }
  }

  const localKey = getLocalKey(uid, 'entries');
  const raw = localStorage.getItem(localKey);
  if (raw) {
    try {
      const existing: JournalEntry[] = JSON.parse(raw);
      if (Array.isArray(existing)) {
        const updated = existing.filter((e) => e.id !== entryId);
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
    } catch {
      // ignore
    }
  }
}

// ================= MULTI-TURN CHAT MESSAGES ================= //

export async function fetchUserChats(uid: string, isDemo = false): Promise<ChatMessage[]> {
  if (isFirebaseConfigured && db && !isDemo) {
    try {
      const chatRef = collection(db, 'users', uid, 'chats');
      const q = query(chatRef, orderBy('timestamp', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => d.data() as ChatMessage);
    } catch (err) {
      console.warn('[Firestore] Error fetching chats:', err);
    }
  }

  const localKey = getLocalKey(uid, 'chats');
  const raw = localStorage.getItem(localKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveUserChat(uid: string, message: ChatMessage, isDemo = false): Promise<void> {
  const sanitized = sanitizePayload(message);

  if (isFirebaseConfigured && db && !isDemo) {
    try {
      const msgRef = doc(db, 'users', uid, 'chats', message.id);
      await setDoc(msgRef, sanitized, { merge: true });
      return;
    } catch (err) {
      console.warn('[Firestore] Error saving chat message:', err);
    }
  }

  const localKey = getLocalKey(uid, 'chats');
  const raw = localStorage.getItem(localKey);
  let existing: ChatMessage[] = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) existing = parsed;
    } catch {
      existing = [];
    }
  }
  const updated = [...existing, sanitized];
  localStorage.setItem(localKey, JSON.stringify(updated));
}

export async function clearUserChats(uid: string, isDemo = false): Promise<void> {
  if (isFirebaseConfigured && db && !isDemo) {
    try {
      const chatRef = collection(db, 'users', uid, 'chats');
      const snapshot = await getDocs(chatRef);
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      return;
    } catch (err) {
      console.warn('[Firestore] Error clearing chats:', err);
    }
  }

  const localKey = getLocalKey(uid, 'chats');
  localStorage.removeItem(localKey);
}

// ================= BRAINSTORM BOARDS ================= //

export async function fetchUserBrainstorms(uid: string, isDemo = false): Promise<BrainstormBoard[]> {
  if (isFirebaseConfigured && db && !isDemo) {
    try {
      const ref = collection(db, 'users', uid, 'brainstorms');
      const q = query(ref, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => d.data() as BrainstormBoard);
    } catch (err) {
      console.warn('[Firestore] Error fetching brainstorms:', err);
    }
  }

  const localKey = getLocalKey(uid, 'brainstorms');
  const raw = localStorage.getItem(localKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveUserBrainstorm(uid: string, board: BrainstormBoard, isDemo = false): Promise<void> {
  const sanitized = sanitizePayload(board);

  if (isFirebaseConfigured && db && !isDemo) {
    try {
      const ref = doc(db, 'users', uid, 'brainstorms', board.id);
      await setDoc(ref, sanitized, { merge: true });
      return;
    } catch (err) {
      console.warn('[Firestore] Error saving brainstorm board:', err);
    }
  }

  const localKey = getLocalKey(uid, 'brainstorms');
  const raw = localStorage.getItem(localKey);
  let existing: BrainstormBoard[] = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) existing = parsed;
    } catch {
      existing = [];
    }
  }
  const updated = [sanitized, ...existing.filter((b) => b.id !== board.id)];
  localStorage.setItem(localKey, JSON.stringify(updated));
}

export async function deleteUserBrainstorm(uid: string, boardId: string, isDemo = false): Promise<void> {
  if (isFirebaseConfigured && db && !isDemo) {
    try {
      const ref = doc(db, 'users', uid, 'brainstorms', boardId);
      await deleteDoc(ref);
      return;
    } catch (err) {
      console.warn('[Firestore] Error deleting brainstorm board:', err);
    }
  }

  const localKey = getLocalKey(uid, 'brainstorms');
  const raw = localStorage.getItem(localKey);
  if (raw) {
    try {
      const existing: BrainstormBoard[] = JSON.parse(raw);
      if (Array.isArray(existing)) {
        const updated = existing.filter((b) => b.id !== boardId);
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
    } catch {
      // ignore
    }
  }
}
