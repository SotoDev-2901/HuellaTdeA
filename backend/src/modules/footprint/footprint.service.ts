import {
  calculateDeviceEmissions,
  calculateDietEmissions,
  calculateTransportEmissions,
  calculateWasteEmissions,
  type DietType,
  type TransportMode,
} from './emissionFactors.js';

export interface FootprintInput {
  transportMode: TransportMode;
  transportKmPerTrip: number;
  transportTripsPerWeek: number;
  deviceHoursPerDay: number;
  deviceDaysPerWeek: number;
  wasteKgPerWeek: number;
  dietType: DietType;
}

export interface FootprintResult {
  transportKgCo2e: number;
  devicesKgCo2e: number;
  wasteKgCo2e: number;
  dietKgCo2e: number;
  totalKgCo2e: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateFootprint(input: FootprintInput): FootprintResult {
  const transportKgCo2e = round2(
    calculateTransportEmissions(
      input.transportMode,
      input.transportKmPerTrip,
      input.transportTripsPerWeek,
    ),
  );
  const devicesKgCo2e = round2(
    calculateDeviceEmissions(input.deviceHoursPerDay, input.deviceDaysPerWeek),
  );
  const wasteKgCo2e = round2(calculateWasteEmissions(input.wasteKgPerWeek));
  const dietKgCo2e = round2(calculateDietEmissions(input.dietType));

  return {
    transportKgCo2e,
    devicesKgCo2e,
    wasteKgCo2e,
    dietKgCo2e,
    totalKgCo2e: round2(transportKgCo2e + devicesKgCo2e + wasteKgCo2e + dietKgCo2e),
  };
}
