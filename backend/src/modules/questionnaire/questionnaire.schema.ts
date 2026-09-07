import { z } from 'zod';

export const submitQuestionnaireSchema = z.object({
  transportMode: z.enum(['caminar', 'bicicleta', 'moto', 'carro', 'transporte_publico'], {
    errorMap: () => ({ message: 'Selecciona un medio de transporte válido' }),
  }),
  transportKmPerTrip: z.number().min(0, 'La distancia no puede ser negativa').max(500),
  transportTripsPerWeek: z.number().int().min(0).max(28),
  deviceHoursPerDay: z.number().min(0, 'Las horas no pueden ser negativas').max(24),
  deviceDaysPerWeek: z.number().int().min(0).max(7),
  wasteKgPerWeek: z.number().min(0, 'El peso no puede ser negativo').max(200),
  dietType: z.enum(['vegano', 'vegetariano', 'mixto_moderado', 'carne_frecuente'], {
    errorMap: () => ({ message: 'Selecciona un tipo de dieta válido' }),
  }),
});

export type SubmitQuestionnaireInput = z.infer<typeof submitQuestionnaireSchema>;
