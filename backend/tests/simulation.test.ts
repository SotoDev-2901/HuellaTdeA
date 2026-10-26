import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import { app } from '../src/app.js';
import { pool } from '../src/config/db.js';
import { env } from '../src/config/env.js';
import { calculateTransportEmissions, ELECTRICITY_KG_CO2E_PER_KWH, WASTE_KG_CO2E_PER_KG } from '../src/modules/footprint/emissionFactors.js';
import { simulate, SimulationInputError, type Baseline } from '../src/modules/simulation/simulation.engine.js';

const server = app.listen(0);
const { port } = server.address() as { port: number };
const baseUrl = `http://localhost:${port}`;
const createdEmails: string[] = [];

// ---------- Motor (sin base de datos) ----------
const baseline: Baseline = {
  people: [
    { mode: 'carro', km: 10, days: 5 },
    { mode: 'carro', km: 20, days: 4 },
    { mode: 'moto', km: 8, days: 5 },
    { mode: 'transporte_publico', km: 15, days: 3 },
    { mode: 'bicicleta', km: 4, days: 5 },
  ],
  zones: [
    { name: 'Bloque A', kwh: 10000, waste: { plastico: 100, papel: 50, organico: 200 } },
    { name: 'Laboratorios de Ingeniería', kwh: 20000, waste: { plastico: 40, papel: 10, organico: 20 } },
  ],
};
const near = (a: number, b: number, eps = 0.02) => assert.ok(Math.abs(a - b) <= eps, `${a} no es cercano a ${b}`);

test('Simulador: la huella base coincide con el cálculo real de transporte, energía y residuos', () => {
  const r = simulate(baseline, [{ tipo: 'cambio_transporte', desde: 'carro', hacia: 'bicicleta', porcentaje: 1 }]);
  const transport = baseline.people.reduce((s, p) => s + calculateTransportEmissions(p.mode, p.km, p.days), 0);
  near(r.base.transporte, transport);
  near(r.base.energia, 30000 * ELECTRICITY_KG_CO2E_PER_KWH);
  near(r.base.residuos, 420 * WASTE_KG_CO2E_PER_KG);
});

test('Simulador: un cambio que no afecta a nadie deja el resultado igual', () => {
  const r = simulate(baseline, [{ tipo: 'cambio_transporte', desde: 'transporte_publico', hacia: 'bicicleta', porcentaje: 1 }, ]);
  assert.ok(r.delta.total <= 0);
  const noOne: Baseline = { ...baseline, people: baseline.people.filter((p) => p.mode !== 'moto') };
  const same = simulate(noOne, [{ tipo: 'cambio_transporte', desde: 'moto', hacia: 'bicicleta', porcentaje: 50 }]);
  assert.equal(same.delta.total, 0);
});

test('Simulador: pasar el 100 % de los carros a bicicleta elimina su emisión de transporte', () => {
  const r = simulate(baseline, [{ tipo: 'cambio_transporte', desde: 'carro', hacia: 'bicicleta', porcentaje: 100 }]);
  const carros = baseline.people.filter((p) => p.mode === 'carro').reduce((s, p) => s + calculateTransportEmissions('carro', p.km, p.days), 0);
  near(r.delta.transporte, -carros);
  assert.equal(r.delta.energia, 0);
  assert.equal(r.delta.residuos, 0);
});

test('Simulador: más porcentaje nunca produce menos ahorro', () => {
  let previous = 0;
  for (const porcentaje of [10, 30, 60, 100]) {
    const r = simulate(baseline, [{ tipo: 'cambio_transporte', desde: 'carro', hacia: 'transporte_publico', porcentaje }]);
    assert.ok(-r.delta.total >= previous, `con ${porcentaje} % el ahorro bajó`);
    previous = -r.delta.total;
  }
});

test('Simulador: eficiencia energética en una zona ahorra exactamente ese porcentaje de esa zona', () => {
  const r = simulate(baseline, [{ tipo: 'eficiencia_energetica', porcentaje: 20, zona: 'laboratorios' }]);
  near(r.delta.energia, -(20000 * 0.2 * ELECTRICITY_KG_CO2E_PER_KWH));
  assert.equal(r.delta.transporte, 0);
});

test('Simulador: reducir residuos de un tipo solo cambia ese tipo', () => {
  const r = simulate(baseline, [{ tipo: 'reduccion_residuos', porcentaje: 50, tipoResiduo: 'plastico' }]);
  near(r.delta.residuos, -(140 * 0.5 * WASTE_KG_CO2E_PER_KG));
});

test('Simulador: menos días reduce el transporte y nunca baja de 1 día', () => {
  const r = simulate(baseline, [{ tipo: 'reduccion_dias', diasMenos: 3, porcentajePersonas: 100 }]);
  const esperado = baseline.people.reduce((s, p) => s + calculateTransportEmissions(p.mode, p.km, Math.max(1, p.days - 3)), 0);
  near(r.scenario.transporte, esperado);
});

