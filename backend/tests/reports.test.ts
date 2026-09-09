import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import { app } from '../src/app.js';
import { pool } from '../src/config/db.js';

const server = app.listen(0);
const { port } = server.address() as { port: number };
const baseUrl = `http://localhost:${port}`;

const ADMIN_EMAIL = 'test.admin.reportes@correo.tdea.edu.co';
const ADMIN_PASSWORD = 'Admin12345';

const createdEmails: string[] = [ADMIN_EMAIL];
const createdZoneNames: string[] = [];
const createdZoneIds: string[] = [];

async function ensureAdmin(): Promise<void> {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role, email_verified)
     VALUES ('Admin Test Reportes', $1, $2, 'administrador', true)
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
  const email = `reportes-estudiante.${Date.now()}@correo.tdea.edu.co`;
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

async function addConsumption(adminToken: string, zoneId: string, kwh: number, recordedAt: string) {
  await fetch(`${baseUrl}/api/consumption`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ zoneId, kwh, recordedAt }),
  });
}

async function addWaste(
  adminToken: string,
  zoneId: string,
  wasteType: string,
  kg: number,
  recordedAt: string,
) {
  await fetch(`${baseUrl}/api/waste`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ zoneId, wasteType, kg, recordedAt }),
  });
}

async function api(path: string, token: string | null) {
  const res = await fetch(`${baseUrl}/api/reports${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

let adminToken: string;

before(async () => {
  await ensureAdmin();
  adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
});

test('HU-09: rechaza el acceso sin token', async () => {
  const { status } = await api('/institutional', null);
  assert.equal(status, 401);
});

test('HU-09: rechaza a un usuario que no es administrador', async () => {
  const studentToken = await createStudent();
  const { status, data } = await api('/institutional', studentToken);
  assert.equal(status, 403);
  assert.match(data.message, /permisos/);
});

test('HU-09: calcula la huella institucional de una zona a partir de consumo y residuos', async () => {
  const zoneId = await createZone(adminToken, 'Bloque Reportes');
  await addConsumption(adminToken, zoneId, 1000, '2026-05-01');
  await addWaste(adminToken, zoneId, 'organico', 50, '2026-05-01');

  const { status, data } = await api('/institutional', adminToken);
  assert.equal(status, 200);

  const zone = data.zones.find((z: { zone_id: string }) => z.zone_id === zoneId);
  assert.ok(zone, 'la zona debe aparecer en el reporte');
  assert.equal(Number(zone.total_kwh), 1000);
  assert.equal(Number(zone.total_waste_kg), 50);
  // 1000 kWh * 0.199 kgCO2e/kWh (UPME)
  assert.equal(Number(zone.electricity_kg_co2e), 199);
  // 50 kg * 1.54 kgCO2e/kg (IPCC 2006 vía MVC Colombia)
  assert.equal(Number(zone.waste_kg_co2e), 77);
  assert.equal(Number(zone.total_kg_co2e), 276);
});

test('HU-09: una zona sin registros aparece con huella en cero, no se omite', async () => {
  const zoneId = await createZone(adminToken, 'Zona Sin Datos');

  const { data } = await api('/institutional', adminToken);
  const zone = data.zones.find((z: { zone_id: string }) => z.zone_id === zoneId);

  assert.ok(zone);
  assert.equal(Number(zone.total_kwh), 0);
  assert.equal(Number(zone.total_waste_kg), 0);
  assert.equal(Number(zone.total_kg_co2e), 0);
});

test('HU-09: el filtro de fechas excluye registros fuera del rango', async () => {
  const zoneId = await createZone(adminToken, 'Bloque Filtro Fechas');
  await addConsumption(adminToken, zoneId, 500, '2020-01-01');
  await addConsumption(adminToken, zoneId, 300, '2026-06-01');

  const { data } = await api('/institutional?from=2026-01-01&to=2026-12-31', adminToken);
  const zone = data.zones.find((z: { zone_id: string }) => z.zone_id === zoneId);

  assert.ok(zone);
  assert.equal(Number(zone.total_kwh), 300);
});

after(async () => {
  if (createdZoneIds.length > 0) {
    await pool.query('DELETE FROM consumption_records WHERE zone_id = ANY($1)', [createdZoneIds]);
    await pool.query('DELETE FROM waste_records WHERE zone_id = ANY($1)', [createdZoneIds]);
  }
  if (createdZoneNames.length > 0) {
    await pool.query('DELETE FROM zones WHERE name = ANY($1)', [createdZoneNames]);
  }
  await pool.query('DELETE FROM users WHERE email = ANY($1)', [createdEmails]);
  await pool.end();
  server.close();
});
