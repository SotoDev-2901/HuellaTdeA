import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { pool } from '../src/config/db.js';

const server = app.listen(0);
const { port } = server.address() as { port: number };
const baseUrl = `http://localhost:${port}/api/auth`;
const MAILPIT_URL = process.env.MAILPIT_URL || 'http://localhost:8025';

const createdEmails: string[] = [];

function uniqueEmail(label: string): string {
  const email = `${label}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@correo.tdea.edu.co`;
  createdEmails.push(email);
  return email;
}

async function register(body: Record<string, unknown>) {
  const res = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

async function login(body: Record<string, unknown>) {
  const res = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

async function post(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

/** Espera el correo dirigido a `to` cuyo enlace contenga `linkPath`, y devuelve el token extraído. */
async function waitForEmailToken(to: string, linkPath: string, attempts = 10): Promise<string> {
  for (let i = 0; i < attempts; i += 1) {
    const list = await fetch(`${MAILPIT_URL}/api/v1/messages?limit=100`).then((r) => r.json());
    const msg = list.messages.find(
      (m: { To: { Address: string }[]; Snippet: string }) =>
        m.To.some((t) => t.Address === to) && m.Snippet.includes(linkPath),
    );
    if (msg) {
      const full = await fetch(`${MAILPIT_URL}/api/v1/message/${msg.ID}`).then((r) => r.json());
      const match = /token=([a-f0-9]+)/.exec(full.Text as string);
      if (match) return match[1];
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`No llegó el correo con enlace "${linkPath}" para ${to}`);
}

async function registerAndVerify(email: string, password = 'password123') {
  await register({ name: 'Usuario Prueba', email, password, role: 'estudiante' });
  const token = await waitForEmailToken(email, '/verificar-correo');
  await post('/verify-email', { token });
}

test('HU-01: registra un usuario válido, no devuelve token y envía correo de verificación', async () => {
  const email = uniqueEmail('valido');
  const { status, data } = await register({
    name: 'Usuario Prueba',
    email,
    password: 'password123',
    role: 'estudiante',
  });

  assert.equal(status, 201);
  assert.equal(data.user.email, email);
  assert.equal(data.token, undefined, 'no debe iniciar sesión automáticamente sin verificar');
  assert.equal(data.user.password_hash, undefined, 'no debe filtrar el hash de la contraseña');

  const token = await waitForEmailToken(email, '/verificar-correo');
  assert.ok(token);
});

test('HU-01: rechaza correos que no sean del dominio institucional', async () => {
  const { status, data } = await register({
    name: 'Usuario Externo',
    email: 'externo@gmail.com',
    password: 'password123',
    role: 'estudiante',
  });

  assert.equal(status, 400);
  assert.match(data.message, /institucional/);
});

test('HU-01: rechaza un correo ya registrado', async () => {
  const email = uniqueEmail('duplicado');
  const payload = { name: 'Duplicado', email, password: 'password123', role: 'docente' };

  const first = await register(payload);
  assert.equal(first.status, 201);

  const second = await register(payload);
  assert.equal(second.status, 409);
});

test('HU-02: bloquea el login hasta verificar el correo, y permite entrar tras verificarlo', async () => {
  const email = uniqueEmail('verificacion');
  await register({ name: 'Pendiente Verificar', email, password: 'password123', role: 'estudiante' });

  const beforeVerify = await login({ email, password: 'password123' });
  assert.equal(beforeVerify.status, 403);
  assert.match(beforeVerify.data.message, /verificar tu correo/);

  const token = await waitForEmailToken(email, '/verificar-correo');
  const verifyRes = await post('/verify-email', { token });
  assert.equal(verifyRes.status, 200);

  const afterVerify = await login({ email, password: 'password123' });
  assert.equal(afterVerify.status, 200);
  assert.ok(afterVerify.data.token);
});

test('HU-02: rechaza un token de verificación inválido', async () => {
  const { status, data } = await post('/verify-email', { token: 'no-existe-este-token' });
  assert.equal(status, 400);
  assert.match(data.message, /inválido o expiró/);
});

test('HU-02: login con contraseña incorrecta devuelve error genérico', async () => {
  const email = uniqueEmail('login-bad-pass');
  await registerAndVerify(email);

  const { status, data } = await login({ email, password: 'incorrecta' });

  assert.equal(status, 401);
  assert.equal(data.message, 'Credenciales inválidas');
});

test('HU-02: login con correo inexistente devuelve el mismo error genérico', async () => {
  const { status, data } = await login({
    email: 'no-existe@correo.tdea.edu.co',
    password: 'cualquiera',
  });

  assert.equal(status, 401);
  assert.equal(data.message, 'Credenciales inválidas');
});

test('Recuperación de contraseña: flujo completo cambia la contraseña y la anterior deja de servir', async () => {
  const email = uniqueEmail('reset-flow');
  await registerAndVerify(email, 'password123');

  const forgotRes = await post('/forgot-password', { email });
  assert.equal(forgotRes.status, 200);

  const token = await waitForEmailToken(email, '/restablecer-contrasena');
  const resetRes = await post('/reset-password', { token, password: 'nuevaClave456' });
  assert.equal(resetRes.status, 200);

  const oldLogin = await login({ email, password: 'password123' });
  assert.equal(oldLogin.status, 401);

  const newLogin = await login({ email, password: 'nuevaClave456' });
  assert.equal(newLogin.status, 200);
});

test('Recuperación de contraseña: no revela si el correo existe o no', async () => {
  const existing = uniqueEmail('reset-existente');
  await registerAndVerify(existing);

  const forExisting = await post('/forgot-password', { email: existing });
  const forMissing = await post('/forgot-password', { email: 'no-existe@correo.tdea.edu.co' });

  assert.equal(forExisting.status, 200);
  assert.equal(forMissing.status, 200);
  assert.equal(forExisting.data.message, forMissing.data.message);
});

test('Recuperación de contraseña: rechaza un token de reset inválido', async () => {
  const { status, data } = await post('/reset-password', {
    token: 'no-existe-este-token',
    password: 'password123',
  });
  assert.equal(status, 400);
  assert.match(data.message, /inválido o expiró/);
});

after(async () => {
  if (createdEmails.length > 0) {
    await pool.query('DELETE FROM users WHERE email = ANY($1)', [createdEmails]);
  }
  await pool.end();
  server.close();
});
