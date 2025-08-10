import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import logger from "./logger";

const viteLogger = createLogger();

export async function setupVite(app: Express, server: Server) {
  logger.info("vite", "Setting up Vite development server...");

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      info: (msg, options) => {
        logger.debug("vite", msg);
        viteLogger.info(msg, options);
      },
      warn: (msg, options) => {
        logger.warn("vite", msg);
        viteLogger.warn(msg, options);
      },
      error: (msg, options) => {
        logger.error("vite", msg);
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      logger.error(
        "vite",
        "Failed to transform HTML",
        e instanceof Error ? e : new Error(String(e)),
        {
          url,
          template: clientTemplate,
        },
      );
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  logger.info("vite", "Vite development server setup complete");
}

export function serveStatic(app: Express) {
  logger.info("vite", "Setting up static file serving for production...");

  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    const error = new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
    logger.error("vite", "Build directory not found", error, { distPath });
    throw error;
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    logger.debug("vite", "Serving index.html fallback", { indexPath });
    res.sendFile(indexPath);
  });

  logger.info("vite", "Static file serving setup complete", { distPath });
}
