import nodemailer from "nodemailer";
import { envConfig } from "../config/env-config";

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: envConfig.email.smtp_host,
    port: Number(envConfig.email.smtp_port) || 587,
    secure: false,
    auth: {
      user: envConfig.email.smtp_user,
      pass: envConfig.email.smtp_pass,
    },
  });

  await transporter.sendMail({
    from: `"Expense Tracker" <${envConfig.email.from}>`,
    to,
    subject,
    html,
  });
};
