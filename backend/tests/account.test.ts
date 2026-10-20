import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import { app } from '../src/app.js';
import { pool } from '../src/config/db.js';

const server = app.listen(0);
const { port } = server.address() as { port: number };
const baseUrl = `http://localhost:${port}`;
const createdEmails: string[] = [];

async function createUser(label: string, role: 'estudiante' | 'administrador' = 'estudiante') {
  const email = `account-${label}.${Date.now()}-${Math.random().toString(36).slice(2, 6)}@correo.tdea.edu.co`;
  createdEmails.push(email);
  const passwordHash = await bcrypt.hash('password123', 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role, email_verified) VALUES ('Persona Cuenta', $1, $2, $3, true)`,
    [email, passwordHash, role],
  );
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' }),
  });
  return { token: (await res.json()).token as string, email };
}

const call = async (method: string, path: string, token: string | null, body?: unknown) => {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json() };
};

test('Cuenta: rechaza el acceso sin token', async () => {
  assert.equal((await call('GET', '/api/account', null)).status, 401);
});

test('Cuenta: devuelve el perfil propio sin exponer el hash de la contraseña', async () => {
  const { token, email } = await createUser('perfil');
  const { status, data } = await call('GET', '/api/account', token);
  assert.equal(status, 200);
  assert.equal(data.user.email, email);
  assert.equal(data.user.password_hash, undefined);
});

test('Cuenta: actualiza el nombre y rechaza uno demasiado corto', async () => {
  const { token } = await createUser('nombre');
  const ok = await call('PATCH', '/api/account', token, { name: '  Nombre Nuevo  ' });
  assert.equal(ok.status, 200);
  assert.equal(ok.data.user.name, 'Nombre Nuevo');
  assert.equal((await call('PATCH', '/api/account', token, { name: 'ab' })).status, 400);
});

test('Cuenta: cambia la contraseña con la actual correcta y la anterior deja de servir', async () => {
  const { token, email } = await createUser('clave');
  const wrong = await call('POST', '/api/account/change-password', token, { currentPassword: 'incorrecta1', newPassword: 'nuevaClave123' });
  assert.equal(wrong.status, 400);
  const short = await call('POST', '/api/account/change-password', token, { currentPassword: 'password123', newPassword: 'corta' });
  assert.equal(short.status, 400);

  const ok = await call('POST', '/api/account/change-password', token, { currentPassword: 'password123', newPassword: 'nuevaClave123' });
  assert.equal(ok.status, 200);

  const oldLogin = await call('POST', '/api/auth/login', null, { email, password: 'password123' });
  assert.equal(oldLogin.status, 401);
  const newLogin = await call('POST', '/api/auth/login', null, { email, password: 'nuevaClave123' });
  assert.equal(newLogin.status, 200);
});

test('Cuenta: eliminar exige la contraseña y borra al usuario con sus respuestas', async () => {
  const { token, email } = await createUser('borrar');
  await call('POST', '/api/questionnaire', token, {
    transportMode: 'bicicleta', transportKmPerTrip: 3, transportDaysPerWeek: 3, campusHoursPerDay: 4,
    usesLaptop: true, chargesDevices: false, wasteFrequency: 'baja', eatingFrequency: 'nunca', dietType: 'vegano',
  });
  assert.equal((await call('POST', '/api/account/delete', token, { password: 'incorrecta1' })).status, 400);

  const ok = await call('POST', '/api/account/delete', token, { password: 'password123' });
  assert.equal(ok.status, 200);
  const { rows } = await pool.query('SELECT count(*)::int AS n FROM users WHERE email = $1', [email]);
  assert.equal(rows[0].n, 0);
  const left = await pool.query('SELECT count(*)::int AS n FROM questionnaire_responses WHERE user_id NOT IN (SELECT id FROM users)');
  assert.equal(left.rows[0].n, 0);
});

test('Cuenta: la cuenta de administrador no se puede eliminar desde la aplicación', async () => {
  const { token, email } = await createUser('admin', 'administrador');
  const res = await call('POST', '/api/account/delete', token, { password: 'password123' });
  assert.equal(res.status, 403);
  const { rows } = await pool.query('SELECT count(*)::int AS n FROM users WHERE email = $1', [email]);
  assert.equal(rows[0].n, 1);
});

test('Metodología: requiere sesión y devuelve las 4 categorías con sus factores', async () => {
  assert.equal((await call('GET', '/api/footprint/methodology', null)).status, 401);
  const { token } = await createUser('metodologia');
  const { status, data } = await call('GET', '/api/footprint/methodology', token);
  assert.equal(status, 200);
  assert.deepEqual(data.categories.map((c: { id: string }) => c.id), ['transporte', 'energia', 'residuos', 'alimentacion']);
  const electricity = data.categories[1].factors.find((f: { key: string }) => f.key.includes('SIN'));
  assert.match(electricity.value, /0,199/);
});

after(async () => {
  await pool.query('DELETE FROM users WHERE email = ANY($1)', [createdEmails]);
  await pool.end();
  server.close();
});
