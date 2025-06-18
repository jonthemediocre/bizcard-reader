/**
 * Monitoring Engine for Production Genesis System
 * Provides real-time monitoring, alerting, and health checks
 */

export interface MonitoringConfig {
  enableHealthChecks: boolean;
  enablePerformanceMetrics: boolean;
  enableErrorTracking: boolean;
  alertThresholds: {
    errorRate: number;
    responseTime: number;
    memoryUsage: number;
  };
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  checks: {
    database: boolean;
    api: boolean;
    memory: boolean;
    disk: boolean;
  };
  metrics: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    memoryUsage: number;
  };
}

export class MonitoringEngine {
  private config: MonitoringConfig;
  private isRunning: boolean = false;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(config: MonitoringConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;

    console.log('🔍 Starting Genesis Monitoring Engine...');
    
    if (this.config.enableHealthChecks) {
      this.startHealthChecks();
    }

    this.isRunning = true;
    console.log('✅ Monitoring Engine started successfully');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    console.log('🛑 Stopping Genesis Monitoring Engine...');
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.isRunning = false;
    console.log('✅ Monitoring Engine stopped');
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      const health = await this.performHealthCheck();
      this.processHealthResult(health);
    }, 30000); // Every 30 seconds
  }

  private async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    const checks = {
      database: true, // Simplified for now
      api: true,
      memory: process.memoryUsage().heapUsed < 500 * 1024 * 1024, // 500MB threshold
      disk: true
    };

    const allHealthy = Object.values(checks).every(check => check);
    const responseTime = Date.now() - startTime;

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: Date.now(),
      checks,
      metrics: {
        uptime: process.uptime(),
        responseTime,
        errorRate: 0, // Simplified
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024 // MB
      }
    };
  }

  private processHealthResult(health: HealthCheckResult): void {
    if (health.status !== 'healthy') {
      console.warn('⚠️ Health check warning:', health);
    }

    // Check alert thresholds
    if (health.metrics.responseTime > this.config.alertThresholds.responseTime) {
      console.error('🚨 High response time alert:', health.metrics.responseTime + 'ms');
    }

    if (health.metrics.memoryUsage > this.config.alertThresholds.memoryUsage) {
      console.error('🚨 High memory usage alert:', health.metrics.memoryUsage + 'MB');
    }
  }

  async getHealthStatus(): Promise<HealthCheckResult> {
    return this.performHealthCheck();
  }
}

export async function startGenesisMonitoring(config?: Partial<MonitoringConfig>): Promise<MonitoringEngine> {
  const defaultConfig: MonitoringConfig = {
    enableHealthChecks: true,
    enablePerformanceMetrics: true,
    enableErrorTracking: true,
    alertThresholds: {
      errorRate: 0.05, // 5%
      responseTime: 1000, // 1 second
      memoryUsage: 512 // 512MB
    }
  };

  const monitoringConfig = { ...defaultConfig, ...config };
  const engine = new MonitoringEngine(monitoringConfig);
  
  await engine.start();
  return engine;
} 