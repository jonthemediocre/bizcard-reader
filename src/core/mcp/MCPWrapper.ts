/**
 * @file MCPWrapper.ts
 * @description MCP (Model Context Protocol) wrapper system for agentic functions
 * @version 2.3
 * @audit-note Core MCP implementation for DominoAuditEngine.v2
 * @rule-source .cursor/rules/GLOBAL.md
 * @symbolic-id mcp-wrapper-core
 */

import { logger } from '../../services/logger';

// Core MCP Types
export interface MCPFunction<TInput = any, TOutput = any> {
  name: string;
  description: string;
  inputSchema: string;
  outputSchema: string;
  handler: (input: TInput) => Promise<TOutput>;
  metadata: MCPMetadata;
}

export interface MCPMetadata {
  agentId: string;
  version: string;
  capabilities: string[];
  performanceMetrics: PerformanceMetrics;
  lastUpdated: string;
  status: 'active' | 'inactive' | 'deprecated';
}

export interface PerformanceMetrics {
  callCount: number;
  averageExecutionTime: number;
  errorRate: number;
  lastError?: string;
  successRate: number;
}

export interface MCPCallContext {
  callId: string;
  timestamp: string;
  agentId: string;
  functionName: string;
  input: any;
  metadata?: Record<string, any>;
}

export interface MCPCallResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  executionTime: number;
  callId: string;
  metadata: Record<string, any>;
}

/**
 * MCP Function Registry - Central registry for all MCP-wrapped functions
 */
class MCPRegistry {
  private static instance: MCPRegistry;
  private functions = new Map<string, MCPFunction>();
  private callHistory: MCPCallContext[] = [];
  private readonly MAX_HISTORY = 1000;

  private constructor() {}

  static getInstance(): MCPRegistry {
    if (!MCPRegistry.instance) {
      MCPRegistry.instance = new MCPRegistry();
    }
    return MCPRegistry.instance;
  }

  /**
   * Register an MCP function
   */
  register<TInput, TOutput>(func: MCPFunction<TInput, TOutput>): void {
    const key = `${func.metadata.agentId}.${func.name}`;
    this.functions.set(key, func);
    
    logger.info('MCP function registered', {
      functionKey: key,
      agentId: func.metadata.agentId,
      capabilities: func.metadata.capabilities
    });
  }

  /**
   * Get registered function
   */
  get(agentId: string, functionName: string): MCPFunction | undefined {
    const key = `${agentId}.${functionName}`;
    return this.functions.get(key);
  }

  /**
   * List all registered functions
   */
  list(): MCPFunction[] {
    return Array.from(this.functions.values());
  }

  /**
   * Get functions by agent
   */
  getByAgent(agentId: string): MCPFunction[] {
    return Array.from(this.functions.values())
      .filter(func => func.metadata.agentId === agentId);
  }

  /**
   * Add call to history
   */
  addCallHistory(context: MCPCallContext): void {
    this.callHistory.unshift(context);
    if (this.callHistory.length > this.MAX_HISTORY) {
      this.callHistory.pop();
    }
  }

  /**
   * Get call history
   */
  getCallHistory(agentId?: string): MCPCallContext[] {
    if (agentId) {
      return this.callHistory.filter(call => call.agentId === agentId);
    }
    return [...this.callHistory];
  }

  /**
   * Get performance metrics for a function
   */
  getMetrics(agentId: string, functionName: string): PerformanceMetrics | undefined {
    const func = this.get(agentId, functionName);
    return func?.metadata.performanceMetrics;
  }

  /**
   * Update performance metrics
   */
  updateMetrics(agentId: string, functionName: string, executionTime: number, success: boolean, error?: string): void {
    const func = this.get(agentId, functionName);
    if (!func) return;

    const metrics = func.metadata.performanceMetrics;
    metrics.callCount++;
    metrics.averageExecutionTime = (metrics.averageExecutionTime * (metrics.callCount - 1) + executionTime) / metrics.callCount;
    
    if (success) {
      metrics.successRate = (metrics.successRate * (metrics.callCount - 1) + 1) / metrics.callCount;
    } else {
      metrics.errorRate = (metrics.errorRate * (metrics.callCount - 1) + 1) / metrics.callCount;
      metrics.lastError = error;
    }
  }
}

/**
 * MCP Tool Wrapper - Main wrapper function for creating MCP tools
 */
export function MCPTool<TInput, TOutput>(
  name: string,
  handler: (input: TInput) => Promise<TOutput>,
  options: {
    agentId: string;
    description: string;
    inputSchema: string;
    outputSchema: string;
    capabilities?: string[];
    version?: string;
  }
): MCPFunction<TInput, TOutput> {
  const mcpFunction: MCPFunction<TInput, TOutput> = {
    name,
    description: options.description,
    inputSchema: options.inputSchema,
    outputSchema: options.outputSchema,
    handler: createInstrumentedHandler(handler, options.agentId, name),
    metadata: {
      agentId: options.agentId,
      version: options.version || '1.0.0',
      capabilities: options.capabilities || [],
      performanceMetrics: {
        callCount: 0,
        averageExecutionTime: 0,
        errorRate: 0,
        successRate: 0
      },
      lastUpdated: new Date().toISOString(),
      status: 'active'
    }
  };

  // Register the function
  MCPRegistry.getInstance().register(mcpFunction);

  return mcpFunction;
}

