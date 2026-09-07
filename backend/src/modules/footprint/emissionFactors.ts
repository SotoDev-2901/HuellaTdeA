/**
 * Factores de emisión usados para el cálculo de huella de carbono individual (HU-08).
 * Cada valor cita su fuente para que sea verificable en el informe técnico.
 *
 * Regla general: todo lo que se pregunta es sobre hábitos DENTRO del campus, así que toda
 * categoría (transporte, dispositivos, residuos, alimentación) se escala por
 * `transportDaysPerWeek` — los días que la persona realmente asiste. Si alguien va 1 día a la
 * semana, su huella atribuible a la universidad en cada categoría debe ser proporcionalmente
 * menor que la de alguien que va 5 días, sin excepciones.
 */

export type TransportMode = 'caminar' | 'bicicleta' | 'moto' | 'carro' | 'transporte_publico';
export type DietType = 'vegano' | 'vegetariano' | 'mixto_moderado' | 'carne_frecuente';
export type EatingFrequency = 'nunca' | 'ocasional' | 'mayoria' | 'siempre';
export type WasteFrequency = 'baja' | 'media' | 'alta';
export type CampusSpace = 'aulas' | 'biblioteca' | 'laboratorios' | 'cafeteria' | 'auditorio' | 'zonas_verdes';

/**
 * Fuente: FECOC 2016 (Factores de Emisión de los Combustibles Colombianos), UPME / MVC Colombia.
 * "Gasolina Motor (sin mezcla bioetanol)": 8.8085 kgCO2/gal.
 */
const GASOLINE_KG_CO2_PER_GAL = 8.8085;

/**
 * Rendimiento promedio asumido por modo de transporte (km recorridos por galón de combustible).
 * Son supuestos declarados, no un dato medido — deben ajustarse si se consigue una cifra oficial
 * (ej. RUNT o ANDI) antes de la entrega final.
 */
const FUEL_EFFICIENCY_KM_PER_GAL: Record<'carro' | 'moto', number> = {
  carro: 35,
  moto: 70,
};

/**
 * Transporte público (bus): no existe un factor colombiano público por pasajero-km, se usa una
 * referencia internacional ampliamente citada (bus urbano, ocupación promedio) mientras se consigue
 * una fuente local. Declarar esto explícitamente en el informe.
 */
const BUS_KG_CO2E_PER_PASSENGER_KM = 0.089;

/**
 * Fuente: UPME, factor de emisión del Sistema Interconectado Nacional (FECOC 2016 / MVC Colombia,
 * Tabla 6, valor 2015): 0.199 kgCO2e/kWh.
 */
const ELECTRICITY_KG_CO2E_PER_KWH = 0.199;

/** Potencia promedio asumida de un laptop personal en uso activo. Supuesto declarado. */
const LAPTOP_POWER_KW = 0.065;

/** Energía asumida de una carga completa de celular (batería típica ~15 Wh). Supuesto declarado. */
const PHONE_CHARGE_KWH = 0.015;

/**
 * "Instalaciones" es distinto de "Dispositivos": representa la electricidad del EDIFICIO
 * (iluminación, aire acondicionado/ventilación, equipos compartidos como computadores de sala o
 * proyectores) que se consume por la sola presencia de la persona en el campus, exista o no un
 * dispositivo personal de por medio. Son estimaciones de ingeniería tipo ASHRAE (carga eléctrica
 * típica por ocupante en edificios académicos), no un factor oficial citado — declarado aquí para
 * poder ajustarse si se consigue una medición real del campus. Aulas se estimó más alto que
 * biblioteca porque suelen tener computadores de sala y/o proyectores de uso compartido.
 */
const FACILITY_KW_PER_PERSON_BY_SPACE: Record<CampusSpace, number> = {
  aulas: 0.18,
  laboratorios: 0.35,
  auditorio: 0.15,
  cafeteria: 0.12,
  biblioteca: 0.1,
  zonas_verdes: 0.02,
};
const DEFAULT_FACILITY_KW_PER_PERSON = 0.12;

/**
 * Fuente: Directrices del IPCC 2006 para Inventarios Nacionales de GEI, Volumen 5 (Desechos),
 * vía MVC Colombia (2016) Tabla 11: relleno sanitario gestionado anaeróbico,
 * 0.055 kgCH4/kg de residuo × PCG del metano (28, IPCC AR5) = 1.54 kgCO2e/kg.
 */
const WASTE_KG_CO2E_PER_KG = 1.54;

