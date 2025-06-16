/**
 * 🤖 MCP AGENT BASE CLASS
 * Foundational class for all Multi-Agent System components
 * 
 * Provides:
 * - Common agent lifecycle management
 * - Inter-agent communication protocols
 * - Health monitoring and diagnostics
 * - Error handling and logging
 */

export abstract class MCPAgent {
  protected agentId: string = '';
  protected version: string = '1.0.0';
  protected capabilities: string[] = [];
  protected isInitialized: boolean = false;
  protected lastHealthCheck: Date | null = null;

  constructor() {
    // Base constructor - specific agents will override
  }

  /**
   * Initialize the agent with configuration and dependencies
   */
  protected initialize(): void {
    console.log(`🤖 MCPAgent: Initializing ${this.agentId} v${this.version}`);
    this.isInitialized = true;
    this.lastHealthCheck = new Date();
  }

  /**
   * Get agent metadata and current status
   */
  getAgentInfo() {
    return {
      agentId: this.agentId,
      version: this.version,
      capabilities: this.capabilities,
      isInitialized: this.isInitialized,
      lastHealthCheck: this.lastHealthCheck
    };
  }

  /**
   * Abstract method for agent-specific health checks
   */
  abstract performHealthCheck(): Promise<boolean>;

  /**
   * Common error handling for all agents
   */
  protected handleError(error: unknown, context: string): Error {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ ${this.agentId}: ${context} - ${message}`);
    return new Error(`${context}: ${message}`);
  }

  /**
   * Log agent activity with structured format
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      agentId: this.agentId,
      level,
      message,
      data
    };

    console.log(`${level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️'} ${this.agentId}: ${message}`, data || '');
  }
} 