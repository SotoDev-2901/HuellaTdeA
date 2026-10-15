import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

const { host, port, user, password, secure } = env.mail;

// Con MAIL_USER definido se autentica contra un proveedor SMTP real (correos que sí llegan al
// buzón institucional). Sin él se usa un servidor local sin autenticación, como Mailpit.
const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  ...(user ? { auth: { user, pass: password } } : {}),
});

export async function sendMail(to: string, subject: string, html: string): Promise<void> {
  await transporter.sendMail({ from: env.mail.from, to, subject, html });
}
