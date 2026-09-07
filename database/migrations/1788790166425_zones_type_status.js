export const shorthands = undefined;

export const up = (pgm) => {
  pgm.addColumn('zones', {
    type: { type: 'varchar(30)', notNull: true, default: 'academica' }, // academica | administrativa
    status: { type: 'varchar(20)', notNull: true, default: 'activa' }, // activa | inactiva
  });

  pgm.addConstraint('zones', 'zones_type_check', {
    check: "type IN ('academica', 'administrativa')",
  });
  pgm.addConstraint('zones', 'zones_status_check', {
    check: "status IN ('activa', 'inactiva')",
  });
};

export const down = (pgm) => {
  pgm.dropConstraint('zones', 'zones_status_check');
  pgm.dropConstraint('zones', 'zones_type_check');
  pgm.dropColumn('zones', 'status');
  pgm.dropColumn('zones', 'type');
};
