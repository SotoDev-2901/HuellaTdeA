export type RecommendationCategory = 'transporte' | 'energia' | 'residuos';

export interface Recommendation {
  category: RecommendationCategory;
  title: string;
  description: string;
}

export interface RecommendationsResult {
  hasResponses: boolean;
  /** 'ai' cuando las generó el modelo; 'rules' cuando se usó el catálogo de respaldo. */
  source: 'ai' | 'rules';
  items: Recommendation[];
}
