/**
 * Siembra datos de demostración realistas para poder comparar de verdad:
 *  - 120 estudiantes y 25 docentes con perfiles de hábitos distintos (transporte, alimentación,
 *    dispositivos, residuos) que responden el cuestionario mes a mes (hasta 12 meses),
 *    usando el motor de cálculo real (nada de totales inventados).
 *  - 10 zonas del campus con consumo eléctrico y residuos de los últimos 24 meses, con
 *    estacionalidad (menos consumo en vacaciones) y una leve tendencia a la baja, de modo que
 *    la variación interanual del dashboard institucional tenga datos.
 *
 * Borra primero todo lo sembrable (zonas, usuarios no-admin y sus registros). El admin
 * (seed-admin.ts) no se toca. La generación usa un PRNG con semilla fija: cada ejecución
 * produce exactamente los mismos datos, útil para demos y pruebas reproducibles.
 */
import bcrypt from 'bcrypt';
import { pool } from '../src/config/db.js';
import { calculateFootprint, type FootprintInput } from '../src/modules/footprint/footprint.service.js';
import * as questionnaireRepository from '../src/modules/questionnaire/questionnaire.repository.js';
import type {
  CampusSpace,
  DietType,
  EatingFrequency,
  TransportMode,
  WasteFrequency,
} from '../src/modules/footprint/emissionFactors.js';

const DEMO_PASSWORD = 'Demo12345';
const STUDENT_COUNT = 120;
const TEACHER_COUNT = 25;
const MONTHS_OF_QUESTIONNAIRES = 12;
const MONTHS_OF_INSTITUTIONAL = 24;

// ---------- PRNG determinista (mulberry32) ----------
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260915);
const between = (min: number, max: number) => min + rand() * (max - min);
const round2 = (n: number) => Math.round(n * 100) / 100;
const int = (min: number, max: number) => Math.floor(between(min, max + 1));
function weighted<T>(options: readonly (readonly [T, number])[]): T {
  const total = options.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [value, weight] of options) {
    r -= weight;
    if (r <= 0) return value;
  }
  return options[options.length - 1][0];
}

// ---------- Nombres ----------
const FIRST_NAMES = [
  'María', 'Juan', 'Laura', 'Andrés', 'Camila', 'Santiago', 'Valentina', 'Sebastián', 'Isabella', 'Nicolás',
  'Daniela', 'Mateo', 'Sofía', 'Samuel', 'Mariana', 'David', 'Paula', 'Felipe', 'Natalia', 'Alejandro',
  'Carolina', 'Julián', 'Manuela', 'Esteban', 'Juliana', 'Cristian', 'Luisa', 'Daniel', 'Susana', 'Tomás',
  'Verónica', 'Brayan', 'Karen', 'Johan', 'Melissa', 'Kevin', 'Estefanía', 'Óscar', 'Gabriela', 'Ricardo',
];
const LAST_NAMES = [
  'Restrepo', 'Gómez', 'Vélez', 'Zapata', 'Ríos', 'Muñoz', 'Ortiz', 'Cardona', 'Molina', 'Arango',
  'Londoño', 'Herrera', 'Toro', 'Giraldo', 'Mejía', 'Osorio', 'Builes', 'Cano', 'Álvarez', 'Henao',
  'Jaramillo', 'Escobar', 'Castaño', 'Pérez', 'Duque', 'Agudelo', 'Salazar', 'Ospina', 'Montoya', 'Ramírez',
];

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '.');
}

function buildNames(count: number, used: Set<string>): string[] {
  const names: string[] = [];
  while (names.length < count) {
    const name = `${FIRST_NAMES[int(0, FIRST_NAMES.length - 1)]} ${LAST_NAMES[int(0, LAST_NAMES.length - 1)]} ${LAST_NAMES[int(0, LAST_NAMES.length - 1)]}`;
    const key = slugify(name);
    if (used.has(key)) continue;
    used.add(key);
    names.push(name);
  }
  return names;
}

// ---------- Perfiles de hábitos ----------
interface Profile {
  transportMode: TransportMode;
  transportKmPerTrip: number;
  transportDaysPerWeek: number;
  campusHoursPerDay: number;
  campusSpaces: CampusSpace[];
  usesLaptop: boolean;
  chargesDevices: boolean;
  wasteFrequency: WasteFrequency;
  eatingFrequency: EatingFrequency;
  dietType: DietType;
}

const SPACE_SETS: CampusSpace[][] = [
  ['aulas'],
  ['aulas', 'biblioteca'],
  ['laboratorios'],
  ['aulas', 'laboratorios'],
  ['aulas', 'cafeteria'],
  ['biblioteca'],
  ['aulas', 'zonas_verdes'],
  ['auditorio', 'aulas'],
];

