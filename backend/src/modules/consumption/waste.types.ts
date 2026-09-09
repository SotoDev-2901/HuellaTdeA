export type WasteType = 'plastico' | 'papel' | 'organico';

export interface WasteRecord {
  id: string;
  zone_id: string;
  zone_name: string;
  waste_type: WasteType;
  kg: string;
  recorded_at: string;
  created_at: Date;
}
