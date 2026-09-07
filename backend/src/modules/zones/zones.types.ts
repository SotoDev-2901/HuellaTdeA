export type ZoneType = 'academica' | 'administrativa';
export type ZoneStatus = 'activa' | 'inactiva';

export interface Zone {
  id: string;
  name: string;
  description: string | null;
  type: ZoneType;
  status: ZoneStatus;
  created_at: Date;
}