function buildProfile(role: 'estudiante' | 'docente'): Profile {
  const student = role === 'estudiante';
  const transportMode = weighted<TransportMode>(
    student
      ? [['transporte_publico', 42], ['caminar', 14], ['moto', 17], ['carro', 11], ['bicicleta', 8]]
      : [['carro', 46], ['moto', 18], ['transporte_publico', 24], ['bicicleta', 7], ['caminar', 5]],
  );
  const km =
    transportMode === 'caminar' ? between(0.4, 2) :
    transportMode === 'bicicleta' ? between(2, 9) :
    transportMode === 'carro' ? between(6, 28) :
    between(4, 24);
  return {
    transportMode,
    transportKmPerTrip: round2(km),
    transportDaysPerWeek: student ? weighted([[2, 8], [3, 17], [4, 25], [5, 40], [6, 10]]) : weighted([[2, 10], [3, 25], [4, 35], [5, 30]]),
    campusHoursPerDay: round2(student ? between(3, 9) : between(4, 10)),
    campusSpaces: SPACE_SETS[int(0, SPACE_SETS.length - 1)],
    usesLaptop: rand() < (student ? 0.85 : 0.8),
    chargesDevices: rand() < 0.65,
    wasteFrequency: weighted<WasteFrequency>([['baja', 32], ['media', 48], ['alta', 20]]),
    eatingFrequency: weighted<EatingFrequency>(
      student ? [['nunca', 12], ['ocasional', 33], ['mayoria', 35], ['siempre', 20]] : [['nunca', 18], ['ocasional', 37], ['mayoria', 30], ['siempre', 15]],
    ),
    dietType: weighted<DietType>([['vegano', 5], ['vegetariano', 16], ['mixto_moderado', 53], ['carne_frecuente', 26]]),
  };
}

/** Pequeña variación mensual sobre un perfil estable (la gente cambia poco de hábitos). */
function monthlyVariant(base: Profile): Profile {
  const variant = { ...base };
  variant.transportKmPerTrip = round2(Math.max(0.3, base.transportKmPerTrip * between(0.9, 1.12)));
  variant.campusHoursPerDay = round2(Math.min(12, Math.max(1, base.campusHoursPerDay + between(-0.8, 0.8))));
  if (rand() < 0.2) variant.transportDaysPerWeek = Math.min(7, Math.max(1, base.transportDaysPerWeek + (rand() < 0.5 ? -1 : 1)));
  if (rand() < 0.12) variant.wasteFrequency = weighted<WasteFrequency>([['baja', 35], ['media', 45], ['alta', 20]]);
  if (rand() < 0.1) variant.chargesDevices = !base.chargesDevices;
  return variant;
}

// ---------- Zonas ----------
const ZONES: { name: string; type: 'academica' | 'administrativa'; kwh: number; waste: number }[] = [
  { name: 'Biblioteca Central', type: 'academica', kwh: 7200, waste: 55 },
  { name: 'Bloque de Aulas A', type: 'academica', kwh: 9800, waste: 90 },
  { name: 'Bloque de Aulas B', type: 'academica', kwh: 9400, waste: 85 },
  { name: 'Bloque de Aulas C', type: 'academica', kwh: 8300, waste: 70 },
  { name: 'Laboratorios de Ingeniería', type: 'academica', kwh: 16800, waste: 60 },
  { name: 'Laboratorios de Ciencias', type: 'academica', kwh: 12400, waste: 50 },
  { name: 'Auditorio Mayor', type: 'academica', kwh: 3600, waste: 25 },
  { name: 'Bloque Administrativo', type: 'administrativa', kwh: 6900, waste: 70 },
  { name: 'Cafetería Central', type: 'administrativa', kwh: 9100, waste: 210 },
  { name: 'Bienestar Universitario', type: 'administrativa', kwh: 4300, waste: 40 },
];

/** 1.0 = mes normal; menos actividad en vacaciones de mitad y fin de año. */
const SEASONALITY: Record<number, number> = { 0: 0.72, 1: 1.0, 2: 1.05, 3: 1.05, 4: 1.08, 5: 0.82, 6: 0.7, 7: 1.0, 8: 1.07, 9: 1.08, 10: 1.0, 11: 0.66 };

function monthStart(monthsAgo: number, day = 1): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, day));
}
const isoDate = (d: Date) => d.toISOString().slice(0, 10);

// ---------- Escritura ----------
async function resetData(): Promise<void> {
  await pool.query('DELETE FROM questionnaire_responses');
  await pool.query('DELETE FROM consumption_records');
  await pool.query('DELETE FROM waste_records');
  await pool.query('DELETE FROM zones');
  await pool.query("DELETE FROM users WHERE role != 'administrador'");
  console.log('Datos anteriores eliminados (zonas, usuarios no-admin y registros asociados). El administrador se conserva.');
}