/**
 * Los residuos se reportan por frecuencia percibida (baja/media/alta), no en kg exactos, porque
 * nadie sabe de memoria cuántos kg genera. Se asume un kg POR DÍA que la persona asiste al campus
 * (no por semana fija), para que alguien que va 1 día no cargue con la misma huella que alguien
 * que va 5 días con la misma frecuencia percibida.
 */
const WASTE_FREQUENCY_KG_PER_DAY: Record<WasteFrequency, number> = {
  baja: 0.15,
  media: 0.4,
  alta: 0.8,
};

/**
 * Fuente: Poore & Nemecek (2018), "Reducing food's environmental impacts through producers and
 * consumers", Science 360(6392). Estos valores representan la huella ANUAL de dieta completa según
 * banda (vegano/vegetariano/mixto/carne frecuente). Como el cuestionario solo pregunta por hábitos
 * dentro del campus, se dividen entre 365 para obtener un valor diario, y luego se escalan por los
 * días reales que la persona asiste — igual que las demás categorías — en vez de aplicar la huella
 * anual completa sin importar cuánto tiempo pasa en la universidad.
 */
const DIET_KG_CO2E_PER_YEAR: Record<DietType, number> = {
  vegano: 500,
  vegetariano: 700,
  mixto_moderado: 1200,
  carne_frecuente: 2000,
};
const DAYS_PER_YEAR = 365;

/**
 * Fracción de los días asistidos en que la persona realmente come en la universidad.
 * Supuesto declarado (no hay fuente oficial para "cuánto es ocasional/la mayoría") — se pidió como
 * frecuencia percibida en vez de un conteo exacto de días porque nadie lleva la cuenta exacta,
 * igual que WASTE_FREQUENCY_KG_PER_DAY.
 */
const EATING_FREQUENCY_RATIO: Record<EatingFrequency, number> = {
  nunca: 0,
  ocasional: 0.25,
  mayoria: 0.75,
  siempre: 1,
};

const WEEKS_PER_YEAR = 52;

export function calculateTransportEmissions(
  mode: TransportMode,
  kmPerTrip: number,
  daysPerWeek: number,
): number {
  if (mode === 'caminar' || mode === 'bicicleta') return 0;

  const kmPerYear = kmPerTrip * daysPerWeek * WEEKS_PER_YEAR;

  if (mode === 'transporte_publico') {
    return kmPerYear * BUS_KG_CO2E_PER_PASSENGER_KM;
  }

  const galPerYear = kmPerYear / FUEL_EFFICIENCY_KM_PER_GAL[mode];
  return galPerYear * GASOLINE_KG_CO2_PER_GAL;
}

export function calculateDeviceEmissions(
  usesLaptop: boolean,
  chargesDevices: boolean,
  campusHoursPerDay: number,
  daysPerWeek: number,
): number {
  let kwhPerYear = 0;

  if (usesLaptop) {
    kwhPerYear += campusHoursPerDay * daysPerWeek * WEEKS_PER_YEAR * LAPTOP_POWER_KW;
  }
  if (chargesDevices) {
    kwhPerYear += daysPerWeek * WEEKS_PER_YEAR * PHONE_CHARGE_KWH;
  }

  return kwhPerYear * ELECTRICITY_KG_CO2E_PER_KWH;
}

export function calculateFacilitiesEmissions(
  campusSpaces: CampusSpace[],
  campusHoursPerDay: number,
  daysPerWeek: number,
): number {
  const kwPerPerson =
    campusSpaces.length > 0
      ? campusSpaces.reduce((sum, space) => sum + FACILITY_KW_PER_PERSON_BY_SPACE[space], 0) /
        campusSpaces.length
      : DEFAULT_FACILITY_KW_PER_PERSON;

  const kwhPerYear = campusHoursPerDay * daysPerWeek * WEEKS_PER_YEAR * kwPerPerson;
  return kwhPerYear * ELECTRICITY_KG_CO2E_PER_KWH;
}

export function wasteFrequencyToKgPerWeek(frequency: WasteFrequency, daysPerWeek: number): number {
  return WASTE_FREQUENCY_KG_PER_DAY[frequency] * daysPerWeek;
}

export function calculateWasteEmissions(kgPerWeek: number): number {
  return kgPerWeek * WEEKS_PER_YEAR * WASTE_KG_CO2E_PER_KG;
}

export function calculateDietEmissions(
  dietType: DietType,
  daysPerWeek: number,
  eatingFrequency: EatingFrequency,
): number {
  const dailyFootprint = DIET_KG_CO2E_PER_YEAR[dietType] / DAYS_PER_YEAR;
  return dailyFootprint * daysPerWeek * EATING_FREQUENCY_RATIO[eatingFrequency] * WEEKS_PER_YEAR;
}
