export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  service: string;
  message: string;
  data?: any;
  error?: Error;
  tenantId?: string;
  userId?: string;
  requestId?: string;
}

export class Logger {
  private service: string;
  private logLevel: LogLevel;
  private logEntries: LogEntry[] = [];

  constructor(service: string, logLevel: LogLevel = LogLevel.INFO) {
    this.service = service;
    this.logLevel = logLevel;
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: any, error?: Error): void {
    this.log(LogLevel.ERROR, message, data, error);
  }

  fatal(message: string, data?: any, error?: Error): void {
    this.log(LogLevel.FATAL, message, data, error);
  }

  private log(level: LogLevel, message: string, data?: any, error?: Error): void {
    if (level < this.logLevel) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      service: this.service,
      message,
      data,
      error,
      tenantId: data?.tenantId,
      userId: data?.userId,
      requestId: data?.requestId
    };

    this.logEntries.push(logEntry);

    // Console output for development
    const levelName = LogLevel[level];
    const timestamp = logEntry.timestamp.toISOString();
    const logMessage = `[${timestamp}] ${levelName} [${this.service}] ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, data);
        break;
      case LogLevel.INFO:
        console.info(logMessage, data);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(logMessage, data, error);
        break;
    }

    // In production, you would send logs to external service
    // this.sendToLogService(logEntry);
  }

  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logEntries.slice(-count);
  }

  clearLogs(): void {
    this.logEntries = [];
  }

  // Mock method for external log service integration
  private sendToLogService(logEntry: LogEntry): void {
    // In production, integrate with services like:
    // - DataDog
    // - New Relic
    // - CloudWatch
    // - Elasticsearch/Kibana
  }
} 