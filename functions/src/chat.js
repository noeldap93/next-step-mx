const { callAnthropic } = require('./anthropic.js');
const {
  getUser,
  getPrompt,
  getOrCreateConversation,
  loadMessages,
  appendMessage,
  updateConversation,
  incrementQuestionCount,
} = require('./firestore.js');

const MAX_QUESTIONS = parseInt(process.env.MAX_QUESTIONS || '10', 10);
const MODEL = process.env.MODEL || 'claude-sonnet-4-6';

function badRequest(msg) {
  const err = new Error(msg);
  err.status = 400;
  return err;
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

/**
 * Build the Anthropic-shaped messages array from our Firestore log.
 *
 * Persisted message shapes:
 *   - assistant text:        { role: "assistant", text }
 *   - assistant tool_use:    { role: "assistant", tool_use: { id, name, input }, text? }
 *   - user free text:        { role: "user", text }
 *   - user tool_result:      { role: "user", tool_use_id, user_response: {selected, other_text} }
 */
function buildAnthropicMessages(log) {
  const out = [];
  for (const msg of log) {
    if (msg.role === 'assistant') {
      const content = [];
      if (msg.text) content.push({ type: 'text', text: msg.text });
      if (msg.tool_use) {
        content.push({
          type: 'tool_use',
          id: msg.tool_use.id,
          name: msg.tool_use.name,
          input: msg.tool_use.input,
        });
      }
      if (content.length) out.push({ role: 'assistant', content });
    } else if (msg.role === 'user') {
      if (msg.tool_use_id) {
        const ur = msg.user_response || {};
        const parts = [];
        if (Array.isArray(ur.selected) && ur.selected.length) {
          parts.push(`selected: ${ur.selected.join(', ')}`);
        }
        if (ur.other_text) parts.push(`other: ${ur.other_text}`);
        const resultText = parts.join(' | ') || '(no selection)';
        out.push({
          role: 'user',
          content: [{
            type: 'tool_result',
            tool_use_id: msg.tool_use_id,
            content: resultText,
          }],
        });
      } else if (msg.text) {
        out.push({ role: 'user', content: [{ type: 'text', text: msg.text }] });
      }
    }
  }
  return out;
}

function extractAssistantParts(resp) {
  let text = null;
  let toolUse = null;
  for (const block of resp.content || []) {
    if (block.type === 'text' && block.text) {
      text = (text ? text + '\n\n' : '') + block.text;
    } else if (block.type === 'tool_use') {
      toolUse = { id: block.id, name: block.name, input: block.input };
    }
  }
  return { text, toolUse, stopReason: resp.stop_reason, usage: resp.usage };
}

async function handleChat(req, res, { anthropicApiKey }) {
  const body = req.body || {};
  const userId = body.user_id;
  const conversationId = body.conversation_id;
  const userInput = body.user_input || null;

  if (!isNonEmptyString(userId)) throw badRequest('user_id is required');
  if (!isNonEmptyString(conversationId)) throw badRequest('conversation_id is required');

  // The user document must exist and must reference a prompt. The prompt
  // document holds the actual system prompt text. We fail loudly if either
  // piece is missing — this is a config error, not something to silently
  // paper over.
  const user = await getUser(userId);
  if (!user) {
    const err = new Error('user_not_found');
    err.status = 404;
    throw err;
  }
  if (!isNonEmptyString(user.promptId)) {
    const err = new Error('user_has_no_prompt');
    err.status = 409;
    throw err;
  }

  const prompt = await getPrompt(user.promptId);
  if (!prompt) {
    const err = new Error(`prompt_not_found: ${user.promptId}`);
    err.status = 404;
    throw err;
  }
  if (!isNonEmptyString(prompt.content)) {
    const err = new Error(`prompt_empty: ${user.promptId}`);
    err.status = 500;
    throw err;
  }

  const { data: convData } = await getOrCreateConversation(userId, conversationId);

  if (convData.status === 'complete') {
    res.status(409).json({ error: 'conversation_complete', complete: true });
    return;
  }

  // 1. Persist the user input (if any). Two shapes:
  //    - free text (responds to a text question)
  //    - tool_result (responds to a present_choices tool_use)
  let userTurnPersisted = false;
  if (userInput) {
    const log = await loadMessages(userId, conversationId);
    const lastAssistant = [...log].reverse().find((m) => m.role === 'assistant');
    const replyingToTool = lastAssistant?.tool_use?.id || null;

    const userDoc = {
      role: 'user',
      text: isNonEmptyString(userInput.text) ? userInput.text.trim() : null,
      user_response: null,
      tool_use_id: null,
    };

    if (replyingToTool) {
      userDoc.tool_use_id = replyingToTool;
      userDoc.user_response = {
        selected: Array.isArray(userInput.selected) ? userInput.selected : [],
        other_text: isNonEmptyString(userInput.other_text) ? userInput.other_text.trim() : null,
      };
    }

    if (!userDoc.text && !userDoc.user_response) {
      throw badRequest('user_input must contain text or a tool response');
    }

    await appendMessage(userId, conversationId, userDoc);
    await incrementQuestionCount(userId, conversationId);
    userTurnPersisted = true;
  }

  // 2. Reload full history (now including the user turn we just wrote).
  const fullLog = await loadMessages(userId, conversationId);
  const anthropicMessages = buildAnthropicMessages(fullLog);

  // Anthropic requires the first message to be `user`. If the conversation
  // is empty (very first turn), seed with a kickoff prompt.
  if (anthropicMessages.length === 0) {
    anthropicMessages.push({
      role: 'user',
      content: [{
        type: 'text',
        text: 'Inicia la conversación: preséntate brevemente y haz tu primera pregunta.',
      }],
    });
  }

  // 3. Read current question count and decide whether this should be the
  // closing turn.
  const convSnap = await getOrCreateConversation(userId, conversationId);
  const questionCount = convSnap.data.questionCount || 0;
  const reachedLimit = questionCount >= MAX_QUESTIONS;

  const extraSystem = reachedLimit
    ? `IMPORTANTE: el usuario ya alcanzó el límite de ${MAX_QUESTIONS} respuestas. Esta es tu última intervención. Cierra la conversación con un mensaje breve, agradécele y NO uses la herramienta present_choices.`
    : null;

  // 4. Call Anthropic.
  const resp = await callAnthropic({
    apiKey: anthropicApiKey,
    model: MODEL,
    systemPrompt: prompt.content,
    messages: anthropicMessages,
    extraSystem,
  });

  const { text, toolUse, stopReason, usage } = extractAssistantParts(resp);

  // 5. Persist the assistant turn.
  await appendMessage(userId, conversationId, {
    role: 'assistant',
    text: text || null,
    tool_use: toolUse || null,
    meta: { stop_reason: stopReason, usage },
  });

  // 6. If we hit the limit, mark the conversation complete.
  let complete = false;
  if (reachedLimit) {
    await updateConversation(userId, conversationId, { status: 'complete' });
    complete = true;
  }

  res.json({
    assistant: {
      text: text || null,
      tool_use: toolUse
        ? { name: toolUse.name, input: toolUse.input }
        : null,
    },
    questionCount,
    maxQuestions: MAX_QUESTIONS,
    complete,
    userTurnPersisted,
  });
}

module.exports = { handleChat };
