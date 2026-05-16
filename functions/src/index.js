const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

admin.initializeApp();

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');

const { handleChat } = require('./chat.js');

exports.chat = onRequest(
  {
    region: 'us-central1',
    secrets: [ANTHROPIC_API_KEY],
    cors: true,
    // Required for Hosting rewrites and direct browser calls to reach the
    // underlying Cloud Run service. Without this, Cloud Run rejects
    // unauthenticated invocations with a 403 ("client does not have permission").
    invoker: 'public',
    timeoutSeconds: 60,
    memory: '512MiB',
  },
  async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204).send('');
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'method_not_allowed' });
      return;
    }
    try {
      await handleChat(req, res, { anthropicApiKey: ANTHROPIC_API_KEY.value() });
    } catch (err) {
      console.error('chat handler failed', err);
      const status = err.status && Number.isInteger(err.status) ? err.status : 500;
      res.status(status).json({ error: err.message || 'internal' });
    }
  }
);
