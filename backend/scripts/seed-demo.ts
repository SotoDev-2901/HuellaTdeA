/**
 * Siembra datos de demostración realistas: zonas, estudiantes/docentes, respuestas del
 * cuestionario individual (varios meses, usando el motor de cálculo real) y registros
 * institucionales de consumo eléctrico y residuos por zona.
 *
 * Borra primero todo lo sembrable (zonas, usuarios no-admin, y sus registros asociados) para
 * partir de un estado limpio y reproducible. El admin (seed-admin.ts) no se toca.
 */
import bcrypt from 'bcrypt';
import { pool } from '../src/config/db.js';
import { calculateFootprint, type FootprintInput } from '../src/modules/footprint/footprint.service.js';
import * as questionnaireRepository from '../src/modules/questionnaire/questionnaire.repository.js';
import type { CampusSpace, DietType, EatingFrequency, TransportMode, WasteFrequency } from '../src/modules/footprint/emissionFactors.js';

const DEMO_PASSWORD = 'Demo12345';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.');
}

function randomBetween(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

const ESTUDIANTES = [
  'María Fernanda Restrepo',
  'Juan Pablo Gómez',
  'Laura Sofía Vélez',
  'Andrés Felipe Zapata',
  'Camila Andrea Ríos',
  'Santiago Muñoz',
  'Valentina Ortiz',
  'Sebastián Cardona',
  'Isabella Molina',
  'Nicolás Arango',
];

const DOCENTES = ['Carlos Alberto Herrera', 'Diana Patricia Londoño', 'Jorge Iván Vélez', 'Adriana Marcela Toro'];

const ZONES: { name: string; type: 'academica' | 'administrativa'; kwhRange: [number, number] }[] = [
  { name: 'Biblioteca Central', type: 'academica', kwhRange: [600, 900] },
  { name: 'Bloque de Aulas A', type: 'academica', kwhRange: [800, 1200] },
  { name: 'Bloque de Aulas B', type: 'academica', kwhRange: [800, 1200] },
  { name: 'Laboratorios de Ingeniería', type: 'academica', kwhRange: [1500, 2500] },
  { name: 'Auditorio Mayor', type: 'academica', kwhRange: [300, 500] },
  { name: 'Bloque Administrativo', type: 'administrativa', kwhRange: [700, 1000] },
  { name: 'Cafetería Central', type: 'administrativa', kwhRange: [900, 1300] },
];

const TRANSPORT_MODES: TransportMode[] = ['caminar', 'bicicleta', 'moto', 'carro', 'transporte_publico'];
const CAMPUS_SPACE_SETS: CampusSpace[][] = [
  ['aulas'],
  ['laboratorios'],
  ['biblioteca'],
  ['aulas', 'laboratorios'],
  ['cafeteria'],
  ['auditorio'],
];
const WASTE_FREQUENCIES: WasteFrequency[] = ['baja', 'media', 'alta'];
const EATING_FREQUENCIES: EatingFrequency[] = ['nunca', 'ocasional', 'mayoria', 'siempre'];
const DIET_TYPES: DietType[] = ['vegano', 'vegetariano', 'mixto_moderado', 'carne_frecuente'];
const WASTE_TYPES = ['plastico', 'papel', 'organico'] as const;

function isoDateMonthsAgo(months: number, day = 5): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - months, day)).toISOString().slice(0, 10);
}

async function resetData(): Promise<void> {
  await pool.query('DELETE FROM questionnaire_responses');
  await pool.query('DELETE FROM consumption_records');
  await pool.query('DELETE FROM waste_records');
  await pool.query('DELETE FROM zones');
  await pool.query("DELETE FROM users WHERE role != 'administrador'");
  console.log('Datos anteriores eliminados (zonas, usuarios no-admin, registros asociados).');
}

