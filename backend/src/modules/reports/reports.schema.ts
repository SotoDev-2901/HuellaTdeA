import { z } from 'zod';

export const institutionalReportQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ingresa una fecha inicial válida (AAAA-MM-DD)').optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ingresa una fecha final válida (AAAA-MM-DD)').optional(),
});

export type InstitutionalReportQuery = z.infer<typeof institutionalReportQuerySchema>;
