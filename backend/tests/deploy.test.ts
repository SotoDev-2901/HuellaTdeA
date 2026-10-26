import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { pool } from '../src/config/db.js';
import { env } from '../src/config/env.js';
import { parseSender, sendMail } from '../src/shared/mail/mailer.js';

const server = app.listen(0);
const { port } = server.address() as { port: number };
const baseUrl = `http://localhost:${port}`;

test('Despliegue: /health responde ok y /health/db confirma la conexión a la base de datos', async () => {
  assert.equal((await fetch(`${baseUrl}/health`)).status, 200);
  const db = await fetch(`${baseUrl}/health/db`);
  assert.equal(db.status, 200);
  assert.deepEqual(await db.json(), { status: 'ok', database: 'ok' });
});

test('Despliegue: CORS solo permite el origen del frontend configurado', async () => {
  const allowed = await fetch(`${baseUrl}/health`, { headers: { Origin: env.corsOrigins[0] } });
  assert.equal(allowed.headers.get('access-control-allow-origin'), env.corsOrigins[0]);
  const denied = await fetch(`${baseUrl}/health`, { headers: { Origin: 'https://sitio-malicioso.example' } });
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
});

test('Correo: parseSender separa nombre y correo del remitente', () => {
  assert.deepEqual(parseSender('Huella TdeA <no-reply@tdea.edu.co>'), { name: 'Huella TdeA', email: 'no-reply@tdea.edu.co' });
  assert.deepEqual(parseSender('"Huella TdeA" <a@b.co>'), { name: 'Huella TdeA', email: 'a@b.co' });
  assert.deepEqual(parseSender('solo@correo.co'), { email: 'solo@correo.co' });
});

test('Correo: con proveedor brevo envía por la API HTTPS con la clave y el remitente correctos', async () => {
  const previous = { ...env.mail };
  const realFetch = globalThis.fetch;
  let captured: { url: string; headers: Record<string, string>; body: any } | null = null;
  env.mail.provider = 'brevo';
  env.mail.brevoApiKey = 'clave-brevo-prueba';
  env.mail.from = 'Huella TdeA <remitente@correo.co>';
  globalThis.fetch = (async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    captured = { url: String(input), headers: init?.headers as Record<string, string>, body: JSON.parse(String(init?.body)) };
    return new Response('{}', { status: 201 });
  }) as typeof fetch;
  try {
    await sendMail('persona@correo.tdea.edu.co', 'Asunto', '<p>Hola</p>');
    assert.equal(captured!.url, 'https://api.brevo.com/v3/smtp/email');
    assert.equal(captured!.headers['api-key'], 'clave-brevo-prueba');
    assert.deepEqual(captured!.body.sender, { name: 'Huella TdeA', email: 'remitente@correo.co' });
    assert.deepEqual(captured!.body.to, [{ email: 'persona@correo.tdea.edu.co' }]);
    assert.equal(captured!.body.htmlContent, '<p>Hola</p>');

    globalThis.fetch = (async () => new Response('Unauthorized', { status: 401 })) as typeof fetch;
    await assert.rejects(() => sendMail('persona@correo.tdea.edu.co', 'x', 'y'), /Brevo respondió 401/);
  } finally {
    globalThis.fetch = realFetch;
    Object.assign(env.mail, previous);
  }
});

after(async () => {
  await pool.end();
  server.close();
});
