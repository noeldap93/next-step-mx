const ENDPOINT = import.meta.env.VITE_CHAT_ENDPOINT || '/api/chat';

export async function postChat({ userId, conversationId, userInput }) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      conversation_id: conversationId,
      user_input: userInput || null,
    }),
  });

  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json()).error || ''; } catch (_) {}
    throw new Error(`chat ${res.status}: ${detail || res.statusText}`);
  }

  return res.json();
}
