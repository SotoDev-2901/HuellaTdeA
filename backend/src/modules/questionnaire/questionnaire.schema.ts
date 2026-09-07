import { z } from 'zod';

export const submitQuestionnaireSchema = z.object({
  transportMode: z.enum(['caminar', 'bicicleta', 'moto', 'carro', 'transporte_publico'], {
    errorMap: () => ({ message: 'Selecciona un medio de transporte válido' }),
  }),
  transportKmPerTrip: z.number().min(0, 'La distancia no puede ser negativa').max(500),
  transportMinutesPerTrip: z.number().min(0).max(600).optional(),
  transportDaysPerWeek: z.number().int().min(1, 'Selecciona al menos 1 día').max(7),

  campusHoursPerDay: z.number().min(0, 'Las horas no pueden ser negativas').max(24),
  campusSpaces: z
    .array(z.enum(['aulas', 'biblioteca', 'laboratorios', 'cafeteria', 'auditorio', 'zonas_verdes']))
    .optional(),
  usesLaptop: z.boolean(),
  chargesDevices: z.boolean(),

  wasteFrequency: z.enum(['baja', 'media', 'alta'], {
    errorMap: () => ({ message: 'Selecciona una frecuencia de residuos válida' }),
  }),
  wasteComposition: z.array(z.enum(['plastico', 'papel', 'organico'])).optional(),

  eatsOnCampus: z.boolean(),
  dietType: z.enum(['vegano', 'vegetariano', 'mixto_moderado', 'carne_frecuente'], {
    errorMap: () => ({ message: 'Selecciona un tipo de dieta válido' }),
  }),
});

export type SubmitQuestionnaireInput = z.infer<typeof submitQuestionnaireSchema>;
