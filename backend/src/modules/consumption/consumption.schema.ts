import { z } from 'zod';

export const createConsumptionSchema = z.object({
  zoneId: z.string().uuid('Selecciona una zona válida'),
  kwh: z.number().min(0, 'El consumo no puede ser negativo'),
  recordedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ingresa una fecha válida (AAAA-MM-DD)'),
});

export const updateConsumptionSchema = z.object({
  zoneId: z.string().uuid('Selecciona una zona válida').optional(),
  kwh: z.number().min(0, 'El consumo no puede ser negativo').optional(),
  recordedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ingresa una fecha válida (AAAA-MM-DD)').optional(),
});

export type CreateConsumptionInput = z.infer<typeof createConsumptionSchema>;
export type UpdateConsumptionInput = z.infer<typeof updateConsumptionSchema>;
