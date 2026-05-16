const admin = require('firebase-admin');
const db = () => admin.firestore();

function userRef(userId) {
  return db().collection('users').doc(userId);
}

function conversationRef(userId, conversationId) {
  return userRef(userId).collection('conversations').doc(conversationId);
}

function messagesRef(userId, conversationId) {
  return conversationRef(userId, conversationId).collection('messages');
}

function promptRef(promptId) {
  return db().collection('prompts').doc(promptId);
}

async function getUser(userId) {
  const snap = await userRef(userId).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

async function getPrompt(promptId) {
  const snap = await promptRef(promptId).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

async function getOrCreateConversation(userId, conversationId) {
  const ref = conversationRef(userId, conversationId);
  const snap = await ref.get();
  if (snap.exists) return { ref, data: snap.data(), created: false };

  const now = admin.firestore.FieldValue.serverTimestamp();
  const initial = {
    createdAt: now,
    updatedAt: now,
    status: 'active',
    questionCount: 0,
    source: 'chatbot',
  };
  // Ensure parent user doc exists so it shows in console listings (still
  // unlistable to clients per Firestore rules).
  await db().collection('users').doc(userId).set(
    { lastConversationAt: now },
    { merge: true }
  );
  await ref.set(initial);
  return { ref, data: { ...initial, createdAt: null, updatedAt: null }, created: true };
}

async function loadMessages(userId, conversationId) {
  const snap = await messagesRef(userId, conversationId).orderBy('createdAt', 'asc').get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function appendMessage(userId, conversationId, message) {
  const ref = messagesRef(userId, conversationId).doc();
  await ref.set({
    ...message,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return ref.id;
}

async function updateConversation(userId, conversationId, patch) {
  await conversationRef(userId, conversationId).set(
    { ...patch, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  );
}

async function incrementQuestionCount(userId, conversationId) {
  const ref = conversationRef(userId, conversationId);
  await ref.set(
    {
      questionCount: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  const snap = await ref.get();
  return snap.data().questionCount || 0;
}

module.exports = {
  userRef,
  conversationRef,
  messagesRef,
  promptRef,
  getUser,
  getPrompt,
  getOrCreateConversation,
  loadMessages,
  appendMessage,
  updateConversation,
  incrementQuestionCount,
};
