// src/app.ts
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import jobRoutes from "./routes/job.routes";
import applicationRoutes from "./routes/application.routes";
import uploadRoutes from "./routes/upload.routes";
import { errorHandler } from "./middleware/errorHandler.middleware";

// Create the Express application
const createApp = (): Application => {
  const app = express();

  // Security & performance middleware
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // CORS
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    }),
  );

  // Body parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/jobs", jobRoutes);
  app.use("/api/applications", applicationRoutes);
  app.use("/api/uploads", uploadRoutes);

  // Health check (Vercel also pings this automatically)
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Global error handler (must be last)
  app.use(
    errorHandler as (
      err: any,
      req: Request,
      res: Response,
      next: NextFunction,
    ) => void,
  );

  return app;
};

// Export a ready-to-use instance — this is what Vercel will import
// (You can still keep createApp() if some test/utils need it)
const app = createApp();
export default app;

// Also keep the factory export for flexibility (optional)
export { createApp };
