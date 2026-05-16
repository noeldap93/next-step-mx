const Anthropic = require('@anthropic-ai/sdk');

// Reglas mínimas del agente que SIEMPRE aplican (independientemente del
// system prompt almacenado en Firestore). Se concatenan al final del prompt
// del usuario para garantizar el contrato con la tool present_choices.
const TOOL_USAGE_RULES = `Reglas de uso de la herramienta "present_choices":
- Una pregunta a la vez.
- Si la pregunta tiene un conjunto razonablemente cerrado de respuestas, usa "present_choices".
- Si la pregunta es abierta, responde con texto plano (sin la herramienta).
- Cuando uses "present_choices", la pregunta va en el campo "question"; NO la repitas también como texto plano.`;

// Names allowed for "icon" — must match keys exposed in the client (Icons.jsx).
const ALLOWED_ICONS = [
  'bot', 'agent', 'auto', 'chat', 'app', 'flow', 'web',
  'circuit', 'cash', 'trend', 'clock', 'gear', 'rocket',
];

const PRESENT_CHOICES_TOOL = {
  name: 'present_choices',
  description:
    'Muestra opciones seleccionables al usuario. Úsala cuando la respuesta esperada sea una de un conjunto cerrado. ' +
    'Si la pregunta es abierta (texto libre), NO uses esta herramienta — responde con texto.',
  input_schema: {
    type: 'object',
    properties: {
      question: {
        type: 'string',
        description: 'Pregunta a mostrar arriba de las opciones.',
      },
      options: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Identificador estable de la opción.' },
            label: { type: 'string', description: 'Texto visible al usuario.' },
            icon: {
              type: 'string',
              description:
                'Nombre de ícono. Permitidos: ' + ALLOWED_ICONS.join(', ') + '. Omitir si ninguno aplica.',
            },
          },
          required: ['id', 'label'],
        },
      },
      multi_select: {
        type: 'boolean',
        description: 'true si el usuario puede elegir más de una opción.',
      },
      include_other: {
        type: 'boolean',
        description: 'true para incluir una opción "Otro" con texto libre.',
      },
    },
    required: ['question', 'options'],
  },
};

function getClient(apiKey) {
  if (!apiKey) {
    const err = new Error('ANTHROPIC_API_KEY is not configured');
    err.status = 500;
    throw err;
  }
  return new Anthropic({ apiKey });
}

async function callAnthropic({ apiKey, model, systemPrompt, messages, extraSystem }) {
  const client = getClient(apiKey);

  if (typeof systemPrompt !== 'string' || !systemPrompt.trim()) {
    const err = new Error('systemPrompt is required');
    err.status = 500;
    throw err;
  }

  const parts = [systemPrompt.trim(), TOOL_USAGE_RULES];
  if (extraSystem) parts.push(extraSystem);
  const system = parts.join('\n\n');

  const resp = await client.messages.create({
    model,
    max_tokens: 1024,
    system,
    tools: [PRESENT_CHOICES_TOOL],
    messages,
  });

  return resp;
}

module.exports = {
  callAnthropic,
  TOOL_USAGE_RULES,
  PRESENT_CHOICES_TOOL,
  ALLOWED_ICONS,
};
