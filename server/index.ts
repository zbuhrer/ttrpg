import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import logger from "./logger";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple CORS headers without middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// Use the logger's request middleware
app.use(logger.requestLogger());

// Add a simple health check endpoint that doesn't get handled by Vite
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

(async () => {
  try {
    logger.info("server", "Starting Aetherquill server...", {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT || "5000",
    });

    const server = await registerRoutes(app);

    // Use the logger's error handler middleware
    app.use(logger.errorHandler());

    // Special handling for API routes to prevent Vite from handling them
    app.use("/api", (req, res) => {
      // If we get here, it means no API route matched
      res.status(404).json({
        message: "API endpoint not found",
        path: req.originalUrl,
      });
    });

    // Setup Vite in development or serve static files in production
    if (app.get("env") === "development") {
      logger.info("server", "Setting up Vite development server...");
      await setupVite(app, server);
    } else {
      logger.info("server", "Serving static files for production...");
      serveStatic(app);
    }

    // Start the server
    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen(
      {
        port,
        host: "0.0.0.0", // Allow connections from all network interfaces
      },
      () => {
        logger.info("server", `Server started successfully`, {
          port,
          host: "localhost",
          logFile: logger.getLogFilePath(),
          environment: app.get("env"),
        });

        logger.info("server", `Log file location: ${logger.getLogFilePath()}`);
        logger.info(
          "server",
          `To tail logs, run: tail -f ${logger.getLogFilePath()}`,
        );
      },
    );

    // Graceful shutdown handling
    process.on("SIGTERM", () => {
      logger.info("server", "Received SIGTERM, shutting down gracefully...");
      server.close(() => {
        logger.info("server", "Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      logger.info("server", "Received SIGINT, shutting down gracefully...");
      server.close(() => {
        logger.info("server", "Server closed");
        process.exit(0);
      });
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      logger.fatal("server", "Uncaught exception", error);
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error(
        "server",
        "Unhandled rejection",
        reason instanceof Error ? reason : new Error(String(reason)),
        {
          promise: promise.toString(),
        },
      );
    });

    // Rotate logs periodically (every hour)
    setInterval(
      () => {
        logger.rotateLogs();
      },
      60 * 60 * 1000,
    );
  } catch (error) {
    logger.fatal(
      "server",
      "Failed to start server",
      error instanceof Error ? error : new Error(String(error)),
    );
  }
})();
