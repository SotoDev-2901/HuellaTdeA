export const shorthands = undefined;

export const up = (pgm) => {
  pgm.addColumn('questionnaire_responses', {
    eats_on_campus: { type: 'boolean', notNull: true, default: true },
  });
};

export const down = (pgm) => {
  pgm.dropColumn('questionnaire_responses', 'eats_on_campus');
};
