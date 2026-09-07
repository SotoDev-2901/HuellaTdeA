import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import { app } from '../src/app.js';
import { pool } from '../src/config/db.js';

const server = app.listen(0);
const { port } = server.address() as { port: number };
const baseUrl = `http://localhost:${port}`;

const studentEmail = `cuestionario.${Date.now()}@correo.tdea.edu.co`;
const createdEmails: string[] = [studentEmail];

async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  return data.token;
}

async function post(path: string, token: string, body: Record<string, unknown>) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

async function get(path: string, token: string) {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: res.status, data: await res.json() };
}

let studentToken: string;

const basePayload = {
  transportMode: 'caminar',
  transportKmPerTrip: 2,
  transportDaysPerWeek: 5,
  campusHoursPerDay: 4,
  usesLaptop: true,
  chargesDevices: false,
  wasteFrequency: 'baja',
  dietType: 'vegano',
} as const;

before(async () => {
  const passwordHash = await bcrypt.hash('password123', 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role, email_verified)
     VALUES ('Estudiante Cuestionario', $1, $2, 'estudiante', true)`,
    [studentEmail, passwordHash],
  );
  studentToken = await login(studentEmail, 'password123');
});

test('HU-04: rechaza el acceso sin token', async () => {
  const res = await fetch(`${baseUrl}/api/questionnaire`, { method: 'POST' });
  assert.equal(res.status, 401);
});

test('HU-04: rechaza el envío si falta un campo obligatorio', async () => {
  const { status, data } = await post('/api/questionnaire', studentToken, {
    transportMode: 'carro',
    transportKmPerTrip: 10,
  });
  assert.equal(status, 400);
  assert.ok(data.message);
});

test('HU-04/HU-08: caminar y dieta vegana no generan emisión de transporte, y el total suma las 5 categorías', async () => {
  const { status, data } = await post('/api/questionnaire', studentToken, basePayload);

  assert.equal(status, 201);
  const r = data.response;
  assert.equal(Number(r.transport_kg_co2e), 0);
  assert.ok(Number(r.facilities_kg_co2e) > 0, 'instalaciones debe ser > 0 solo por asistir, sin depender de dispositivos');
  assert.ok(Number(r.devices_kg_co2e) > 0);
  assert.ok(Number(r.waste_kg_co2e) > 0);
  // 500 kg/año (banda vegano) prorrateado a 5 días/semana de asistencia, no el año completo
  assert.equal(Number(r.diet_kg_co2e), Math.round(((500 / 365) * 5 * 52) * 100) / 100);

  const expectedTotal =
    Number(r.transport_kg_co2e) +
    Number(r.facilities_kg_co2e) +
    Number(r.devices_kg_co2e) +
    Number(r.waste_kg_co2e) +
    Number(r.diet_kg_co2e);
  assert.equal(Number(r.total_kg_co2e), Math.round(expectedTotal * 100) / 100);
});

test('HU-08: instalaciones no depende de laptop/carga — sigue siendo > 0 aunque ambos sean No', async () => {
  const { data } = await post('/api/questionnaire', studentToken, {
    ...basePayload,
    usesLaptop: false,
    chargesDevices: false,
    campusHoursPerDay: 6,
  });
  assert.equal(Number(data.response.devices_kg_co2e), 0);
  assert.ok(Number(data.response.facilities_kg_co2e) > 0);
});

test('HU-08: un laboratorio pesa más en instalaciones que una zona verde con las mismas horas', async () => {
  const lab = await post('/api/questionnaire', studentToken, {
    ...basePayload,
    campusSpaces: ['laboratorios'],
  });
  const green = await post('/api/questionnaire', studentToken, {
    ...basePayload,
    campusSpaces: ['zonas_verdes'],
  });
  assert.ok(Number(lab.data.response.facilities_kg_co2e) > Number(green.data.response.facilities_kg_co2e));
});

test('HU-08: un usuario que va en carro tiene más huella de transporte que uno en bicicleta con el mismo recorrido', async () => {
  const bike = await post('/api/questionnaire', studentToken, {
    ...basePayload,
    transportMode: 'bicicleta',
    transportKmPerTrip: 20,
  });
  const car = await post('/api/questionnaire', studentToken, {
    ...basePayload,
    transportMode: 'carro',
    transportKmPerTrip: 20,
  });

  assert.ok(Number(car.data.response.transport_kg_co2e) > Number(bike.data.response.transport_kg_co2e));
});

test('HU-08: si no usa laptop, la huella de dispositivos es 0 aunque tenga horas en campus', async () => {
  const { data } = await post('/api/questionnaire', studentToken, {
    ...basePayload,
    usesLaptop: false,
    chargesDevices: false,
    campusHoursPerDay: 8,
  });
  assert.equal(Number(data.response.devices_kg_co2e), 0);
});

test('HU-08: cargar dispositivos suma una pequeña huella adicional aunque no use laptop', async () => {
  const { data } = await post('/api/questionnaire', studentToken, {
    ...basePayload,
    usesLaptop: false,
    chargesDevices: true,
  });
  assert.ok(Number(data.response.devices_kg_co2e) > 0);
});

test('HU-08: mayor frecuencia de residuos genera mayor huella de residuos', async () => {
  const low = await post('/api/questionnaire', studentToken, { ...basePayload, wasteFrequency: 'baja' });
  const high = await post('/api/questionnaire', studentToken, { ...basePayload, wasteFrequency: 'alta' });
  assert.ok(Number(high.data.response.waste_kg_co2e) > Number(low.data.response.waste_kg_co2e));
});

test('HU-08: asistir menos días reduce proporcionalmente alimentación y residuos (no solo transporte/dispositivos)', async () => {
  const oneDay = await post('/api/questionnaire', studentToken, {
    ...basePayload,
    transportDaysPerWeek: 1,
    dietType: 'carne_frecuente',
    wasteFrequency: 'alta',
  });
  const fiveDays = await post('/api/questionnaire', studentToken, {
    ...basePayload,
    transportDaysPerWeek: 5,
    dietType: 'carne_frecuente',
    wasteFrequency: 'alta',
  });

  assert.ok(
    Number(fiveDays.data.response.diet_kg_co2e) > Number(oneDay.data.response.diet_kg_co2e),
    'la alimentación debe escalar con los días de asistencia',
  );
  assert.ok(
    Number(fiveDays.data.response.waste_kg_co2e) > Number(oneDay.data.response.waste_kg_co2e),
    'los residuos deben escalar con los días de asistencia',
  );
});

test('HU-05 (historial): el usuario ve sus propias respuestas guardadas', async () => {
  const { status, data } = await get('/api/questionnaire', studentToken);
  assert.equal(status, 200);
  assert.ok(Array.isArray(data.responses));
  assert.ok(data.responses.length >= 3);
});

after(async () => {
  await pool.query(
    'DELETE FROM questionnaire_responses WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1))',
    [createdEmails],
  );
  await pool.query('DELETE FROM users WHERE email = ANY($1)', [createdEmails]);
  await pool.end();
  server.close();
});
