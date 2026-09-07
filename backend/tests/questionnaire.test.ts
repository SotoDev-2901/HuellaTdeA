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

test('HU-04/HU-08: caminar y dieta vegana no generan emisión de transporte, y el total suma las 4 categorías', async () => {
  const { status, data } = await post('/api/questionnaire', studentToken, {
    transportMode: 'caminar',
    transportKmPerTrip: 2,
    transportTripsPerWeek: 10,
    deviceHoursPerDay: 3,
    deviceDaysPerWeek: 5,
    wasteKgPerWeek: 1,
    dietType: 'vegano',
  });

  assert.equal(status, 201);
  const r = data.response;
  assert.equal(Number(r.transport_kg_co2e), 0);
  assert.ok(Number(r.devices_kg_co2e) > 0);
  assert.ok(Number(r.waste_kg_co2e) > 0);
  assert.equal(Number(r.diet_kg_co2e), 500);

  const expectedTotal =
    Number(r.transport_kg_co2e) +
    Number(r.devices_kg_co2e) +
    Number(r.waste_kg_co2e) +
    Number(r.diet_kg_co2e);
  assert.equal(Number(r.total_kg_co2e), Math.round(expectedTotal * 100) / 100);
});

test('HU-08: un usuario que va en carro tiene más huella de transporte que uno en bicicleta con el mismo recorrido', async () => {
  const bike = await post('/api/questionnaire', studentToken, {
    transportMode: 'bicicleta',
    transportKmPerTrip: 20,
    transportTripsPerWeek: 5,
    deviceHoursPerDay: 1,
    deviceDaysPerWeek: 1,
    wasteKgPerWeek: 1,
    dietType: 'vegano',
  });
  const car = await post('/api/questionnaire', studentToken, {
    transportMode: 'carro',
    transportKmPerTrip: 20,
    transportTripsPerWeek: 5,
    deviceHoursPerDay: 1,
    deviceDaysPerWeek: 1,
    wasteKgPerWeek: 1,
    dietType: 'vegano',
  });

  assert.ok(Number(car.data.response.transport_kg_co2e) > Number(bike.data.response.transport_kg_co2e));
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
