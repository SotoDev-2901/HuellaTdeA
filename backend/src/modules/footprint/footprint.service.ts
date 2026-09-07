import {
  calculateDeviceEmissions,
  calculateDietEmissions,
  calculateTransportEmissions,
  calculateWasteEmissions,
  wasteFrequencyToKgPerWeek,
  type DietType,
  type TransportMode,
  type WasteFrequency,
} from './emissionFactors.js';

export interface FootprintInput {
  transportMode: TransportMode;
  transportKmPerTrip: number;
  transportDaysPerWeek: number;
  campusHoursPerDay: number;
  usesLaptop: boolean;
  chargesDevices: boolean;
  wasteFrequency: WasteFrequency;
  dietType: DietType;
}

export interface FootprintResult {
  transportKgCo2e: number;
  devicesKgCo2e: number;
  wasteKgCo2e: number;
  wasteKgPerWeek: number;
  dietKgCo2e: number;
  totalKgCo2e: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateFootprint(input: FootprintInput): FootprintResult {
  const transportKgCo2e = round2(
    calculateTransportEmissions(input.transportMode, input.transportKmPerTrip, input.transportDaysPerWeek),
  );
  const devicesKgCo2e = round2(
    calculateDeviceEmissions(
      input.usesLaptop,
      input.chargesDevices,
      input.campusHoursPerDay,
      input.transportDaysPerWeek,
    ),
  );
  const wasteKgPerWeek = wasteFrequencyToKgPerWeek(input.wasteFrequency, input.transportDaysPerWeek);
  const wasteKgCo2e = round2(calculateWasteEmissions(wasteKgPerWeek));
  const dietKgCo2e = round2(calculateDietEmissions(input.dietType, input.transportDaysPerWeek));

  return {
    transportKgCo2e,
    devicesKgCo2e,
    wasteKgCo2e,
    wasteKgPerWeek,
    dietKgCo2e,
    totalKgCo2e: round2(transportKgCo2e + devicesKgCo2e + wasteKgCo2e + dietKgCo2e),
  };
}
