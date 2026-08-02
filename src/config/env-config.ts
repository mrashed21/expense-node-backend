import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export const envConfig = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5005,
  database_url: process.env.DATABASE_URL || "",
  jwt: {
    access_secret: process.env.ACCESS_TOKEN_SECRET || "default_access_secret",
    refresh_secret:
      process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret",
    access_expires_in: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    refresh_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  },
  frontend_url: process.env.FRONTEND_URL || "http://localhost:3000",
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
