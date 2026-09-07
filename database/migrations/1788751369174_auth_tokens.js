export const shorthands = undefined;

export const up = (pgm) => {
  pgm.addColumn('users', {
    email_verified: { type: 'boolean', notNull: true, default: false },
  });

  pgm.createTable('auth_tokens', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    token: { type: 'text', notNull: true, unique: true },
    type: { type: 'varchar(30)', notNull: true }, // verify_email | reset_password
    expires_at: { type: 'timestamptz', notNull: true },
    used_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('auth_tokens', ['user_id', 'type']);
};

export const down = (pgm) => {
  pgm.dropTable('auth_tokens');
  pgm.dropColumn('users', 'email_verified');
};
