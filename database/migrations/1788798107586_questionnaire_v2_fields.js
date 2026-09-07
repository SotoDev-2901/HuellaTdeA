export const shorthands = undefined;

export const up = (pgm) => {
  pgm.renameColumn('questionnaire_responses', 'transport_trips_per_week', 'transport_days_per_week');
  pgm.renameColumn('questionnaire_responses', 'device_hours_per_day', 'campus_hours_per_day');
  pgm.dropColumn('questionnaire_responses', 'device_days_per_week');

  pgm.addColumn('questionnaire_responses', {
    transport_minutes_per_trip: { type: 'numeric(6,2)' }, // informativo, no entra en el cálculo
    campus_spaces: { type: 'text[]' }, // informativo (aulas/biblioteca/laboratorios), no entra en el cálculo
    uses_laptop: { type: 'boolean', notNull: true, default: true },
    charges_devices: { type: 'boolean', notNull: true, default: false },
    waste_frequency: { type: 'varchar(10)', notNull: true, default: 'media' }, // baja | media | alta
    waste_composition: { type: 'text[]' }, // informativo (plástico/papel/orgánico), no entra en el cálculo
  });
};

export const down = (pgm) => {
  pgm.dropColumn('questionnaire_responses', [
    'transport_minutes_per_trip',
    'campus_spaces',
    'uses_laptop',
    'charges_devices',
    'waste_frequency',
    'waste_composition',
  ]);
  pgm.addColumn('questionnaire_responses', {
    device_days_per_week: { type: 'integer', notNull: true, default: 0 },
  });
  pgm.renameColumn('questionnaire_responses', 'campus_hours_per_day', 'device_hours_per_day');
  pgm.renameColumn('questionnaire_responses', 'transport_days_per_week', 'transport_trips_per_week');
};
