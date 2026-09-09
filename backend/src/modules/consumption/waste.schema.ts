import { z } from 'zod';

export const createWasteSchema = z.object({
  zoneId: z.string().uuid('Selecciona una zona válida'),
  wasteType: z.enum(['plastico', 'papel', 'organico'], {
    errorMap: () => ({ message: 'Selecciona un tipo de residuo válido' }),
  }),
  kg: z.number().min(0, 'El peso no puede ser negativo'),
  recordedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ingresa una fecha válida (AAAA-MM-DD)'),
});

export const updateWasteSchema = z.object({
  zoneId: z.string().uuid('Selecciona una zona válida').optional(),
  wasteType: z
    .enum(['plastico', 'papel', 'organico'], {
      errorMap: () => ({ message: 'Selecciona un tipo de residuo válido' }),
    })
    .optional(),
  kg: z.number().min(0, 'El peso no puede ser negativo').optional(),
  recordedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ingresa una fecha válida (AAAA-MM-DD)').optional(),
});

export type CreateWasteInput = z.infer<typeof createWasteSchema>;
export type UpdateWasteInput = z.infer<typeof updateWasteSchema>;
