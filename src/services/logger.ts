import { BusinessCard, APIResponse } from '../types/business-card';

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: {
    name?: string;
    message: string;
    stack?: string;
    cause?: unknown;
  };
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatError(error: unknown): { message: string; name?: string; stack?: string; cause?: unknown } {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause instanceof Error ? this.formatError(error.cause) : error.cause
      };
    }
    return { message: String(error) };
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: unknown
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context ? JSON.parse(JSON.stringify(context)) : undefined
    };

    if (error) {
      entry.error = this.formatError(error);
    }

    return entry;
  }

  private addLog(entry: LogEntry): void {
    this.logs.unshift(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.pop();
    }
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      const consoleArgs = [
        `[${entry.level}] ${entry.message}`,
        ...(entry.context ? ['\nContext:', entry.context] : []),
        ...(entry.error ? ['\nError:', entry.error] : []),
      ];

      switch (entry.level) {
        case LogLevel.ERROR:
          console.error(...consoleArgs);
          break;
        case LogLevel.WARN:
          console.warn(...consoleArgs);
          break;
        case LogLevel.INFO:
          console.info(...consoleArgs);
          break;
        default:
          console.log(...consoleArgs);
      }
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.addLog(this.createLogEntry(LogLevel.DEBUG, message, context));
  }

  info(message: string, context?: Record<string, any>): void {
    this.addLog(this.createLogEntry(LogLevel.INFO, message, context));
  }

  warn(message: string, context?: Record<string, any>, error?: unknown): void {
    this.addLog(this.createLogEntry(LogLevel.WARN, message, context, error));
  }

  error(message: string, context?: Record<string, any>, error?: unknown): void {
    try {
      const safeContext = context ? JSON.parse(JSON.stringify(context)) : undefined;
      const formattedError = error ? this.formatError(error) : undefined;
      
      this.addLog({
        timestamp: new Date().toISOString(),
        level: LogLevel.ERROR,
        message,
        context: safeContext,
        error: formattedError
      });
    } catch (e) {
      // Fallback if there are serialization issues
      this.addLog({
        timestamp: new Date().toISOString(),
        level: LogLevel.ERROR,
        message: `${message} (Error serializing details)`,
        error: { message: String(error) }
      });
    }
  }

  // Specific logging methods for business card operations
  logImageProcessing(file: File): void {
    this.info('Processing image', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      timestamp: new Date().toISOString()
    });
  }

  logOCRResult(text: string, duration: number): void {
    this.info('OCR completed', {
      textLength: text.length,
      durationMs: duration,
      hasText: text.trim().length > 0,
    });
  }

  logBusinessCardExtraction(card: BusinessCard): void {
    this.info('Business card data extracted', {
      companyName: card.companyName,
      personName: card.personName,
      hasEmail: Boolean(card.email),
      phoneCount: card.phones.length,
      hasWebsite: Boolean(card.website),
      hasAddress: Boolean(card.address),
    });
  }

  logAPIResponse(response: APIResponse): void {
    this.info('API response received', {
      companyDetailsCount: response.companyDetails?.length ?? 0,
      personDetailsCount: response.personDetails?.length ?? 0,
      hasSocialProfiles: Boolean(response.socialProfiles),
      hasCompanyInfo: Boolean(response.companyInfo),
    });
  }

  logRetryAttempt(attempt: number, delay: number, error: unknown): void {
    this.warn(
      `Retry attempt ${attempt}`,
      {
        attemptNumber: attempt,
        delayMs: delay,
        errorType: error instanceof Error ? error.name : typeof error
      },
      error
    );
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getErrorLogs(): LogEntry[] {
    return this.logs.filter(log => log.level === LogLevel.ERROR);
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = Logger.getInstance();