async function seedUsers(): Promise<{ id: string; role: 'estudiante' | 'docente' }[]> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const used = new Set<string>();
  const users: { id: string; role: 'estudiante' | 'docente' }[] = [];

  const groups: ['estudiante' | 'docente', string[]][] = [
    ['estudiante', buildNames(STUDENT_COUNT, used)],
    ['docente', buildNames(TEACHER_COUNT, used)],
  ];
  for (const [role, names] of groups) {
    for (const name of names) {
      const email = `${slugify(name)}@correo.tdea.edu.co`;
      const { rows } = await pool.query<{ id: string }>(
        `INSERT INTO users (name, email, password_hash, role, email_verified)
         VALUES ($1, $2, $3, $4, true) RETURNING id`,
        [name, email, passwordHash, role],
      );
      users.push({ id: rows[0].id, role });
    }
  }
  console.log(`Creados ${STUDENT_COUNT} estudiantes y ${TEACHER_COUNT} docentes (contraseña: ${DEMO_PASSWORD}).`);
  return users;
}

async function seedQuestionnaireResponses(users: { id: string; role: 'estudiante' | 'docente' }[]): Promise<void> {
  let count = 0;
  for (const user of users) {
    const base = buildProfile(user.role);
    // Antigüedad en el sistema: desde quien acaba de empezar hasta quien lleva el año completo.
    const activeMonths = weighted<number>([[1, 14], [2, 10], [3, 14], [4, 10], [6, 16], [9, 12], [12, 24]]);
    const reliability = between(0.7, 1); // probabilidad de responder en cada mes activo

    for (let m = Math.min(activeMonths, MONTHS_OF_QUESTIONNAIRES) - 1; m >= 0; m--) {
      if (m !== 0 && rand() > reliability) continue; // se salta algún mes, pero el último siempre responde
      const input: FootprintInput = monthlyVariant(base);
      const result = calculateFootprint(input);
      const response = await questionnaireRepository.createResponse(
        user.id,
        input,
        { campusSpaces: input.campusSpaces },
        result,
      );
      // Un envío por mes calendario, en un día laborable aleatorio de ese mes (nunca en el futuro).
      const day = m === 0 ? Math.min(int(1, 25), new Date().getUTCDate()) : int(2, 26);
      await pool.query(`UPDATE questionnaire_responses SET created_at = $1::date + time '10:00' WHERE id = $2`, [
        isoDate(monthStart(m, day)),
        response.id,
      ]);
      count++;
    }
  }
  console.log(`Creadas ${count} respuestas de cuestionario (hasta ${MONTHS_OF_QUESTIONNAIRES} meses de historial).`);
}

async function seedInstitutionalRecords(): Promise<void> {
  let consumptionCount = 0;
  let wasteCount = 0;

  for (const zone of ZONES) {
    const { rows } = await pool.query<{ id: string }>(`INSERT INTO zones (name, type) VALUES ($1, $2) RETURNING id`, [zone.name, zone.type]);
    const zoneId = rows[0].id;

    for (let m = MONTHS_OF_INSTITUTIONAL - 1; m >= 0; m--) {
      const date = monthStart(m, 1);
      const season = SEASONALITY[date.getUTCMonth()];
      // Mejora gradual de ~7 % anual (eficiencia energética) para que la variación interanual sea visible.
      const trend = 1 - 0.07 * ((MONTHS_OF_INSTITUTIONAL - 1 - m) / 12);
      const kwh = zone.kwh * season * trend * between(0.93, 1.07);
      await pool.query(`INSERT INTO consumption_records (zone_id, kwh, recorded_at) VALUES ($1, $2, $3)`, [zoneId, round2(kwh), isoDate(date)]);
      consumptionCount++;

      const wasteMix: [string, number][] = [['plastico', 0.34], ['papel', 0.26], ['organico', 0.4]];
      for (const [type, share] of wasteMix) {
        if (rand() < 0.08) continue; // algún mes sin registro de un tipo
        const kg = zone.waste * season * share * between(0.8, 1.2);
        await pool.query(`INSERT INTO waste_records (zone_id, waste_type, kg, recorded_at) VALUES ($1, $2, $3, $4)`, [zoneId, type, round2(kg), isoDate(date)]);
        wasteCount++;
      }
    }
  }
  console.log(`Creadas ${ZONES.length} zonas con ${consumptionCount} registros de consumo y ${wasteCount} de residuos (${MONTHS_OF_INSTITUTIONAL} meses).`);
}

async function main() {
  await resetData();
  const users = await seedUsers();
  await seedQuestionnaireResponses(users);
  await seedInstitutionalRecords();
  console.log('\nListo. Usuarios demo con contraseña:', DEMO_PASSWORD);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