async function seedUsers(): Promise<{ id: string; role: 'estudiante' | 'docente' }[]> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const users: { id: string; role: 'estudiante' | 'docente' }[] = [];

  for (const name of ESTUDIANTES) {
    const email = `${slugify(name)}@correo.tdea.edu.co`;
    const { rows } = await pool.query<{ id: string }>(
      `INSERT INTO users (name, email, password_hash, role, email_verified)
       VALUES ($1, $2, $3, 'estudiante', true) RETURNING id`,
      [name, email, passwordHash],
    );
    users.push({ id: rows[0].id, role: 'estudiante' });
  }

  for (const name of DOCENTES) {
    const email = `${slugify(name)}@correo.tdea.edu.co`;
    const { rows } = await pool.query<{ id: string }>(
      `INSERT INTO users (name, email, password_hash, role, email_verified)
       VALUES ($1, $2, $3, 'docente', true) RETURNING id`,
      [name, email, passwordHash],
    );
    users.push({ id: rows[0].id, role: 'docente' });
  }

  console.log(`Creados ${ESTUDIANTES.length} estudiantes y ${DOCENTES.length} docentes (contraseña: ${DEMO_PASSWORD}).`);
  return users;
}

async function seedZones(): Promise<{ id: string; kwhRange: [number, number] }[]> {
  const zones: { id: string; kwhRange: [number, number] }[] = [];
  for (const zone of ZONES) {
    const { rows } = await pool.query<{ id: string }>(
      `INSERT INTO zones (name, type) VALUES ($1, $2) RETURNING id`,
      [zone.name, zone.type],
    );
    zones.push({ id: rows[0].id, kwhRange: zone.kwhRange });
  }
  console.log(`Creadas ${ZONES.length} zonas.`);
  return zones;
}

async function seedQuestionnaireResponses(users: { id: string; role: string }[]): Promise<void> {
  let count = 0;
  for (let u = 0; u < users.length; u++) {
    const user = users[u];
    // Cada usuario responde entre 1 y 4 meses distintos (más reciente primero), para que
    // algunos tengan tendencia mensual completa y otros apenas un punto — ambos estados reales.
    const monthsToFill = 1 + (u % 4);

    for (let m = monthsToFill - 1; m >= 0; m--) {
      const input: FootprintInput = {
        transportMode: pick(TRANSPORT_MODES, u + m),
        transportKmPerTrip: randomBetween(1, 25),
        transportDaysPerWeek: 2 + ((u + m) % 6),
        campusHoursPerDay: randomBetween(2, 8),
        campusSpaces: pick(CAMPUS_SPACE_SETS, u + m),
        usesLaptop: (u + m) % 2 === 0,
        chargesDevices: (u + m) % 3 !== 0,
        wasteFrequency: pick(WASTE_FREQUENCIES, u + m),
        eatingFrequency: pick(EATING_FREQUENCIES, u + m + 1),
        dietType: pick(DIET_TYPES, u + m + 2),
      };

      const result = calculateFootprint({ ...input, campusSpaces: input.campusSpaces ?? [] });
      const response = await questionnaireRepository.createResponse(
        user.id,
        input,
        { campusSpaces: input.campusSpaces },
        result,
      );

      await pool.query(`UPDATE questionnaire_responses SET created_at = $1::date WHERE id = $2`, [
        isoDateMonthsAgo(m),
        response.id,
      ]);
      count++;
    }
  }
  console.log(`Creadas ${count} respuestas de cuestionario repartidas en varios meses.`);
}

async function seedInstitutionalRecords(zones: { id: string; kwhRange: [number, number] }[]): Promise<void> {
  let consumptionCount = 0;
  let wasteCount = 0;

  for (const zone of zones) {
    for (let m = 0; m < 5; m++) {
      const recordedAt = isoDateMonthsAgo(m, 1);
      const [min, max] = zone.kwhRange;
      await pool.query(
        `INSERT INTO consumption_records (zone_id, kwh, recorded_at) VALUES ($1, $2, $3)`,
        [zone.id, randomBetween(min, max), recordedAt],
      );
      consumptionCount++;

      for (const wasteType of WASTE_TYPES) {
        if (Math.random() < 0.15) continue; // no todas las zonas generan los 3 tipos cada mes
        await pool.query(
          `INSERT INTO waste_records (zone_id, waste_type, kg, recorded_at) VALUES ($1, $2, $3, $4)`,
          [zone.id, wasteType, randomBetween(10, 120), recordedAt],
        );
        wasteCount++;
      }
    }
  }
  console.log(`Creados ${consumptionCount} registros de consumo eléctrico y ${wasteCount} de residuos.`);
}

async function main() {
  await resetData();
  const zones = await seedZones();
  const users = await seedUsers();
  await seedQuestionnaireResponses(users);
  await seedInstitutionalRecords(zones);
  console.log('\nListo. Usuarios demo con contraseña:', DEMO_PASSWORD);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
