import dotenv from "dotenv";

// Load environment variables (safe to call in serverless too)
dotenv.config();

import { createApp } from "./app";
import { connectDatabase } from "./config/database";

// Create the Express app instance once
const app = createApp();

// Only connect to DB and call app.listen() when NOT running on Vercel
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;

  const startServer = async (): Promise<void> => {
    try {
      await connectDatabase();
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      });
    } catch (error) {
      console.error("Server startup error:", error);
      process.exit(1);
    }
  };

  startServer();
} else {
  // On Vercel: connect to DB on first request (cold start)
  // This runs only once per Lambda instance
  let dbConnected = false;
  app.use(async (req, _res, next) => {
    if (!dbConnected) {
      try {
        await connectDatabase();
        dbConnected = true;
        console.log("Database connected (Vercel cold start)");
      } catch (err) {
        console.error("Failed to connect to database on cold start:", err);
      }
    }
    next();
  });
}

// This is the most important line — Vercel needs this export
export default app;