test('Simulador: varias palancas se componen y una zona inexistente se rechaza', () => {
  const both = simulate(baseline, [
    { tipo: 'cambio_transporte', desde: 'carro', hacia: 'caminar', porcentaje: 100 },
    { tipo: 'eficiencia_energetica', porcentaje: 10 },
  ]);
  assert.ok(both.delta.transporte < 0 && both.delta.energia < 0);
  assert.equal(both.levers.length, 2);
  assert.throws(() => simulate(baseline, [{ tipo: 'eficiencia_energetica', porcentaje: 10, zona: 'Zona inexistente' }]), SimulationInputError);
});

// ---------- API ----------
async function createUser(label: string): Promise<string> {
  const email = `sim-${label}.${Date.now()}-${Math.random().toString(36).slice(2, 6)}@correo.tdea.edu.co`;
  createdEmails.push(email);
  const passwordHash = await bcrypt.hash('password123', 10);
  await pool.query(`INSERT INTO users (name, email, password_hash, role, email_verified) VALUES ('Persona Sim', $1, $2, 'estudiante', true)`, [email, passwordHash]);
  const res = await fetch(`${baseUrl}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'password123' }) });
  return (await res.json()).token;
}
const post = async (path: string, token: string | null, body: unknown) => {
  const res = await fetch(`${baseUrl}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
  return { status: res.status, data: await res.json() };
};

test('Simulador API: exige sesión y rechaza escenarios inválidos', async () => {
  assert.equal((await post('/api/simulations/run', null, { levers: [] })).status, 401);
  const token = await createUser('invalido');
  assert.equal((await post('/api/simulations/run', token, { levers: [] })).status, 400);
  assert.equal((await post('/api/simulations/run', token, { levers: [{ tipo: 'eficiencia_energetica', porcentaje: 95 }] })).status, 400);
  assert.equal((await post('/api/simulations/run', token, { levers: [{ tipo: 'inventada' }] })).status, 400);
});

test('Simulador API: un escenario válido devuelve base, escenario y resumen', async () => {
  const token = await createUser('valido');
  const { status, data } = await post('/api/simulations/run', token, { levers: [{ tipo: 'eficiencia_energetica', porcentaje: 10 }] });
  assert.equal(status, 200);
  assert.ok(data.result.scenario.energia <= data.result.base.energia);
  assert.equal(typeof data.summary, 'string');
});

test('Simulador API: sin clave de IA responde 503 en la pregunta libre', async () => {
  const previousKey = env.ai.apiKey;
  env.ai.apiKey = '';
  try {
    const token = await createUser('sin-ia');
    assert.equal((await post('/api/simulations/ask', token, { question: '¿Qué pasa si bajamos la energía un 10%?' })).status, 503);
  } finally {
    env.ai.apiKey = previousKey;
  }
});

function mockModel(content: unknown) {
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    if (String(input).includes('/chat/completions')) {
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) } }] }), { status: 200 });
    }
    return realFetch(input, init);
  }) as typeof fetch;
  return () => {
    globalThis.fetch = realFetch;
  };
}

test('Simulador API: la IA traduce la pregunta a palancas y el motor calcula', async () => {
  const previousKey = env.ai.apiKey;
  env.ai.apiKey = 'clave-de-prueba';
  const restore = mockModel({ entendido: true, palancas: [{ tipo: 'eficiencia_energetica', porcentaje: 10, zona: null }], interpretacion: 'Reducir 10 % el consumo eléctrico de todo el campus' });
  try {
    const token = await createUser('ia-ok');
    const { status, data } = await post('/api/simulations/ask', token, { question: '¿Qué pasa si bajamos la energía un 10%?' });
    assert.equal(status, 200);
    assert.equal(data.understood, true);
    assert.match(data.interpretation, /10 %/);
    assert.ok(data.result.delta.energia <= 0);
  } finally {
    restore();
    env.ai.apiKey = previousKey;
  }
});

test('Simulador API: si la IA devuelve palancas fuera de rango o una zona falsa no se calcula', async () => {
  const previousKey = env.ai.apiKey;
  env.ai.apiKey = 'clave-de-prueba';
  try {
    const token = await createUser('ia-mala');
    let restore = mockModel({ entendido: true, palancas: [{ tipo: 'eficiencia_energetica', porcentaje: 500 }], interpretacion: 'Reducir 500 %' });
    let r = await post('/api/simulations/ask', token, { question: 'Reducir la energía un quinientos por ciento' });
    restore();
    assert.equal(r.data.understood, false);

    restore = mockModel({ entendido: true, palancas: [{ tipo: 'eficiencia_energetica', porcentaje: 10, zona: 'Planeta Marte' }], interpretacion: 'Reducir en Marte' });
    r = await post('/api/simulations/ask', token, { question: 'Reducir la energía en la zona Planeta Marte' });
    restore();
    assert.equal(r.data.understood, false);
    assert.match(r.data.reason, /Zonas disponibles|No encontré/);

    restore = mockModel({ entendido: false, motivo: 'No se puede simular el clima' });
    r = await post('/api/simulations/ask', token, { question: '¿Qué pasa si llueve todos los días del año?' });
    restore();
    assert.equal(r.data.understood, false);
  } finally {
    env.ai.apiKey = previousKey;
  }
});

after(async () => {
  await pool.query('DELETE FROM users WHERE email = ANY($1)', [createdEmails]);
  await pool.end();
  server.close();
});
