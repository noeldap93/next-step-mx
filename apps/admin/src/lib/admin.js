import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase.js';

// Bootstrap admin: this email is always treated as admin regardless of the
// admins/{email} collection. Keep in sync with firestore.rules.
export const BOOTSTRAP_ADMIN_EMAIL = 'aragonknoel@gmail.com';

function adminDocId(email) {
  return String(email || '').trim().toLowerCase();
}

export async function isAdmin(user) {
  if (!user || !user.email) return false;
  const email = adminDocId(user.email);
  if (email === BOOTSTRAP_ADMIN_EMAIL) return true;
  try {
    const snap = await getDoc(doc(db, 'admins', email));
    return snap.exists();
  } catch (err) {
    console.warn('admin lookup failed', err);
    return false;
  }
}

// ----- Admins -----

export async function listAdmins() {
  const q = query(collection(db, 'admins'), orderBy('addedAt', 'asc'));
  const snap = await getDocs(q);
  const fromDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Ensure the bootstrap admin is always shown (even if no doc exists for it).
  if (!fromDocs.some((a) => a.id === BOOTSTRAP_ADMIN_EMAIL)) {
    fromDocs.unshift({
      id: BOOTSTRAP_ADMIN_EMAIL,
      email: BOOTSTRAP_ADMIN_EMAIL,
      bootstrap: true,
    });
  }
  return fromDocs;
}

export async function addAdmin({ email, addedBy }) {
  const id = adminDocId(email);
  if (!id) throw new Error('email_required');
  if (id === BOOTSTRAP_ADMIN_EMAIL) throw new Error('bootstrap_admin_is_implicit');
  await setDoc(doc(db, 'admins', id), {
    email: id,
    addedAt: serverTimestamp(),
    addedBy: addedBy || null,
  });
}

export async function removeAdmin(email) {
  const id = adminDocId(email);
  if (id === BOOTSTRAP_ADMIN_EMAIL) throw new Error('cannot_remove_bootstrap');
  await deleteDoc(doc(db, 'admins', id));
}

// ----- Prompts -----

export async function listPrompts() {
  const snap = await getDocs(collection(db, 'prompts'));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
}

export async function getPrompt(id) {
  const snap = await getDoc(doc(db, 'prompts', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function upsertPrompt({ id, name, description, content, createdBy }) {
  const trimmedId = String(id || '').trim();
  if (!trimmedId) throw new Error('id_required');
  if (!content || !content.trim()) throw new Error('content_required');

  const ref = doc(db, 'prompts', trimmedId);
  const existing = await getDoc(ref);

  const payload = {
    name: name || trimmedId,
    description: description || null,
    content,
    updatedAt: serverTimestamp(),
  };
  if (!existing.exists()) {
    payload.createdAt = serverTimestamp();
    payload.createdBy = createdBy || null;
  }
  await setDoc(ref, payload, { merge: true });
}

export async function deletePrompt(id) {
  await deleteDoc(doc(db, 'prompts', id));
}

// ----- Users -----

export async function listUsers() {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() || 0;
      const tb = b.createdAt?.toMillis?.() || 0;
      return tb - ta;
    });
}

function randomUserId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return 'u_' + crypto.randomUUID().replace(/-/g, '').slice(0, 18);
  }
  return 'u_' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36).slice(-4);
}

export async function createUser({ id, name, promptId, note, createdBy }) {
  const finalId = (id && id.trim()) || randomUserId();
  const ref = doc(db, 'users', finalId);
  const existing = await getDoc(ref);
  if (existing.exists()) throw new Error('user_already_exists');

  await setDoc(ref, {
    name: name || null,
    promptId: promptId || null,
    note: note || null,
    createdAt: serverTimestamp(),
    createdBy: createdBy || null,
  });
  return finalId;
}

export async function updateUser(id, patch) {
  await setDoc(doc(db, 'users', id), {
    ...patch,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function deleteUser(id) {
  await deleteDoc(doc(db, 'users', id));
}

// ----- Conversations (read-only for the admin viewer) -----

export async function listConversations(userId) {
  const q = query(
    collection(db, 'users', userId, 'conversations'),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listMessages(userId, conversationId) {
  const q = query(
    collection(db, 'users', userId, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
