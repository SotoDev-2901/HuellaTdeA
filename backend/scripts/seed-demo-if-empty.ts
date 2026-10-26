/**
 * Carga los datos de demostración SOLO si SEED_DEMO=true y la base no tiene usuarios que no sean
 * administradores. Pensado para el primer arranque en el hosting: no borra nada si ya hay datos
 * (a diferencia de seed-demo.ts, que parte siempre de un estado limpio).
 */
import { spawnSync } from 'node:child_process';
import { pool } from '../src/config/db.js';

async function main() {
  if (process.env.SEED_DEMO !== 'true') {
    console.log('SEED_DEMO no está activo: no se cargan datos de demostración.');
    return;
  }
  const { rows } = await pool.query<{ n: number }>("SELECT count(*)::int AS n FROM users WHERE role <> 'administrador'");
  if (rows[0].n > 0) {
    console.log(`Ya hay ${rows[0].n} usuarios: no se tocan los datos existentes.`);
    return;
  }
  await pool.end();
  const result = spawnSync('npx', ['tsx', 'scripts/seed-demo.ts'], { stdio: 'inherit' });
  process.exit(result.status ?? 1);
}

main()
  .then(() => pool.end().catch(() => undefined))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
