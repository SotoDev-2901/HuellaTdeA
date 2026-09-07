import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.mail.host,
  port: env.mail.port,
  secure: false,
});

export async function sendMail(to: string, subject: string, html: string): Promise<void> {
  await transporter.sendMail({ from: env.mail.from, to, subject, html });
}
