import { z } from 'zod';
import { env } from '../../config/env.js';
import * as questionnaireRepository from '../questionnaire/questionnaire.repository.js';
import type { Recommendation, RecommendationCategory, RecommendationsResult } from './recommendations.types.js';

const REQUEST_TIMEOUT_MS = 20_000;
const CACHE_LIMIT = 500;

/** Cada respuesta del cuestionario es inmutable, así que sus recomendaciones se calculan una sola vez. */
const cache = new Map<string, Recommendation[]>();

const FALLBACK: Record<RecommendationCategory, Omit<Recommendation, 'category'>> = {
  transporte: {
    title: 'Usa más la bici',
    description: 'Cambiar algunos trayectos en carro o moto por bicicleta o transporte público reduce tu huella de transporte.',
  },
  energia: {
    title: 'Apaga dispositivos',
    description: 'Desconectar equipos y apagar luces al salir del aula reduce el consumo "vampiro".',
  },
  residuos: {
    title: 'Reduce plásticos',
    description: 'Opta por envases reutilizables en las cafeterías del campus y separa tus residuos.',
  },
};

const aiItemSchema = z.object({
  category: z.enum(['transporte', 'energia', 'residuos']),
  // Si el modelo se excede se recorta en vez de descartar toda la respuesta.
  title: z.string().min(3).transform((s) => s.slice(0, 80)),
  description: z.string().min(10).transform((s) => s.slice(0, 300)),
});
const aiResponseSchema = z.array(aiItemSchema).min(1).max(6);

function rulesFallback(values: Record<RecommendationCategory, number>): Recommendation[] {
  return (Object.keys(values) as RecommendationCategory[])
    .sort((a, b) => values[b] - values[a])
    .map((category) => ({ category, ...FALLBACK[category] }));
}

/**
 * El modelo a veces devuelve menos de 3 recomendaciones o repite una categoría. Se deja una por
 * categoría y las que falten se completan con el catálogo de respaldo, ordenadas por huella.
 */
function completeCategories(items: Recommendation[], values: Record<RecommendationCategory, number>): Recommendation[] {
  const byCategory = new Map<RecommendationCategory, Recommendation>();
  for (const item of items) if (!byCategory.has(item.category)) byCategory.set(item.category, item);
  return (Object.keys(values) as RecommendationCategory[])
    .sort((a, b) => values[b] - values[a])
    .map((category) => byCategory.get(category) ?? { category, ...FALLBACK[category] });
}

type ResponseRow = Awaited<ReturnType<typeof questionnaireRepository.listResponsesByUser>>[number];

function buildPrompt(row: ResponseRow, tdeaAverageKg: number | null): string {
  const r = row as unknown as Record<string, unknown>;
  const transporte = Number(r.transport_kg_co2e);
  const energia = Number(r.facilities_kg_co2e) + Number(r.devices_kg_co2e);
  const residuos = Number(r.waste_kg_co2e);
  return [
    'Datos de una persona de la comunidad universitaria (huella anual atribuible al campus, en kg CO2e):',
    `- Transporte: ${transporte.toFixed(1)} (medio: ${r.transport_mode}, ${r.transport_km_per_trip} km por trayecto, ${r.transport_days_per_week} días/semana)`,
    `- Energía: ${energia.toFixed(1)} (horas diarias en campus: ${r.campus_hours_per_day}, usa laptop: ${r.uses_laptop ? 'sí' : 'no'}, carga dispositivos: ${r.charges_devices ? 'sí' : 'no'})`,
    `- Residuos: ${residuos.toFixed(1)} (frecuencia percibida: ${r.waste_frequency})`,
    tdeaAverageKg !== null ? `- Promedio de la comunidad TdeA (total): ${tdeaAverageKg.toFixed(1)}` : '',
    '',
    'Genera EXACTAMENTE 3 recomendaciones, una por categoría (transporte, energia, residuos), concretas y realistas',
    'para un campus universitario en Medellín, priorizando donde esta persona tiene más margen de mejora.',
    'Las acciones deben ser algo que la propia persona pueda hacer, redactadas en segunda persona (tú). Si una categoría tiene',
    'huella 0, felicítala y sugiere mantener el hábito en lugar de proponer un cambio.',
    'Evita sugerir comprar equipos o gadgets. No inventes porcentajes ni cifras de ahorro. Responde SOLO con un objeto JSON, sin texto adicional:',
    '{"recomendaciones":[{"category":"transporte|energia|residuos","title":"máx. 5 palabras","description":"máx. 160 caracteres"}]}',
  ]
    .join('\n');
}

async function askModel(prompt: string): Promise<Recommendation[]> {
  const res = await fetch(`${env.ai.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${env.ai.apiKey}`,
    },
    body: JSON.stringify({
      model: env.ai.model,
      max_tokens: 1500,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Eres un asesor de sostenibilidad para estudiantes y docentes del Tecnológico de Antioquia. Respondes en español, de forma breve, amable y accionable.',
        },
        { role: 'user', content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`La API de IA respondió ${res.status}`);
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content ?? '';
  const match = text.match(/[\[{][\s\S]*[\]}]/);
  if (!match) throw new Error('La respuesta de la IA no contiene JSON');
  const parsed = JSON.parse(match[0]);
  return aiResponseSchema.parse(Array.isArray(parsed) ? parsed : parsed.recomendaciones ?? parsed.recommendations ?? parsed.items);
}

export async function getRecommendations(userId: string, tdeaAverageKg: number | null): Promise<RecommendationsResult> {
  const responses = await questionnaireRepository.listResponsesByUser(userId);
  if (responses.length === 0) return { hasResponses: false, source: 'rules', items: [] };

  const latest = responses[0]; // listResponsesByUser ordena de más reciente a más antigua
  const latestRecord = latest as unknown as Record<string, unknown>;
  // La clave depende de los datos, no solo del id: si la persona reemplaza su respuesta del mes
  // los hábitos cambian y deben generarse recomendaciones nuevas.
  const cacheKey = JSON.stringify([
    latestRecord.id,
    latestRecord.transport_mode,
    latestRecord.transport_km_per_trip,
    latestRecord.transport_days_per_week,
    latestRecord.campus_hours_per_day,
    latestRecord.uses_laptop,
    latestRecord.charges_devices,
    latestRecord.waste_frequency,
    latestRecord.total_kg_co2e,
  ]);

  const cached = cache.get(cacheKey);
  if (cached) return { hasResponses: true, source: 'ai', items: cached };

  const values: Record<RecommendationCategory, number> = {
    transporte: Number(latestRecord.transport_kg_co2e),
    energia: Number(latestRecord.facilities_kg_co2e) + Number(latestRecord.devices_kg_co2e),
    residuos: Number(latestRecord.waste_kg_co2e),
  };

  if (!env.ai.apiKey) return { hasResponses: true, source: 'rules', items: rulesFallback(values) };

  try {
    const items = completeCategories(await askModel(buildPrompt(latest, tdeaAverageKg)), values);
    if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value as string);
    cache.set(cacheKey, items);
    return { hasResponses: true, source: 'ai', items };
  } catch (err) {
    console.error('[recommendations] falló la IA, se usa el catálogo de respaldo:', (err as Error).message);
    return { hasResponses: true, source: 'rules', items: rulesFallback(values) };
  }
}
