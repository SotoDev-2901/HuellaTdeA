import { describe, it, expect } from 'vitest';
import { formatEmission, pickEmissionUnit, formatEmissionNumber, formatDecimal } from './format';

describe('formatEmission', () => {
  it('muestra kg cuando el valor es menor a una tonelada', () => {
    expect(pickEmissionUnit(52)).toBe('kg');
    expect(formatEmission(52.4)).toBe('52,4 kgCO2e');
  });

  it('muestra toneladas desde 1000 kg', () => {
    expect(pickEmissionUnit(1500)).toBe('t');
    expect(formatEmission(1500)).toBe('1,5 tCO2e');
  });

  it('usa la misma unidad para varios valores según el mayor', () => {
    const unit = pickEmissionUnit(300, 2400);
    expect(unit).toBe('t');
    expect(formatEmissionNumber(300, unit)).toBe('0,3');
  });

  it('no muestra decimales sobrantes en cero', () => {
    expect(formatEmission(0)).toBe('0 kgCO2e');
  });
});

describe('formatDecimal', () => {
  it('usa separadores locales y decimales fijos', () => {
    expect(formatDecimal(3971.9)).toBe('3.971,90');
    expect(formatDecimal('1181.484')).toBe('1.181,48');
    expect(formatDecimal(0)).toBe('0,00');
  });
});
