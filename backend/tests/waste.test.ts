import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import { app } from '../src/app.js';
import { pool } from '../src/config/db.js';

const server = app.listen(0);
const { port } = server.address() as { port: number };
const baseUrl = `http://localhost:${port}`;

const ADMIN_EMAIL = 'test.admin.residuos@correo.tdea.edu.co';
const ADMIN_PASSWORD = 'Admin12345';

const createdEmails: string[] = [ADMIN_EMAIL];
const createdZoneNames: string[] = [];
const createdZoneIds: string[] = [];

async function ensureAdmin(): Promise<void> {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role, email_verified)
     VALUES ('Admin Test Residuos', $1, $2, 'administrador', true)
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
  const email = `residuos-estudiante.${Date.now()}@correo.tdea.edu.co`;
  createdEmails.push(email);
  const passwordHash = await bcrypt.hash('password123', 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role, email_verified)
     VALUES ('Estudiante Test', $1, $2, 'estudiante', true)`,
    [email, passwordHash],
  );
  return login(email, 'password123');
}

async function createZone(adminToken: string, label: string): Promise<string> {
  const name = `${label} ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  createdZoneNames.push(name);
  const res = await fetch(`${baseUrl}/api/zones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ name, type: 'academica' }),
  });
  const data = await res.json();
  createdZoneIds.push(data.zone.id);
  return data.zone.id;
}

async function api(path: string, token: string | null, init: RequestInit = {}) {
  const res = await fetch(`${baseUrl}/api/waste${path}`, {
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

test('HU-07: rechaza el acceso sin token', async () => {
  const { status } = await api('/', null);
  assert.equal(status, 401);
});

test('HU-07: rechaza a un usuario que no es administrador', async () => {
  const studentToken = await createStudent();
  const { status, data } = await api('/', studentToken);
  assert.equal(status, 403);
  assert.match(data.message, /permisos/);
});

test('HU-07: rechaza un tipo de residuo inválido', async () => {
  const zoneId = await createZone(adminToken, 'Cafetería Central');
  const { status } = await api('/', adminToken, {
    method: 'POST',
    body: JSON.stringify({ zoneId, wasteType: 'vidrio', kg: 5, recordedAt: '2026-01-15' }),
  });
  assert.equal(status, 400);
});

test('HU-07: rechaza registrar residuos para una zona inexistente', async () => {
  const { status } = await api('/', adminToken, {
    method: 'POST',
    body: JSON.stringify({
      zoneId: '00000000-0000-0000-0000-000000000000',
      wasteType: 'plastico',
      kg: 10,
      recordedAt: '2026-01-15',
    }),
  });
  assert.equal(status, 404);
});

test('HU-07: el administrador registra residuos y aparecen en el listado con el nombre de la zona', async () => {
  const zoneId = await createZone(adminToken, 'Bloque de Ingeniería');
  const created = await api('/', adminToken, {
    method: 'POST',
    body: JSON.stringify({ zoneId, wasteType: 'organico', kg: 42.3, recordedAt: '2026-02-01' }),
  });

  assert.equal(created.status, 201);
  assert.equal(Number(created.data.record.kg), 42.3);
  assert.equal(created.data.record.waste_type, 'organico');
  assert.ok(created.data.record.zone_name);

  const list = await api('/', adminToken);
  assert.equal(list.status, 200);
  assert.ok(list.data.records.some((r: { id: string }) => r.id === created.data.record.id));
});

test('HU-07: el administrador edita un registro de residuos existente', async () => {
  const zoneId = await createZone(adminToken, 'Laboratorio de Biología');
  const created = await api('/', adminToken, {
    method: 'POST',
    body: JSON.stringify({ zoneId, wasteType: 'papel', kg: 8, recordedAt: '2026-03-01' }),
  });
  const recordId = created.data.record.id;

  const updated = await api(`/${recordId}`, adminToken, {
    method: 'PATCH',
    body: JSON.stringify({ kg: 15.6, wasteType: 'plastico' }),
  });

  assert.equal(updated.status, 200);
  assert.equal(Number(updated.data.record.kg), 15.6);
  assert.equal(updated.data.record.waste_type, 'plastico');
});

test('HU-07: el administrador elimina un registro de residuos y deja de aparecer en el listado', async () => {
  const zoneId = await createZone(adminToken, 'Cancha Deportiva');
  const created = await api('/', adminToken, {
    method: 'POST',
    body: JSON.stringify({ zoneId, wasteType: 'plastico', kg: 3, recordedAt: '2026-04-01' }),
  });
  const recordId = created.data.record.id;

  const deleted = await api(`/${recordId}`, adminToken, { method: 'DELETE' });
  assert.equal(deleted.status, 204);

  const list = await api('/', adminToken);
  assert.ok(!list.data.records.some((r: { id: string }) => r.id === recordId));
});

test('HU-07: eliminar un registro inexistente devuelve 404', async () => {
  const { status } = await api('/00000000-0000-0000-0000-000000000000', adminToken, {
    method: 'DELETE',
  });
  assert.equal(status, 404);
});

after(async () => {
  if (createdZoneIds.length > 0) {
    await pool.query('DELETE FROM waste_records WHERE zone_id = ANY($1)', [createdZoneIds]);
  }
  if (createdZoneNames.length > 0) {
    await pool.query('DELETE FROM zones WHERE name = ANY($1)', [createdZoneNames]);
  }
  await pool.query('DELETE FROM users WHERE email = ANY($1)', [createdEmails]);
  await pool.end();
  server.close();
});
