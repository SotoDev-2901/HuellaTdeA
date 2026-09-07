/**
 * Factores de emisión usados para el cálculo de huella de carbono individual (HU-08).
 * Cada valor cita su fuente para que sea verificable en el informe técnico.
 */

export type TransportMode = 'caminar' | 'bicicleta' | 'moto' | 'carro' | 'transporte_publico';
export type DietType = 'vegano' | 'vegetariano' | 'mixto_moderado' | 'carne_frecuente';

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

/** Potencia promedio asumida de un laptop en uso activo. Supuesto declarado. */
const LAPTOP_POWER_KW = 0.065;

/**
 * Fuente: Directrices del IPCC 2006 para Inventarios Nacionales de GEI, Volumen 5 (Desechos),
 * vía MVC Colombia (2016) Tabla 11: relleno sanitario gestionado anaeróbico,
 * 0.055 kgCH4/kg de residuo × PCG del metano (28, IPCC AR5) = 1.54 kgCO2e/kg.
 */
const WASTE_KG_CO2E_PER_KG = 1.54;

/**
 * Fuente: Poore & Nemecek (2018), "Reducing food's environmental impacts through producers and
 * consumers", Science 360(6392). Valores anuales aproximados por banda de dieta, derivados de las
 * medianas de huella por tipo de dieta reportadas en el estudio.
 */
const DIET_KG_CO2E_PER_YEAR: Record<DietType, number> = {
  vegano: 500,
  vegetariano: 700,
  mixto_moderado: 1200,
  carne_frecuente: 2000,
};

const WEEKS_PER_YEAR = 52;

export function calculateTransportEmissions(
  mode: TransportMode,
  kmPerTrip: number,
  tripsPerWeek: number,
): number {
  if (mode === 'caminar' || mode === 'bicicleta') return 0;

  const kmPerYear = kmPerTrip * tripsPerWeek * WEEKS_PER_YEAR;

  if (mode === 'transporte_publico') {
    return kmPerYear * BUS_KG_CO2E_PER_PASSENGER_KM;
  }

  const galPerYear = kmPerYear / FUEL_EFFICIENCY_KM_PER_GAL[mode];
  return galPerYear * GASOLINE_KG_CO2_PER_GAL;
}

export function calculateDeviceEmissions(hoursPerDay: number, daysPerWeek: number): number {
  const hoursPerYear = hoursPerDay * daysPerWeek * WEEKS_PER_YEAR;
  const kwhPerYear = hoursPerYear * LAPTOP_POWER_KW;
  return kwhPerYear * ELECTRICITY_KG_CO2E_PER_KWH;
}

export function calculateWasteEmissions(kgPerWeek: number): number {
  return kgPerWeek * WEEKS_PER_YEAR * WASTE_KG_CO2E_PER_KG;
}

export function calculateDietEmissions(dietType: DietType): number {
  return DIET_KG_CO2E_PER_YEAR[dietType];
}
