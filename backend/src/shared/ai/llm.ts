import { env } from '../../config/env.js';

const REQUEST_TIMEOUT_MS = 20_000;

export function isAiConfigured(): boolean {
  return env.ai.apiKey !== '';
}

/**
 * Llama a un proveedor compatible con OpenAI (Groq por defecto) pidiendo una respuesta JSON y
 * devuelve el valor ya parseado. Lanza si la API falla o la respuesta no contiene JSON; quien la
 * usa debe validar la forma con zod (la salida de un modelo nunca se confía tal cual).
 */
export async function completeJson(system: string, user: string, maxTokens = 1500): Promise<unknown> {
  const res = await fetch(`${env.ai.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${env.ai.apiKey}` },
    body: JSON.stringify({
      model: env.ai.model,
      max_tokens: maxTokens,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`La API de IA respondió ${res.status}`);
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content ?? '';
  const match = text.match(/[\[{][\s\S]*[\]}]/);
  if (!match) throw new Error('La respuesta de la IA no contiene JSON');
  return JSON.parse(match[0]);
}
