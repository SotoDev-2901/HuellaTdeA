import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import { app } from '../src/app.js';
import { pool } from '../src/config/db.js';

const server = app.listen(0);
const { port } = server.address() as { port: number };
const baseUrl = `http://localhost:${port}`;

const createdEmails: string[] = [];

async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  return data.token;
}

async function createStudent(label: string): Promise<string> {
  const email = `cuestionario-${label}.${Date.now()}-${Math.random().toString(36).slice(2, 6)}@correo.tdea.edu.co`;
  createdEmails.push(email);
  const passwordHash = await bcrypt.hash('password123', 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role, email_verified)
     VALUES ('Estudiante Cuestionario', $1, $2, 'estudiante', true)`,
    [email, passwordHash],
  );
  return login(email, 'password123');
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

const basePayload = {
  transportMode: 'caminar',
  transportKmPerTrip: 2,
  transportDaysPerWeek: 5,
  campusHoursPerDay: 4,
  usesLaptop: true,
  chargesDevices: false,
  wasteFrequency: 'baja',
  eatingFrequency: 'siempre',
  dietType: 'vegano',
} as const;

test('HU-04: rechaza el acceso sin token', async () => {
  const res = await fetch(`${baseUrl}/api/questionnaire`, { method: 'POST' });
  assert.equal(res.status, 401);
});

test('HU-04: rechaza el envío si falta un campo obligatorio', async () => {
  const token = await createStudent('campo-faltante');
  const { status, data } = await post('/api/questionnaire', token, {
    transportMode: 'carro',
    transportKmPerTrip: 10,
  });
  assert.equal(status, 400);
  assert.ok(data.message);
});

test('HU-04/HU-08: caminar y dieta vegana no generan emisión de transporte, y el total suma las 5 categorías', async () => {
  const token = await createStudent('base');
  const { status, data } = await post('/api/questionnaire', token, basePayload);

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
  const token = await createStudent('instalaciones');
  const { data } = await post('/api/questionnaire', token, {
    ...basePayload,
    usesLaptop: false,
    chargesDevices: false,
    campusHoursPerDay: 6,
  });
  assert.equal(Number(data.response.devices_kg_co2e), 0);
  assert.ok(Number(data.response.facilities_kg_co2e) > 0);
});

test('HU-08: un laboratorio pesa más en instalaciones que una zona verde con las mismas horas', async () => {
  const labToken = await createStudent('lab');
  const greenToken = await createStudent('zona-verde');

  const lab = await post('/api/questionnaire', labToken, {
    ...basePayload,
    campusSpaces: ['laboratorios'],
  });
  const green = await post('/api/questionnaire', greenToken, {
    ...basePayload,
    campusSpaces: ['zonas_verdes'],
  });
  assert.ok(Number(lab.data.response.facilities_kg_co2e) > Number(green.data.response.facilities_kg_co2e));
});

test('HU-08: un usuario que va en carro tiene más huella de transporte que uno en bicicleta con el mismo recorrido', async () => {
  const bikeToken = await createStudent('bici');
  const carToken = await createStudent('carro');

  const bike = await post('/api/questionnaire', bikeToken, {
    ...basePayload,
    transportMode: 'bicicleta',
    transportKmPerTrip: 20,
  });
  const car = await post('/api/questionnaire', carToken, {
    ...basePayload,
    transportMode: 'carro',
    transportKmPerTrip: 20,
  });

  assert.ok(Number(car.data.response.transport_kg_co2e) > Number(bike.data.response.transport_kg_co2e));
});

test('HU-08: si no usa laptop, la huella de dispositivos es 0 aunque tenga horas en campus', async () => {
  const token = await createStudent('sin-laptop');
  const { data } = await post('/api/questionnaire', token, {
    ...basePayload,
    usesLaptop: false,
    chargesDevices: false,
    campusHoursPerDay: 8,
  });
  assert.equal(Number(data.response.devices_kg_co2e), 0);
});

test('HU-08: cargar dispositivos suma una pequeña huella adicional aunque no use laptop', async () => {
  const token = await createStudent('carga-dispositivos');
  const { data } = await post('/api/questionnaire', token, {
    ...basePayload,
    usesLaptop: false,
    chargesDevices: true,
  });
  assert.ok(Number(data.response.devices_kg_co2e) > 0);
});

test('HU-08: mayor frecuencia de residuos genera mayor huella de residuos', async () => {
  const lowToken = await createStudent('residuos-baja');
  const highToken = await createStudent('residuos-alta');

  const low = await post('/api/questionnaire', lowToken, { ...basePayload, wasteFrequency: 'baja' });
  const high = await post('/api/questionnaire', highToken, { ...basePayload, wasteFrequency: 'alta' });
  assert.ok(Number(high.data.response.waste_kg_co2e) > Number(low.data.response.waste_kg_co2e));
});

test('HU-08: asistir menos días reduce proporcionalmente alimentación y residuos (no solo transporte/dispositivos)', async () => {
  const oneDayToken = await createStudent('1-dia');
  const fiveDaysToken = await createStudent('5-dias');

  const oneDay = await post('/api/questionnaire', oneDayToken, {
    ...basePayload,
    transportDaysPerWeek: 1,
    dietType: 'carne_frecuente',
    wasteFrequency: 'alta',
  });
  const fiveDays = await post('/api/questionnaire', fiveDaysToken, {
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

test('HU-08: si nunca consume alimentos en la universidad, la huella de alimentación es 0 sin importar la dieta', async () => {
  const token = await createStudent('nunca-come');
  const { data } = await post('/api/questionnaire', token, {
    ...basePayload,
    eatingFrequency: 'nunca',
    dietType: 'carne_frecuente',
  });
  assert.equal(Number(data.response.diet_kg_co2e), 0);
});

test('HU-08: comer "ocasionalmente" en la universidad genera menos huella de alimentación que "siempre"', async () => {
  const occasionalToken = await createStudent('ocasional');
  const alwaysToken = await createStudent('siempre');

  const occasional = await post('/api/questionnaire', occasionalToken, {
    ...basePayload,
    eatingFrequency: 'ocasional',
    dietType: 'carne_frecuente',
  });
  const always = await post('/api/questionnaire', alwaysToken, {
    ...basePayload,
    eatingFrequency: 'siempre',
    dietType: 'carne_frecuente',
  });
  assert.ok(Number(occasional.data.response.diet_kg_co2e) > 0);
  assert.ok(
    Number(occasional.data.response.diet_kg_co2e) < Number(always.data.response.diet_kg_co2e),
  );
});

test('HU-05 (historial): el usuario ve sus propias respuestas guardadas', async () => {
  const token = await createStudent('historial');
  await post('/api/questionnaire', token, basePayload);

  const { status, data } = await get('/api/questionnaire', token);
  assert.equal(status, 200);
  assert.ok(Array.isArray(data.responses));
  assert.ok(data.responses.length >= 1);
});

test('HU-04-cadencia: un usuario nuevo puede responder (canSubmit=true, sin fecha de espera)', async () => {
  const token = await createStudent('elegible-nuevo');
  const { status, data } = await get('/api/questionnaire/eligibility', token);
  assert.equal(status, 200);
  assert.equal(data.canSubmit, true);
  assert.equal(data.nextEligibleDate, null);
});

test('HU-04-cadencia: tras responder, el usuario deja de ser elegible hasta el próximo mes', async () => {
  const token = await createStudent('elegible-tras-envio');
  await post('/api/questionnaire', token, basePayload);

  const { data } = await get('/api/questionnaire/eligibility', token);
  assert.equal(data.canSubmit, false);
  assert.match(data.nextEligibleDate, /^\d{4}-\d{2}-\d{2}$/);
});

test('HU-04-cadencia: un segundo envío en el mismo mes reemplaza la respuesta (no crea otra)', async () => {
  const token = await createStudent('doble-envio');
  const first = await post('/api/questionnaire', token, basePayload);
  assert.equal(first.status, 201);

  const second = await post('/api/questionnaire', token, { ...basePayload, transportMode: 'bicicleta' });
  assert.equal(second.status, 200);
  assert.equal(second.data.replaced, true);
  assert.equal(second.data.response.id, first.data.response.id);
  assert.equal(second.data.response.transport_mode, 'bicicleta');
  assert.equal(Number(second.data.response.transport_kg_co2e), 0);

  const list = await get('/api/questionnaire', token);
  assert.equal(list.data.responses.length, 1, 'el historial no debe duplicar la respuesta del mes');
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