/**
 * Create instrumented handler with performance monitoring
 */
function createInstrumentedHandler<TInput, TOutput>(
  originalHandler: (input: TInput) => Promise<TOutput>,
  agentId: string,
  functionName: string
): (input: TInput) => Promise<TOutput> {
  return async (input: TInput): Promise<TOutput> => {
    const callId = generateCallId();
    const startTime = Date.now();
    const registry = MCPRegistry.getInstance();

    // Create call context
    const context: MCPCallContext = {
      callId,
      timestamp: new Date().toISOString(),
      agentId,
      functionName,
      input,
      metadata: {
        startTime
      }
    };

    registry.addCallHistory(context);

    try {
      logger.info('MCP function call started', {
        callId,
        agentId,
        functionName,
        inputType: typeof input
      });

      const result = await originalHandler(input);
      const executionTime = Date.now() - startTime;

      // Update metrics
      registry.updateMetrics(agentId, functionName, executionTime, true);

      logger.info('MCP function call completed', {
        callId,
        agentId,
        functionName,
        executionTime,
        success: true
      });

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Update metrics
      registry.updateMetrics(agentId, functionName, executionTime, false, errorMessage);

      logger.error('MCP function call failed', {
        callId,
        agentId,
        functionName,
        executionTime,
        error: errorMessage
      }, error);

      throw error;
    }
  };
}

/**
 * MCP Call - Execute an MCP function by agent and function name
 */
export async function MCPCall<TInput, TOutput>(
  agentId: string,
  functionName: string,
  input: TInput
): Promise<MCPCallResult<TOutput>> {
  const callId = generateCallId();
  const startTime = Date.now();
  const registry = MCPRegistry.getInstance();

  try {
    const func = registry.get(agentId, functionName);
    if (!func) {
      throw new Error(`MCP function not found: ${agentId}.${functionName}`);
    }

    const result = await func.handler(input);
    const executionTime = Date.now() - startTime;

    return {
      success: true,
      data: result,
      executionTime,
      callId,
      metadata: {
        agentId,
        functionName,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      error: errorMessage,
      executionTime,
      callId,
      metadata: {
        agentId,
        functionName,
        timestamp: new Date().toISOString(),
        error: errorMessage
      }
    };
  }
}

/**
 * Generate unique call ID
 */
function generateCallId(): string {
  return `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get MCP Registry instance (for external access)
 */
export function getMCPRegistry(): MCPRegistry {
  return MCPRegistry.getInstance();
}

/**
 * MCP Health Check - Check status of all registered functions
 */
export interface MCPHealthStatus {
  totalFunctions: number;
  activeFunctions: number;
  inactiveFunctions: number;
  averageSuccessRate: number;
  totalCalls: number;
  agents: {
    [agentId: string]: {
      functionCount: number;
      successRate: number;
      totalCalls: number;
    };
  };
}

export function getMCPHealthStatus(): MCPHealthStatus {
  const registry = MCPRegistry.getInstance();
  const functions = registry.list();
  
  const status: MCPHealthStatus = {
    totalFunctions: functions.length,
    activeFunctions: functions.filter(f => f.metadata.status === 'active').length,
    inactiveFunctions: functions.filter(f => f.metadata.status !== 'active').length,
    averageSuccessRate: 0,
    totalCalls: 0,
    agents: {}
  };

  // Calculate aggregate metrics
  let totalSuccessRate = 0;
  let totalCalls = 0;

  functions.forEach(func => {
    const metrics = func.metadata.performanceMetrics;
    totalSuccessRate += metrics.successRate * metrics.callCount;
    totalCalls += metrics.callCount;

    // Agent-specific metrics
    const agentId = func.metadata.agentId;
    if (!status.agents[agentId]) {
      status.agents[agentId] = {
        functionCount: 0,
        successRate: 0,
        totalCalls: 0
      };
    }

    status.agents[agentId].functionCount++;
    status.agents[agentId].successRate += metrics.successRate;
    status.agents[agentId].totalCalls += metrics.callCount;
  });

  status.averageSuccessRate = totalCalls > 0 ? totalSuccessRate / totalCalls : 0;
  status.totalCalls = totalCalls;

  // Average success rates per agent
  Object.keys(status.agents).forEach(agentId => {
    const agent = status.agents[agentId];
    agent.successRate = agent.functionCount > 0 ? agent.successRate / agent.functionCount : 0;
  });

  return status;
} 