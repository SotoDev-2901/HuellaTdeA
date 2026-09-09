export const shorthands = undefined;

export const up = (pgm) => {
  pgm.addColumn('questionnaire_responses', {
    facilities_kg_co2e: { type: 'numeric(10,2)', notNull: true, default: 0 },
  });
};

export const down = (pgm) => {
  pgm.dropColumn('questionnaire_responses', 'facilities_kg_co2e');
};
