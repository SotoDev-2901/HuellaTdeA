export const shorthands = undefined;

export const up = (pgm) => {
  pgm.addColumn('questionnaire_responses', {
    eating_frequency: {
      type: 'text',
      notNull: true,
      default: 'siempre',
      check: "eating_frequency IN ('nunca', 'ocasional', 'mayoria', 'siempre')",
    },
  });
};

export const down = (pgm) => {
  pgm.dropColumn('questionnaire_responses', 'eating_frequency');
};
