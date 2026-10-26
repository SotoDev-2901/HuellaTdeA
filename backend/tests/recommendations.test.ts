import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import { app } from '../src/app.js';
import { pool } from '../src/config/db.js';
import { env } from '../src/config/env.js';

const server = app.listen(0);
const { port } = server.address() as { port: number };
const baseUrl = `http://localhost:${port}`;
const createdEmails: string[] = [];

async function createUser(label: string): Promise<string> {
  const email = `reco-${label}.${Date.now()}-${Math.random().toString(36).slice(2, 6)}@correo.tdea.edu.co`;
  createdEmails.push(email);
  const passwordHash = await bcrypt.hash('password123', 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role, email_verified) VALUES ('Estudiante Reco', $1, $2, 'estudiante', true)`,
    [email, passwordHash],
  );
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' }),
  });
  return (await res.json()).token;
}

async function submit(token: string) {
  await fetch(`${baseUrl}/api/questionnaire`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      transportMode: 'carro',
      transportKmPerTrip: 12,
      transportDaysPerWeek: 5,
      campusHoursPerDay: 6,
      usesLaptop: true,
      chargesDevices: true,
      wasteFrequency: 'alta',
      eatingFrequency: 'siempre',
      dietType: 'mixto_moderado',
    }),
  });
}

const get = (token: string) =>
  fetch(`${baseUrl}/api/questionnaire/recommendations`, { headers: { Authorization: `Bearer ${token}` } });

test('Recomendaciones: rechaza el acceso sin token', async () => {
  const res = await fetch(`${baseUrl}/api/questionnaire/recommendations`);
  assert.equal(res.status, 401);
});

test('Recomendaciones: usuario sin respuestas obtiene hasResponses=false e items vacíos', async () => {
  const token = await createUser('sin-respuestas');
  const data = await (await get(token)).json();
  assert.equal(data.hasResponses, false);
  assert.deepEqual(data.items, []);
});

test('Recomendaciones: sin clave de IA usa el catálogo de respaldo con 3 categorías ordenadas por huella', async () => {
  const previousKey = env.ai.apiKey;
  env.ai.apiKey = '';
  try {
    const token = await createUser('fallback');
    await submit(token);
    const data = await (await get(token)).json();
    assert.equal(data.source, 'rules');
    assert.equal(data.items.length, 3);
    assert.equal(data.items[0].category, 'transporte'); // carro 12 km × 5 días domina la huella
  } finally {
    env.ai.apiKey = previousKey;
  }
});

test('Recomendaciones: con clave de IA usa la respuesta del modelo y la cachea', async () => {
  const previousKey = env.ai.apiKey;
  const realFetch = globalThis.fetch;
  let aiCalls = 0;
  env.ai.apiKey = 'clave-de-prueba';
  globalThis.fetch = (async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    if (String(input).includes('/chat/completions')) {
      aiCalls += 1;
      const items = [
        { category: 'transporte', title: 'Comparte el carro', description: 'Organiza un viaje compartido con compañeros que vivan cerca de tu ruta.' },
        { category: 'energia', title: 'Usa luz natural', description: 'Elige espacios con buena luz natural y apaga lo que no uses.' },
        { category: 'residuos', title: 'Lleva tu termo', description: 'Un termo reutilizable evita vasos desechables a diario en el campus.' },
      ];
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ recomendaciones: items }) } }] }), { status: 200 });
    }
    return realFetch(input, init);
  }) as typeof fetch;
  try {
    const token = await createUser('ia');
    await submit(token);
    const first = await (await get(token)).json();
    const second = await (await get(token)).json();
    assert.equal(first.source, 'ai');
    assert.equal(first.items[0].title, 'Comparte el carro');
    assert.equal(second.source, 'ai');
    assert.equal(aiCalls, 1, 'la segunda consulta debe salir del caché');
  } finally {
    globalThis.fetch = realFetch;
    env.ai.apiKey = previousKey;
  }
});

test('Recomendaciones: si la IA devuelve menos de 3 categorías se completan con el catálogo', async () => {
  const previousKey = env.ai.apiKey;
  const realFetch = globalThis.fetch;
  env.ai.apiKey = 'clave-de-prueba';
  globalThis.fetch = (async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    if (String(input).includes('/chat/completions')) {
      const items = [{ category: 'energia', title: 'Apaga tu laptop', description: 'Apaga y desconecta tu laptop al terminar la jornada en el campus.' }];
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ recomendaciones: items }) } }] }), { status: 200 });
    }
    return realFetch(input, init);
  }) as typeof fetch;
  try {
    const token = await createUser('ia-incompleta');
    await submit(token);
    const data = await (await get(token)).json();
    assert.equal(data.source, 'ai');
    assert.equal(data.items.length, 3);
    assert.deepEqual([...data.items.map((i: { category: string }) => i.category)].sort(), ['energia', 'residuos', 'transporte']);
    assert.equal(data.items.find((i: { category: string }) => i.category === 'energia').title, 'Apaga tu laptop');
  } finally {
    globalThis.fetch = realFetch;
    env.ai.apiKey = previousKey;
  }
});

test('Recomendaciones: si la IA falla responde con el catálogo de respaldo', async () => {
  const previousKey = env.ai.apiKey;
  const realFetch = globalThis.fetch;
  env.ai.apiKey = 'clave-de-prueba';
  globalThis.fetch = (async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    if (String(input).includes('/chat/completions')) return new Response('error', { status: 500 });
    return realFetch(input, init);
  }) as typeof fetch;
  try {
    const token = await createUser('ia-falla');
    await submit(token);
    const data = await (await get(token)).json();
    assert.equal(data.source, 'rules');
    assert.equal(data.items.length, 3);
  } finally {
    globalThis.fetch = realFetch;
    env.ai.apiKey = previousKey;
  }
});

after(async () => {
  await pool.query('DELETE FROM questionnaire_responses WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1))', [createdEmails]);
  await pool.query('DELETE FROM users WHERE email = ANY($1)', [createdEmails]);
  await pool.end();
  server.close();
});
