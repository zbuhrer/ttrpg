import fs from 'fs';
import path from 'path';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: string;
  level: string;
  source: string;
  message: string;
  data?: any;
  stack?: string;
}

class Logger {
  private logFile: string;
  private minLevel: LogLevel;

  constructor(logFile?: string, minLevel: LogLevel = LogLevel.INFO) {
    // Default to logs directory in project root
    this.logFile = logFile || path.resolve(process.cwd(), 'logs', 'app.log');
    this.minLevel = minLevel;

    // Ensure log directory exists
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private writeLog(entry: LogEntry): void {
    const logLine = `${entry.timestamp} [${entry.level}] [${entry.source}] ${entry.message}${entry.data ? ` | Data: ${JSON.stringify(entry.data, null, 2)}` : ''}${entry.stack ? `\nStack: ${entry.stack}` : ''}\n`;

    // Write to console with color coding
    const consoleMessage = this.colorizeConsoleOutput(entry);
    console.log(consoleMessage);

    // Write to file
    try {
      fs.appendFileSync(this.logFile, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private colorizeConsoleOutput(entry: LogEntry): string {
    const colors = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m',  // Green
      WARN: '\x1b[33m',  // Yellow
      ERROR: '\x1b[31m', // Red
      FATAL: '\x1b[35m', // Magenta
      RESET: '\x1b[0m'   // Reset
    };

    const color = colors[entry.level as keyof typeof colors] || colors.INFO;
    const resetColor = colors.RESET;

    let message = `${color}${entry.timestamp} [${entry.level}] [${entry.source}] ${entry.message}${resetColor}`;

    if (entry.data) {
      message += `\n${color}Data: ${JSON.stringify(entry.data, null, 2)}${resetColor}`;
    }

    if (entry.stack) {
      message += `\n${color}Stack: ${entry.stack}${resetColor}`;
    }

    return message;
  }

  private log(level: LogLevel, levelName: string, source: string, message: string, data?: any, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level: levelName,
      source,
      message,
      data,
      stack: error?.stack
    };

    this.writeLog(entry);
  }

  debug(source: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, 'DEBUG', source, message, data);
  }

  info(source: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, 'INFO', source, message, data);
  }

  warn(source: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, 'WARN', source, message, data);
  }

  error(source: string, message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, 'ERROR', source, message, data, error);
  }

  fatal(source: string, message: string, error?: Error, data?: any): void {
    this.log(LogLevel.FATAL, 'FATAL', source, message, data, error);
    // In fatal cases, we might want to exit
    process.exit(1);
  }

  // Express middleware for request logging
  requestLogger() {
    return (req: any, res: any, next: any) => {
      const start = Date.now();
      const originalResJson = res.json;
      let capturedResponse: any = undefined;

      res.json = function (bodyJson: any, ...args: any[]) {
        capturedResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
      };

      res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          userAgent: req.get('User-Agent'),
          ip: req.ip || req.connection.remoteAddress,
          ...(capturedResponse && { response: capturedResponse })
        };

        const message = `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`;

        if (res.statusCode >= 500) {
          this.error('express', message, undefined, logData);
        } else if (res.statusCode >= 400) {
          this.warn('express', message, logData);
        } else {
          this.info('express', message, logData);
        }
      });

      next();
    };
  }

  // Express error handler middleware
  errorHandler() {
    return (err: any, req: any, res: any, next: any) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || 'Internal Server Error';

      this.error('express-error', `${req.method} ${req.path} - ${message}`, err, {
        method: req.method,
        path: req.path,
        body: req.body,
        params: req.params,
        query: req.query,
        headers: req.headers,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress
      });

      res.status(status).json({ message });
    };
  }

  // Method to get log file path for tailing
  getLogFilePath(): string {
    return this.logFile;
  }

  // Method to rotate log file (call this periodically)
  rotateLogs(): void {
    try {
      const stats = fs.statSync(this.logFile);
      const maxSize = 50 * 1024 * 1024; // 50MB

      if (stats.size > maxSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedFile = this.logFile.replace('.log', `-${timestamp}.log`);
        fs.renameSync(this.logFile, rotatedFile);
        this.info('logger', `Log file rotated to ${rotatedFile}`);
      }
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }
  }
}

// Create singleton logger instance
const logger = new Logger();

// Set log level based on environment
if (process.env.NODE_ENV === 'development') {
  logger['minLevel'] = LogLevel.DEBUG;
} else {
  logger['minLevel'] = LogLevel.INFO;
}

export default logger;

// Convenience exports for backward compatibility
export const log = (message: string, source: string = 'app') => logger.info(source, message);
export const logError = (message: string, error?: Error, source: string = 'app') => logger.error(source, message, error);
export const logWarn = (message: string, source: string = 'app') => logger.warn(source, message);
export const logDebug = (message: string, source: string = 'app') => logger.debug(source, message);
