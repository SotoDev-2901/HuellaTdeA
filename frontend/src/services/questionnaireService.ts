import { apiGet, apiPost } from '../lib/api';

export type TransportMode = 'caminar' | 'bicicleta' | 'moto' | 'carro' | 'transporte_publico';
export type DietType = 'vegano' | 'vegetariano' | 'mixto_moderado' | 'carne_frecuente';
export type WasteFrequency = 'baja' | 'media' | 'alta';
export type CampusSpace =
  | 'aulas'
  | 'biblioteca'
  | 'laboratorios'
  | 'cafeteria'
  | 'auditorio'
  | 'zonas_verdes';
export type WasteComponent = 'plastico' | 'papel' | 'organico';

export interface QuestionnairePayload {
  transportMode: TransportMode;
  transportKmPerTrip: number;
  transportMinutesPerTrip?: number;
  transportDaysPerWeek: number;
  campusHoursPerDay: number;
  campusSpaces?: CampusSpace[];
  usesLaptop: boolean;
  chargesDevices: boolean;
  wasteFrequency: WasteFrequency;
  wasteComposition?: WasteComponent[];
  dietType: DietType;
}

export interface QuestionnaireResponse {
  id: string;
  transport_kg_co2e: string;
  devices_kg_co2e: string;
  waste_kg_co2e: string;
  diet_kg_co2e: string;
  total_kg_co2e: string;
  created_at: string;
}

export async function submitQuestionnaire(payload: QuestionnairePayload): Promise<QuestionnaireResponse> {
  const res = await apiPost<{ response: QuestionnaireResponse }>('/questionnaire', payload);
  return res.response;
}

export async function listMyResponses(): Promise<QuestionnaireResponse[]> {
  const res = await apiGet<{ responses: QuestionnaireResponse[] }>('/questionnaire');
  return res.responses;
}
