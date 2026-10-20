import { z } from 'zod';

const pct = z.number().min(1, 'El porcentaje debe ser al menos 1').max(100, 'El porcentaje no puede superar 100');

export const FROM_MODES = ['carro', 'moto', 'transporte_publico'] as const;
export const TO_MODES = ['transporte_publico', 'bicicleta', 'caminar'] as const;
export const WASTE_TYPES = ['plastico', 'papel', 'organico'] as const;

/** Cada "palanca" es una intervención concreta que el motor sabe calcular. La IA solo puede elegir entre estas. */
export const leverSchema = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal('cambio_transporte'),
    desde: z.enum(FROM_MODES),
    hacia: z.enum(TO_MODES),
    porcentaje: pct,
  }),
  z.object({
    tipo: z.literal('reduccion_dias'),
    diasMenos: z.number().int().min(1).max(3),
    porcentajePersonas: pct,
  }),
  z.object({
    tipo: z.literal('eficiencia_energetica'),
    porcentaje: z.number().min(1).max(60, 'Una reducción de energía mayor al 60 % no es realista'),
    zona: z.string().trim().min(1).nullish(),
  }),
  z.object({
    tipo: z.literal('reduccion_residuos'),
    porcentaje: z.number().min(1).max(90, 'Una reducción de residuos mayor al 90 % no es realista'),
    tipoResiduo: z.enum(WASTE_TYPES).nullish(),
    zona: z.string().trim().min(1).nullish(),
  }),
]);

export const runSchema = z.object({
  levers: z.array(leverSchema).min(1, 'Indica al menos un cambio para simular').max(5, 'Máximo 5 cambios por escenario'),
});

export const askSchema = z.object({
  question: z.string().trim().min(8, 'Escribe una pregunta un poco más completa').max(300, 'La pregunta es demasiado larga (máximo 300 caracteres)'),
});

/** Forma que debe devolver el modelo al interpretar una pregunta. */
export const interpretationSchema = z.union([
  z.object({
    entendido: z.literal(true),
    palancas: z.array(leverSchema).min(1).max(5),
    interpretacion: z.string().min(3).transform((s) => s.slice(0, 300)),
  }),
  z.object({
    entendido: z.literal(false),
    motivo: z.string().min(3).transform((s) => s.slice(0, 300)),
  }),
]);

export type Lever = z.infer<typeof leverSchema>;
