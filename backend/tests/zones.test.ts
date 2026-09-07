import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import { app } from '../src/app.js';
import { pool } from '../src/config/db.js';

const server = app.listen(0);
const { port } = server.address() as { port: number };
const baseUrl = `http://localhost:${port}`;

const ADMIN_EMAIL = 'test.admin@correo.tdea.edu.co';
const ADMIN_PASSWORD = 'Admin12345';

const createdEmails: string[] = [ADMIN_EMAIL];
const createdZoneNames: string[] = [];

async function ensureAdmin(): Promise<void> {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role, email_verified)
     VALUES ('Admin Test', $1, $2, 'administrador', true)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [ADMIN_EMAIL, passwordHash],
  );
}

async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  return data.token;
}

async function createStudent(): Promise<string> {
  const email = `zonas-estudiante.${Date.now()}@correo.tdea.edu.co`;
  createdEmails.push(email);
  const passwordHash = await bcrypt.hash('password123', 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role, email_verified)
     VALUES ('Estudiante Test', $1, $2, 'estudiante', true)`,
    [email, passwordHash],
  );
  return login(email, 'password123');
}

function uniqueZoneName(label: string): string {
  const name = `${label} ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  createdZoneNames.push(name);
  return name;
}

async function api(path: string, token: string | null, init: RequestInit = {}) {
  const res = await fetch(`${baseUrl}/api/zones${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

let adminToken: string;

before(async () => {
  await ensureAdmin();
  adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
});

test('HU-03: rechaza el acceso sin token', async () => {
  const { status } = await api('/', null);
  assert.equal(status, 401);
});

test('HU-03: rechaza a un usuario que no es administrador', async () => {
  const studentToken = await createStudent();
  const { status, data } = await api('/', studentToken);
  assert.equal(status, 403);
  assert.match(data.message, /permisos/);
});

test('HU-03: el administrador crea una zona y aparece en el listado', async () => {
  const name = uniqueZoneName('Biblioteca Central');
  const created = await api('/', adminToken, {
    method: 'POST',
    body: JSON.stringify({ name, description: 'Edificio principal', type: 'academica' }),
  });

  assert.equal(created.status, 201);
  assert.equal(created.data.zone.name, name);
  assert.equal(created.data.zone.status, 'activa');

  const list = await api('/', adminToken);
  assert.equal(list.status, 200);
  assert.ok(list.data.zones.some((z: { name: string }) => z.name === name));
});

test('HU-03: rechaza crear una zona con nombre duplicado', async () => {
  const name = uniqueZoneName('Bloque A');
  const first = await api('/', adminToken, {
    method: 'POST',
    body: JSON.stringify({ name, type: 'administrativa' }),
  });
  assert.equal(first.status, 201);

  const second = await api('/', adminToken, {
    method: 'POST',
    body: JSON.stringify({ name, type: 'administrativa' }),
  });
  assert.equal(second.status, 409);
});

test('HU-03: el administrador edita una zona existente', async () => {
  const name = uniqueZoneName('Laboratorio de Suelos');
  const created = await api('/', adminToken, {
    method: 'POST',
    body: JSON.stringify({ name, type: 'academica' }),
  });
  const zoneId = created.data.zone.id;

  const updated = await api(`/${zoneId}`, adminToken, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'inactiva' }),
  });

  assert.equal(updated.status, 200);
  assert.equal(updated.data.zone.status, 'inactiva');
  assert.equal(updated.data.zone.name, name);
});

test('HU-03: el administrador elimina una zona y deja de aparecer en el listado', async () => {
  const name = uniqueZoneName('Cancha Deportiva');
  const created = await api('/', adminToken, {
    method: 'POST',
    body: JSON.stringify({ name, type: 'administrativa' }),
  });
  const zoneId = created.data.zone.id;

  const deleted = await api(`/${zoneId}`, adminToken, { method: 'DELETE' });
  assert.equal(deleted.status, 204);

  const list = await api('/', adminToken);
  assert.ok(!list.data.zones.some((z: { id: string }) => z.id === zoneId));
});

test('HU-03: eliminar una zona inexistente devuelve 404', async () => {
  const { status } = await api('/00000000-0000-0000-0000-000000000000', adminToken, {
    method: 'DELETE',
  });
  assert.equal(status, 404);
});

after(async () => {
  if (createdZoneNames.length > 0) {
    await pool.query('DELETE FROM zones WHERE name = ANY($1)', [createdZoneNames]);
  }
  await pool.query('DELETE FROM users WHERE email = ANY($1)', [createdEmails]);
  await pool.end();
  server.close();
});
