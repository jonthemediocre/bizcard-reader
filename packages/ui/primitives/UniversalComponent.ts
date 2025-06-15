/**
 * @file UniversalComponent.ts
 * @description Universal Component System for cross-platform UI primitives
 * @version 6.0
 * @audit-note Core universal component system for Genesis
 * @rule-source .cursor/rules/L1-constitution.mdc
 * @symbolic-id universal-component-core
 */

import { MCPTool } from '../../../src/core/mcp/MCPWrapper';
import type { Platform } from '../../../src/core/genesis/types';

// Core interfaces for Universal Components
export interface ComponentPrimitive {
  props: Record<string, any>;
  behaviors: BehaviorMap;
  accessibility: A11ySpec;
  testable: TestInterface;
}

export interface BehaviorMap {
  [behavior: string]: BehaviorDefinition;
}

export interface BehaviorDefinition {
  trigger: string;
  action: string;
  validation: string;
}

export interface A11ySpec {
  role: string;
  ariaLabels: string[];
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
}

export interface TestInterface {
  testId: string;
  selectors: string[];
  interactions: string[];
}

/**
 * Base Universal Component Class
 * All UI components must extend this to ensure cross-platform compatibility
 */
export abstract class UniversalComponent<TProps = any> {
  abstract id: string;
  abstract name: string;
  abstract primitive: ComponentPrimitive;
  abstract platforms: Platform[];

  /**
   * Generate platform-specific implementations
   */
  abstract generateImplementations(): Promise<{
    web: string;
    mobile: string;
    desktop: string;
  }>;

  /**
   * Validate component against L1 mandates
   */
  async validateL1Compliance(): Promise<{
    isCompliant: boolean;
    violations: string[];
    score: number;
  }> {
    const violations: string[] = [];

    // Check universal primitive requirement
    if (!this.primitive) {
      violations.push("Component missing universal primitive definition");
    }

    // Check accessibility compliance
    if (!this.primitive.accessibility || !this.primitive.accessibility.role) {
      violations.push("Component missing accessibility specifications");
    }

    // Check testability
    if (!this.primitive.testable || !this.primitive.testable.testId) {
      violations.push("Component missing testability interface");
    }

    // Check cross-platform support
    if (!this.platforms || this.platforms.length < 3) {
      violations.push("Component must support all platforms (web, mobile, desktop)");
    }

    const isCompliant = violations.length === 0;
    const score = isCompliant ? 1.0 : Math.max(0, 1 - (violations.length * 0.25));

    return {
      isCompliant,
      violations,
      score
    };
  }

  /**
   * Generate tests for all platform implementations
   */
  async generateTests(): Promise<{
    unit: string[];
    integration: string[];
    e2e: string[];
    accessibility: string[];
  }> {
    return {
      unit: await this.generateUnitTests(),
      integration: await this.generateIntegrationTests(),
      e2e: await this.generateE2ETests(),
      accessibility: await this.generateA11yTests()
    };
  }

  // Abstract methods that must be implemented by concrete components
  protected abstract generateUnitTests(): Promise<string[]>;
  protected abstract generateIntegrationTests(): Promise<string[]>;
  protected abstract generateE2ETests(): Promise<string[]>;
  protected abstract generateA11yTests(): Promise<string[]>;
}

/**
 * Universal Component Registry
 */
export class UniversalComponentRegistry {
  private static instance: UniversalComponentRegistry;
  private components = new Map<string, UniversalComponent>();
  private implementations = new Map<string, Map<Platform, string>>();

  private constructor() {}

  static getInstance(): UniversalComponentRegistry {
    if (!UniversalComponentRegistry.instance) {
      UniversalComponentRegistry.instance = new UniversalComponentRegistry();
    }
    return UniversalComponentRegistry.instance;
  }

  async register(component: UniversalComponent): Promise<{
    success: boolean;
    componentId: string;
    violations: string[];
  }> {
    const validation = await component.validateL1Compliance();
    
    if (!validation.isCompliant) {
      return {
        success: false,
        componentId: component.id,
        violations: validation.violations
      };
    }

    const implementations = await component.generateImplementations();
    
    this.components.set(component.id, component);
    this.implementations.set(component.id, new Map([
      ['web', implementations.web],
      ['mobile', implementations.mobile],
      ['desktop', implementations.desktop]
    ]));

    return {
      success: true,
      componentId: component.id,
      violations: []
    };
  }

  getImplementation(componentId: string, platform: Platform): string | null {
    const implementations = this.implementations.get(componentId);
    return implementations?.get(platform) || null;
  }
}

// Export the registry instance
export const componentRegistry = UniversalComponentRegistry.getInstance(); 