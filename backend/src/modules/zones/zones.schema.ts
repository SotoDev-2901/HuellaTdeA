import { z } from 'zod';

export const createZoneSchema = z.object({
  name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().trim().max(500).optional(),
  type: z.enum(['academica', 'administrativa']),
});

export const updateZoneSchema = z.object({
  name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
  description: z.string().trim().max(500).optional(),
  type: z.enum(['academica', 'administrativa']).optional(),
  status: z.enum(['activa', 'inactiva']).optional(),
});

export type CreateZoneInput = z.infer<typeof createZoneSchema>;
export type UpdateZoneInput = z.infer<typeof updateZoneSchema>;
