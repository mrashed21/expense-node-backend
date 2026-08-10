import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const isProduction = process.env.NODE_ENV === "production";

const accessSecret = process.env.ACCESS_TOKEN_SECRET || "default_access_secret";
const refreshSecret =
  process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret";

if (isProduction) {
  if (accessSecret === "default_access_secret") {
    throw new Error(
      "FATAL: ACCESS_TOKEN_SECRET must be set in production. Cannot use default secret.",
    );
  }
  if (refreshSecret === "default_refresh_secret") {
    throw new Error(
      "FATAL: REFRESH_TOKEN_SECRET must be set in production. Cannot use default secret.",
    );
  }
}

export const envConfig = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5005,
  ably_api_key: process.env.ABLY_API_KEY || "",
  cron_secret: process.env.CRON_SECRET || "",
  database_url: process.env.DATABASE_URL || "",
  jwt: {
    access_secret: accessSecret,
    refresh_secret: refreshSecret,
    access_expires_in: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    refresh_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  },
  frontend_url: process.env.FRONTEND_URL || "http://localhost:3000",
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD || "12345678",
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  email: {
    smtp_host: process.env.EMAIL_SENDER_SMTP_HOST,
    smtp_port: process.env.EMAIL_SENDER_SMTP_PORT,
    smtp_user: process.env.EMAIL_SENDER_SMTP_USER,
    smtp_pass: process.env.EMAIL_SENDER_SMT_PASS,
    from: process.env.EMAIL_SENDER_SMTP_FROM,
  },
};
