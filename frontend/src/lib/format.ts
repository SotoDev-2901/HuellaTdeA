export type EmissionUnit = 'kg' | 't';

/**
 * Elige la unidad según la magnitud para que los valores pequeños no se vean como "0.0".
 * Menos de una tonelada se muestra en kg; desde 1 000 kg, en toneladas.
 */
export function pickEmissionUnit(...kgValues: number[]): EmissionUnit {
  return Math.max(0, ...kgValues.map((v) => Math.abs(v))) >= 1000 ? 't' : 'kg';
}

export function formatEmissionNumber(kg: number, unit: EmissionUnit): string {
  const value = unit === 't' ? kg / 1000 : kg;
  const abs = Math.abs(value);
  const digits = abs === 0 ? 0 : abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  return value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: digits });
}

export function emissionUnitLabel(unit: EmissionUnit): string {
  return unit === 't' ? 'tCO2e' : 'kgCO2e';
}

/** "52 kgCO2e" o "1,2 tCO2e", eligiendo la unidad según el valor. */
export function formatEmission(kg: number, unit: EmissionUnit = pickEmissionUnit(kg)): string {
  return `${formatEmissionNumber(kg, unit)} ${emissionUnitLabel(unit)}`;
}
