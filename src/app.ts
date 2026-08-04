import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { csrfProtection } from "./middlewares/csrf.middleware";
import { apiLimiter } from "./middlewares/rate-limiter.middleware";
import { envConfig } from "./config/env-config";
import {
  globalErrorHandler,
  notFoundHandler,
} from "./middlewares/error-handler.middleware";
import routes from "./routes";

const app: Application = express();
app.set("trust proxy", 1);

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "res.cloudinary.com"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
}));
app.use(
  cors({
    origin: [envConfig.frontend_url, "http://localhost:3000"],
    credentials: true,
  }),
);

// Global Rate Limiting
// app.use(apiLimiter);

// Core Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(compression());

if (envConfig.env === "development") {
  app.use(morgan("dev"));
} else {
  // Ensure logs directory exists
  const logDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const accessLogStream = fs.createWriteStream(path.join(logDir, "access.log"), { flags: "a" });
  app.use(morgan("combined", { stream: accessLogStream }));
}

// Health Check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// API Routes Version 1
app.use("/api/v1", csrfProtection, routes);

// Global Error & Not Found Handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
