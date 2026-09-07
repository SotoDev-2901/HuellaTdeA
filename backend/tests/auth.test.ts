import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { pool } from '../src/config/db.js';

const server = app.listen(0);
const { port } = server.address() as { port: number };
const baseUrl = `http://localhost:${port}/api/auth`;

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

test('HU-01: registra un usuario válido y devuelve token', async () => {
  const email = uniqueEmail('valido');
  const { status, data } = await register({
    name: 'Usuario Prueba',
    email,
    password: 'password123',
    role: 'estudiante',
  });

  assert.equal(status, 201);
  assert.equal(data.user.email, email);
  assert.equal(data.user.role, 'estudiante');
  assert.ok(data.token);
  assert.equal(data.user.password_hash, undefined, 'no debe filtrar el hash de la contraseña');
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

test('HU-02: login con credenciales correctas devuelve token', async () => {
  const email = uniqueEmail('login-ok');
  await register({ name: 'Login OK', email, password: 'password123', role: 'estudiante' });

  const { status, data } = await login({ email, password: 'password123' });

  assert.equal(status, 200);
  assert.equal(data.user.email, email);
  assert.ok(data.token);
});

test('HU-02: login con contraseña incorrecta devuelve error genérico', async () => {
  const email = uniqueEmail('login-bad-pass');
  await register({ name: 'Login Bad', email, password: 'password123', role: 'estudiante' });

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

after(async () => {
  if (createdEmails.length > 0) {
    await pool.query('DELETE FROM users WHERE email = ANY($1)', [createdEmails]);
  }
  await pool.end();
  server.close();
});
