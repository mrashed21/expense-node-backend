import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { envConfig } from "./config/env-config";
import routes from "./routes";
import { globalErrorHandler, notFoundHandler } from "./middlewares/error-handler.middleware";

const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: [envConfig.frontend_url, "http://localhost:3000"],
    credentials: true,
  })
);

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
});
app.use(limiter);

// Core Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(compression());

if (envConfig.env === "development") {
  app.use(morgan("dev"));
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
app.use("/api/v1", routes);

// Global Error & Not Found Handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
