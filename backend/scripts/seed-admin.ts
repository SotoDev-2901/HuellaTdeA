import bcrypt from 'bcrypt';
import { pool } from '../src/config/db.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@correo.tdea.edu.co';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin12345';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Administrador TdeA';

async function main() {
  // En producción no se acepta la contraseña por defecto: una cuenta de administrador pública con
  // 'Admin12345' sería un hueco de seguridad.
  if (process.env.NODE_ENV === 'production' && (!process.env.ADMIN_PASSWORD || ADMIN_PASSWORD.length < 10)) {
    throw new Error('En producción define ADMIN_PASSWORD (mínimo 10 caracteres) antes de crear el administrador.');
  }
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, email_verified)
     VALUES ($1, $2, $3, 'administrador', true)
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash, role = 'administrador', email_verified = true
     RETURNING id, email, role`,
    [ADMIN_NAME, ADMIN_EMAIL, passwordHash],
  );

  console.log('Administrador listo:', rows[0]);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
