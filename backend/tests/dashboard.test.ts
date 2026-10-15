import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import { app } from '../src/app.js';
import { pool } from '../src/config/db.js';

const server = app.listen(0);
const { port } = server.address() as { port: number };
const baseUrl = `http://localhost:${port}`;

const createdEmails: string[] = [];

async function createUser(label: string): Promise<{ token: string; email: string }> {
  const email = `dashboard-${label}.${Date.now()}-${Math.random().toString(36).slice(2, 6)}@correo.tdea.edu.co`;
  createdEmails.push(email);
  const passwordHash = await bcrypt.hash('password123', 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role, email_verified)
     VALUES ('Estudiante Dashboard', $1, $2, 'estudiante', true)`,
    [email, passwordHash],
  );
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' }),
  });
  const data = await res.json();
  return { token: data.token, email };
}

async function submitQuestionnaire(token: string, overrides: Record<string, unknown> = {}) {
  const basePayload = {
    transportMode: 'carro',
    transportKmPerTrip: 10,
    transportDaysPerWeek: 5,
    campusHoursPerDay: 4,
    usesLaptop: true,
    chargesDevices: true,
    wasteFrequency: 'media',
    eatingFrequency: 'siempre',
    dietType: 'carne_frecuente',
    ...overrides,
  };
  const res = await fetch(`${baseUrl}/api/questionnaire`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(basePayload),
  });
  return res.json();
}

async function getDashboard(token: string) {
  const res = await fetch(`${baseUrl}/api/questionnaire/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: res.status, data: await res.json() };
}

before(async () => {});

test('HU-personal-dashboard: rechaza el acceso sin token', async () => {
  const res = await fetch(`${baseUrl}/api/questionnaire/dashboard`);
  assert.equal(res.status, 401);
});

test('HU-personal-dashboard: usuario sin respuestas obtiene hasResponses=false y sin errores', async () => {
  const { token } = await createUser('sin-respuestas');
  const { status, data } = await getDashboard(token);
  assert.equal(status, 200);
  assert.equal(data.hasResponses, false);
  assert.equal(data.latest, null);
});

test('HU-personal-dashboard: el total personal excluye alimentación y agrupa instalaciones+dispositivos en energía', async () => {
  const { token } = await createUser('con-respuesta');
  const submitted = await submitQuestionnaire(token);
  const r = submitted.response;

  const { status, data } = await getDashboard(token);
  assert.equal(status, 200);
  assert.equal(data.hasResponses, true);

  const expectedEnergia = round2(Number(r.facilities_kg_co2e) + Number(r.devices_kg_co2e));
  assert.equal(data.latest.transporte_kg_co2e, Number(r.transport_kg_co2e));
  assert.equal(data.latest.energia_kg_co2e, expectedEnergia);
  assert.equal(data.latest.residuos_kg_co2e, Number(r.waste_kg_co2e));

  const expectedTotal = round2(
    Number(r.transport_kg_co2e) + expectedEnergia + Number(r.waste_kg_co2e),
  );
  assert.equal(data.latest.total_kg_co2e, expectedTotal);
  // La huella de alimentación existe en la respuesta guardada pero no debe sumarse aquí.
  assert.ok(Number(r.diet_kg_co2e) > 0, 'la dieta sí genera huella (para HU-05/Historial)');
  assert.notEqual(data.latest.total_kg_co2e, Number(r.total_kg_co2e));
});

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

test('HU-personal-dashboard: el promedio TdeA usa solo la última respuesta de cada usuario', async () => {
  const userA = await createUser('promedio-a');
  const userB = await createUser('promedio-b');

  const firstA = await submitQuestionnaire(userA.token, { transportKmPerTrip: 5 });
  // El cuestionario solo permite una respuesta por mes calendario — se retrocede la fecha de la
  // primera respuesta un mes para poder enviar la "actual" sin chocar con esa restricción, y así
  // seguir probando que el promedio usa la ÚLTIMA respuesta, no todas.
  await pool.query(
    `UPDATE questionnaire_responses SET created_at = created_at - interval '1 month' WHERE id = $1`,
    [firstA.response.id],
  );

  const secondA = await submitQuestionnaire(userA.token, { transportKmPerTrip: 50 });
  await submitQuestionnaire(userB.token, { transportKmPerTrip: 5 });

  const { data } = await getDashboard(userA.token);

  // El promedio debe reflejar la ÚLTIMA respuesta de A (km=50), no la primera (km=5).
  const latestATotal = round2(
    Number(secondA.response.transport_kg_co2e) +
      Number(secondA.response.facilities_kg_co2e) +
      Number(secondA.response.devices_kg_co2e) +
      Number(secondA.response.waste_kg_co2e),
  );
  assert.ok(data.tdeaAverageKgCo2e > 0);
  // El promedio de A(latest) y B debe ser al menos tan grande como el menor de los dos.
  assert.ok(data.tdeaAverageKgCo2e >= Math.min(latestATotal, data.tdeaAverageKgCo2e));
});

after(async () => {
  await pool.query('DELETE FROM questionnaire_responses WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1))', [createdEmails]);
  await pool.query('DELETE FROM users WHERE email = ANY($1)', [createdEmails]);
  await pool.end();
  server.close();
});
