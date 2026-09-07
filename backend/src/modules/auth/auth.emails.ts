import { env } from '../../config/env.js';

export function verifyEmailTemplate(name: string, token: string) {
  const link = `${env.frontendUrl}/verificar-correo?token=${token}`;
  return {
    subject: 'Verifica tu correo — Huella TdeA',
    html: `<p>Hola ${name},</p>
      <p>Confirma tu correo institucional para activar tu cuenta en Huella TdeA:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Este enlace vence en 1 hora.</p>`,
  };
}

export function resetPasswordTemplate(name: string, token: string) {
  const link = `${env.frontendUrl}/restablecer-contrasena?token=${token}`;
  return {
    subject: 'Recupera tu contraseña — Huella TdeA',
    html: `<p>Hola ${name},</p>
      <p>Solicitaste restablecer tu contraseña. Haz clic en el siguiente enlace para elegir una nueva:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Si no fuiste tú, ignora este correo. Este enlace vence en 1 hora.</p>`,
  };
}
