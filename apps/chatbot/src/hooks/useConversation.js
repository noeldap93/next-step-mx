import { useEffect, useRef, useState, useCallback } from 'react';
import { postChat } from '../lib/api.js';

/**
 * Conversation state machine. Owns the local message log + drives requests
 * to the chat Cloud Function. Rendering a new component with a different
 * conversationId yields a fresh conversation.
 *
 * Local message shape:
 *   { id, role: 'user' | 'assistant', text?, tool_use?, user_response? }
 */
export default function useConversation({ userId, conversationId }) {
  const [messages, setMessages] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [maxQuestions, setMaxQuestions] = useState(null);
  const [complete, setComplete] = useState(false);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState(null);
  const seqRef = useRef(0);
  const startedRef = useRef(false);

  const send = useCallback(async (userInput) => {
    setPending(true);
    setError(null);
    try {
      const res = await postChat({ userId, conversationId, userInput });
      const assistant = res.assistant || {};
      setMessages((prev) => [
        ...prev,
        {
          id: 'a_' + (++seqRef.current),
          role: 'assistant',
          text: assistant.text || null,
          tool_use: assistant.tool_use || null,
        },
      ]);
      if (typeof res.questionCount === 'number') setQuestionCount(res.questionCount);
      if (typeof res.maxQuestions === 'number') setMaxQuestions(res.maxQuestions);
      if (res.complete) setComplete(true);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setPending(false);
    }
  }, [userId, conversationId]);

  // Kick off the conversation once.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    send(null);
  }, [send]);

  /**
   * Submit user input. Optimistically appends a user message locally so the
   * UI updates immediately, then issues the network request.
   */
  const submit = useCallback((userInput) => {
    setMessages((prev) => [
      ...prev,
      {
        id: 'u_' + (++seqRef.current),
        role: 'user',
        text: userInput?.text || null,
        user_response: userInput?.selected || userInput?.other_text
          ? { selected: userInput.selected || [], other_text: userInput.other_text || null }
          : null,
      },
    ]);
    return send(userInput);
  }, [send]);

  return {
    messages,
    questionCount,
    maxQuestions: maxQuestions ?? '∞',
    complete,
    pending,
    error,
    submit,
  };
}
