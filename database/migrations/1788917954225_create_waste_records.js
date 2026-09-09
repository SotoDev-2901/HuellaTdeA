export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable('waste_records', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    zone_id: {
      type: 'uuid',
      notNull: true,
      references: 'zones',
      onDelete: 'CASCADE',
    },
    waste_type: { type: 'varchar(20)', notNull: true }, // plastico | papel | organico
    kg: { type: 'numeric(10,2)', notNull: true },
    recorded_at: { type: 'date', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.addConstraint('waste_records', 'waste_records_type_check', {
    check: "waste_type IN ('plastico', 'papel', 'organico')",
  });
  pgm.addConstraint('waste_records', 'waste_records_kg_check', {
    check: 'kg >= 0',
  });
};

export const down = (pgm) => {
  pgm.dropTable('waste_records');
};
