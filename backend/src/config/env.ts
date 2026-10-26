import 'dotenv/config';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido');
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  // Orígenes permitidos por CORS: el frontend desplegado y, en desarrollo, localhost.
  corsOrigins: (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean),
  db: {
    // En Render (y similares) basta con DATABASE_URL; si no existe se usan las variables sueltas.
    ...(process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          // La base externa de Render exige SSL; la interna (misma región) no. Se activa con DB_SSL=true.
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
        }
      : {}),
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'huellatdea',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  mail: {
    host: process.env.MAIL_HOST || 'localhost',
    port: Number(process.env.MAIL_PORT) || 1025,
    from: process.env.MAIL_FROM || 'Huella TdeA <no-reply@tdea.edu.co>',
    // Credenciales del proveedor SMTP real (Gmail, Outlook/Office 365, SendGrid, etc.).
    // Si MAIL_USER no está definido se asume un servidor local sin autenticación (Mailpit).
    user: process.env.MAIL_USER || '',
    password: process.env.MAIL_PASSWORD || '',
    secure: process.env.MAIL_SECURE === 'true',
    // 'smtp' (por defecto) o 'brevo' (API HTTPS: útil donde el hosting bloquea los puertos SMTP).
    provider: (process.env.MAIL_PROVIDER || 'smtp').toLowerCase(),
    brevoApiKey: process.env.BREVO_API_KEY || '',
  },
  // Cualquier proveedor con API compatible con OpenAI (Groq, OpenRouter, Gemini, Ollama...).
  // Por defecto Groq, que tiene un plan gratuito sin tarjeta.
  ai: {
    apiKey: process.env.AI_API_KEY || '',
    baseUrl: (process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/$/, ''),
    model: process.env.AI_MODEL || 'openai/gpt-oss-120b',
  },
};
