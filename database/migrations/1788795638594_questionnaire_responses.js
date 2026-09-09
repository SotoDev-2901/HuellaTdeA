export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable('questionnaire_responses', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },

    transport_mode: { type: 'varchar(30)', notNull: true }, // caminar | bicicleta | moto | carro | transporte_publico
    transport_km_per_trip: { type: 'numeric(6,2)', notNull: true },
    transport_trips_per_week: { type: 'integer', notNull: true },

    device_hours_per_day: { type: 'numeric(4,2)', notNull: true },
    device_days_per_week: { type: 'integer', notNull: true },

    waste_kg_per_week: { type: 'numeric(6,2)', notNull: true },

    diet_type: { type: 'varchar(30)', notNull: true }, // vegano | vegetariano | mixto_moderado | carne_frecuente

    transport_kg_co2e: { type: 'numeric(10,2)', notNull: true },
    devices_kg_co2e: { type: 'numeric(10,2)', notNull: true },
    waste_kg_co2e: { type: 'numeric(10,2)', notNull: true },
    diet_kg_co2e: { type: 'numeric(10,2)', notNull: true },
    total_kg_co2e: { type: 'numeric(10,2)', notNull: true },

    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('questionnaire_responses', 'user_id');
};

export const down = (pgm) => {
  pgm.dropTable('questionnaire_responses');
};
