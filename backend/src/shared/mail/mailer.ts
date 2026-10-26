import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

/** "Nombre <correo@dominio>" -> { name, email } (Brevo pide el remitente separado). */
function parseSender(from: string): { name?: string; email: string } {
  const match = from.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  return match ? { name: match[1].trim() || undefined, email: match[2].trim() } : { email: from.trim() };
}

async function sendViaBrevo(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch(BREVO_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json', 'api-key': env.mail.brevoApiKey },
    body: JSON.stringify({ sender: parseSender(env.mail.from), to: [{ email: to }], subject, htmlContent: html }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Brevo respondió ${res.status}: ${detail.slice(0, 200)}`);
  }
}

let transporter: nodemailer.Transporter | null = null;

// Con MAIL_USER definido se autentica contra un proveedor SMTP real (los correos llegan al buzón
// institucional). Sin él se usa un servidor local sin autenticación, como Mailpit.
function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    const { host, port, user, password, secure } = env.mail;
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      ...(user ? { auth: { user, pass: password } } : {}),
    });
  }
  return transporter;
}

export async function sendMail(to: string, subject: string, html: string): Promise<void> {
  if (env.mail.provider === 'brevo') {
    return sendViaBrevo(to, subject, html);
  }
  await getTransporter().sendMail({ from: env.mail.from, to, subject, html });
}

export { parseSender };
