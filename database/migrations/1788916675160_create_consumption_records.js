export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable('consumption_records', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    zone_id: {
      type: 'uuid',
      notNull: true,
      references: 'zones',
      onDelete: 'CASCADE',
    },
    kwh: { type: 'numeric(10,2)', notNull: true },
    recorded_at: { type: 'date', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.addConstraint('consumption_records', 'consumption_records_kwh_check', {
    check: 'kwh >= 0',
  });
};

export const down = (pgm) => {
  pgm.dropTable('consumption_records');
};
