/**
 * @file types.ts
 * @description Type definitions for GenesisAuditEngine.v6.Ω
 * @version 6.0
 * @audit-note Core types for Genesis recursive system
 * @rule-source .cursor/rules/GLOBAL.md
 * @symbolic-id genesis-types-core
 */

// Core Genesis Types
export interface RecursivePhase {
  1: "ANALYZE";
  2: "GOVERN";
  3: "GENERATE";
  4: "REFACTOR";
  5: "AUDIT";
  6: "EVOLVE";
  7: "REPEAT";
}

export interface LoopConfig {
  maxIterations: number;
  targetEntropy: number;
  convergenceThreshold: number;
  mythicMode: boolean;
  platforms: Platform[];
  enableEvolution: boolean;
  learningRate?: number;
}

export type Platform = 'web' | 'mobile' | 'desktop';

export interface EnvironmentConfig {
  environment: 'development' | 'staging' | 'production';
}

// Analysis Phase Types
export interface AnalysisResult {
  patterns: Pattern[];
  debt: TechnicalDebt;
  architecture: ArchitectureAnalysis;
  dependencies: DependencyAnalysis;
  security: SecurityAnalysis;
  performance: PerformanceAnalysis;
  accessibility: AccessibilityAnalysis;
  testCoverage: TestCoverageAnalysis;
  codeMetrics: CodeMetrics;
  duplications: Duplication[];
  antiPatterns: AntiPattern[];
  timestamp: string;
}

export interface Pattern {
  id: string;
  name: string;
  type: 'design' | 'architectural' | 'code' | 'anti';
  frequency: number;
  locations: CodeLocation[];
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  description: string;
}

export interface TechnicalDebt {
  score: number;
  issues: DebtIssue[];
  categories: {
    [category: string]: number;
  };
  estimatedHours: number;
}

export interface DebtIssue {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  file: string;
  line: number;
  description: string;
  estimatedHours: number;
}

export interface ArchitectureAnalysis {
  type: string;
  patterns: string[];
  layers: ArchitectureLayer[];
  dependencies: ArchitectureDependency[];
  violations: ArchitectureViolation[];
}

export interface ArchitectureLayer {
  name: string;
  components: string[];
  responsibilities: string[];
}

export interface ArchitectureDependency {
  from: string;
  to: string;
  type: 'allowed' | 'violation' | 'circular';
}

export interface ArchitectureViolation {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  locations: CodeLocation[];
}

export interface DependencyAnalysis {
  count: number;
  vulnerabilities: Vulnerability[];
  outdated: OutdatedDependency[];
  unused: string[];
  circular: CircularDependency[];
}

export interface Vulnerability {
  package: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  fixAvailable: boolean;
}

export interface OutdatedDependency {
  package: string;
  current: string;
  latest: string;
  breaking: boolean;
}

export interface CircularDependency {
  cycle: string[];
  impact: 'low' | 'medium' | 'high';
}

export interface SecurityAnalysis {
  issues: SecurityIssue[];
  score: number;
  categories: {
    [category: string]: number;
  };
}

export interface SecurityIssue {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  file: string;
  line: number;
  recommendation: string;
}

export interface PerformanceAnalysis {
  score: number;
  bottlenecks: PerformanceBottleneck[];
  metrics: PerformanceMetrics;
}

export interface PerformanceBottleneck {
  type: string;
  location: CodeLocation;
  impact: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface PerformanceMetrics {
  bundleSize: number;
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
}

export interface AccessibilityAnalysis {
  score: number;
  issues: AccessibilityIssue[];
  compliance: {
    wcag21AA: number;
    wcag21AAA: number;
  };
}

export interface AccessibilityIssue {
  type: string;
  severity: 'low' | 'medium' | 'high';
  element: string;
  description: string;
  recommendation: string;
}

export interface TestCoverageAnalysis {
  percentage: number;
  missing: string[];
  categories: {
    unit: number;
    integration: number;
    e2e: number;
  };
}

export interface CodeMetrics {
  complexity: number;
  maintainability: number;
  linesOfCode: number;
  duplicatedLines: number;
  testability: number;
}

export interface Duplication {
  files: string[];
  lines: number;
  tokens: number;
  similarity: number;
}

export interface AntiPattern {
  name: string;
  type: string;
  locations: CodeLocation[];
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
}

export interface CodeLocation {
  file: string;
  startLine: number;
  endLine: number;
  startColumn?: number;
  endColumn?: number;
}

// Governance Phase Types
export interface GovernanceResult {
  L1_rules: L1Rules;
  L2_patterns: L2Pattern[];
  L3_implementations: L3Implementation[];
  violations: GovernanceViolation[];
  compliance_score: number;
  recommendations: string[];
  timestamp: string;
}

export interface L1Rules {
  compliance: number;
  violations: L1Violation[];
  mandates: L1Mandate[];
}

export interface L1Violation {
  rule: string;
  description: string;
  severity: 'critical' | 'high';
  locations: CodeLocation[];
}

export interface L1Mandate {
  id: string;
  description: string;
  enforced: boolean;
  compliance: number;
}

export interface L2Pattern {
  id: string;
  name: string;
  category: string;
  description: string;
  implementation: string;
  platforms: Platform[];
}

export interface L3Implementation {
  patternId: string;
  platform: Platform;
  implementation: string;
  compliance: number;
  customizations: string[];
}

export interface GovernanceViolation {
  level: 1 | 2 | 3;
  rule: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  locations: CodeLocation[];
  recommendation: string;
}

// Generation Phase Types
export interface GeneratedArtifacts {
  components: UniversalComponent[];
  agents: UAP31Agent[];
  mcpWrappers: MCPWrapper[];
  crossPlatformApps: CrossPlatformApp[];
  tests: GeneratedTest[];
  documentation: GeneratedDoc[];
  timestamp: string;
}

export interface UniversalComponent {
  id: string;
  name: string;
  primitive: ComponentPrimitive;
  implementations: {
    web: string;
    mobile: string;
    desktop: string;
  };
  tests: string[];
  documentation: string;
}

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

export interface UAP31Agent {
  id: string;
  name: string;
  version: string;
  capabilities: string[];
  endpoints: A2AEndpoint[];
  mcpFunctions: string[];
  governance: AgentGovernance;
  evolution: AgentEvolution;
}

export interface A2AEndpoint {
  path: string;
  method: string;
  description: string;
  schema: any;
}

export interface AgentGovernance {
  level: 2 | 3;
  rules: string[];
  parent?: string;
}

export interface AgentEvolution {
  canLearn: boolean;
  learningRate: number;
  proposeRuleUpdate: boolean;
}

export interface MCPWrapper {
  functionName: string;
  agentId: string;
  originalFunction: string;
  wrappedFunction: string;
  schema: MCPSchema;
}

export interface MCPSchema {
  input: any;
  output: any;
  description: string;
  capabilities: string[];
}

export interface CrossPlatformApp {
  platform: Platform;
  framework: string;
  structure: AppStructure;
  components: string[];
  services: string[];
}

export interface AppStructure {
  directories: string[];
  entryPoints: string[];
  configuration: Record<string, any>;
}

export interface GeneratedTest {
  type: 'unit' | 'integration' | 'e2e';
  file: string;
  coverage: string[];
  framework: string;
}

export interface GeneratedDoc {
  type: 'api' | 'user' | 'developer';
  file: string;
  format: 'md' | 'html' | 'pdf';
  sections: string[];
}

// Refactor Phase Types
export interface RefactorResult {
  deltaCollapseScore: number;
  entropyReduction: number;
  optimizations: Optimization[];
  codeChanges: CodeChange[];
  performanceImprovements: PerformanceImprovement[];
  maintainabilityScore: number;
  timestamp: string;
}

export interface Optimization {
  type: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  files: string[];
  metrics: OptimizationMetrics;
}

export interface OptimizationMetrics {
  linesReduced: number;
  complexityReduced: number;
  duplicationsRemoved: number;
  performanceGain: number;
}

export interface CodeChange {
  file: string;
  type: 'refactor' | 'optimize' | 'remove' | 'add';
  description: string;
  linesChanged: number;
  impact: 'low' | 'medium' | 'high';
}

export interface PerformanceImprovement {
  type: string;
  description: string;
  metric: string;
  before: number;
  after: number;
  improvement: number;
}

// Audit Phase Types
export interface AuditResult {
  metrics: ConvergenceMetrics;
  cotReasoning: string;
  securityAssessment: SecurityAssessment;
  performanceProfile: PerformanceProfile;
  qualityGates: QualityGates;
  learnings: Learning[];
  recommendations: string[];
  timestamp: string;
}

export interface ConvergenceMetrics {
  // Symbolic Health
  delta_collapse_score: number;
  entropy_reduction: number;
  narrative_alignment: number;
  
  // Governance Compliance
  L1_compliance: number;
  L2_coverage: number;
  L3_implementation: number;
  
  // Technical Quality
  mcp_coverage: number;
  a2a_connectivity: number;
  test_coverage: number;
  
  // Cross-Platform Consistency
  ui_consistency: number;
  behavior_parity: number;
  accessibility_score: number;
  
  // Cognitive & Security
  avg_cognitive_load: number;
  security_score: number;
  no_security_regression: boolean;
  
  // Overall
  overall_score: number;
}

export interface SecurityAssessment {
  score: number;
  issues: SecurityIssue[];
  compliance: SecurityCompliance;
  recommendations: string[];
}

export interface SecurityCompliance {
  owasp: number;
  gdpr: number;
  sox: number;
  custom: number;
}

export interface PerformanceProfile {
  score: number;
  metrics: PerformanceMetrics;
  bottlenecks: PerformanceBottleneck[];
  recommendations: string[];
}

export interface QualityGates {
  passed: number;
  total: number;
  gates: QualityGate[];
}

export interface QualityGate {
  name: string;
  passed: boolean;
  threshold: number;
  actual: number;
  critical: boolean;
}

export interface Learning {
  type: string;
  pattern: string;
  confidence: number;
  applicability: string[];
  recommendation: string;
}

// Evolution Phase Types
export interface EvolutionResult {
  ruleUpdates: RuleUpdate[];
  patternEvolution: PatternEvolution[];
  agentProposals: AgentProposal[];
  systemImprovements: SystemImprovement[];
  learningRate: number;
  timestamp: string;
}

export interface RuleUpdate {
  level: 2 | 3;
  rule: string;
  change: 'add' | 'modify' | 'remove';
  justification: string;
  confidence: number;
}

export interface PatternEvolution {
  patternId: string;
  evolution: string;
  impact: 'low' | 'medium' | 'high';
  platforms: Platform[];
}

export interface AgentProposal {
  agentId: string;
  proposal: string;
  type: 'rule' | 'pattern' | 'optimization';
  confidence: number;
  justification: string;
}

export interface SystemImprovement {
  type: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  priority: number;
}

// Final Result Types
export interface ConvergenceResult {
  converged: boolean;
  iterations: number;
  totalTime: number;
  finalMetrics: ConvergenceMetrics;
  artifacts: Artifact[];
  iterationResults: IterationResult[];
  projectPath: string;
}

export interface Artifact {
  type: string;
  path: string;
  description: string;
  platform?: Platform;
  size: number;
}

export interface IterationResult {
  iteration: number;
  analysis: AnalysisResult;
  governance: GovernanceResult;
  generated: GeneratedArtifacts;
  refactored: RefactorResult;
  audit: AuditResult;
  evolution: EvolutionResult;
  converged: boolean;
  timestamp: string;
}

// Deployment Types
export interface DeploymentConfig {
  platforms: Platform[];
  environment: EnvironmentConfig['environment'];
  buildOptions: BuildOptions;
  testOptions: TestOptions;
  deploymentOptions: DeploymentOptions;
}

export interface BuildOptions {
  optimize: boolean;
  minify: boolean;
  sourceMaps: boolean;
  treeshake: boolean;
}

export interface TestOptions {
  unit: boolean;
  integration: boolean;
  e2e: boolean;
  performance: boolean;
  accessibility: boolean;
  security: boolean;
}

export interface DeploymentOptions {
  rollback: boolean;
  monitoring: boolean;
  healthChecks: boolean;
  smokeTests: boolean;
}

export interface DeploymentResult {
  success: boolean;
  platforms: Platform[];
  environment: EnvironmentConfig['environment'];
  buildResults?: Record<Platform, BuildTarget>;
  testResults?: any;
  securityResults?: any;
  optimizationResults?: any;
  deploymentResults?: any;
  verificationResults?: any;
  metrics: DeploymentMetrics;
  timestamp: string;
  duration: number;
  error?: string;
}

export interface BuildTarget {
  platform: Platform;
  buildTime: number;
  bundleSize: number;
  outputPath: string;
  assets: string[];
  optimized: boolean;
  compressed: boolean;
  sourceMap: boolean;
}

export interface DeploymentMetrics {
  buildTime: number;
  deployTime: number;
  testTime: number;
  bundleSize: number;
  performanceScore: number;
  securityScore: number;
  accessibilityScore: number;
}

// Testing Types
export interface TestConfig {
  parallel: boolean;
  timeout: number;
  retries?: number;
  coverage?: CoverageConfig;
  suites: TestSuites;
}

export interface CoverageConfig {
  threshold: number;
  include: string[];
  exclude: string[];
}

export interface TestSuites {
  unit: boolean;
  integration: boolean;
  e2e: boolean;
  performance: boolean;
  accessibility: boolean;
  security: boolean;
  visual?: boolean;
  load?: boolean;
}

export interface TestResult {
  success: boolean;
  suites?: Record<string, TestSuite>;
  coverage?: CoverageReport;
  metrics: TestMetrics;
  timestamp: string;
  duration: number;
  recommendations?: string[];
  error?: string;
}

export interface TestSuite {
  name: string;
  type: string;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  coverage: number;
  duration: number;
  testCases: TestCase[];
  assertions: number;
}

export interface TestCase {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
}

export interface TestMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  coverage: number;
  duration: number;
  performance: number;
  accessibility: number;
  security: number;
}

export interface CoverageReport {
  overall: number;
  byType: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  byModule: Record<string, number>;
  uncoveredLines: string[];
  threshold: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  passed: boolean;
}

export interface AccessibilityReport {
  wcagLevel: 'A' | 'AA' | 'AAA';
  compliance: {
    levelA: number;
    levelAA: number;
    levelAAA: number;
  };
  violations: AccessibilityViolation[];
  warnings: AccessibilityWarning[];
  passes: number;
  inapplicable: number;
  score: number;
  duration: number;
}

export interface AccessibilityViolation {
  rule: string;
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  count: number;
  description: string;
}

export interface AccessibilityWarning {
  rule: string;
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  count: number;
  description: string;
}

export interface SecurityTestResult {
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  dependencyAudit: {
    total: number;
    vulnerable: number;
    outdated: number;
    deprecated: number;
  };
  codeAnalysis: {
    sqlInjection: number;
    xss: number;
    csrf: number;
    pathTraversal: number;
    codeInjection: number;
  };
  compliance: {
    owasp: number;
    gdpr: number;
    hipaa: number;
    sox: number;
  };
  score: number;
  duration: number;
}

// CI/CD Pipeline Types
export interface PipelineConfig {
  environment: EnvironmentConfig['environment'];
  platforms: Platform[];
  parallel: boolean;
  timeout: number;
  retries: number;
  notifications: NotificationConfig;
  artifacts: ArtifactConfig;
}

export interface NotificationConfig {
  onSuccess: boolean;
  onFailure: boolean;
  channels: string[];
}

export interface ArtifactConfig {
  retention: number;
  storage: string;
}

export interface PipelineResult {
  pipelineId: string;
  success: boolean;
  stages?: Record<string, any>;
  duration: number;
  timestamp: string;
  environment: EnvironmentConfig['environment'];
  artifacts?: string[];
  metrics?: any;
  error?: string;
}

export interface PipelineStage {
  name: string;
  description: string;
  executor: () => Promise<any>;
  qualityGates?: QualityGate[];
  continueOnFailure?: boolean;
}

// Monitoring Types
export interface MonitoringConfig {
  interval: number;
  retention: number;
  metrics: string[];
  alerts: AlertConfig;
  dashboard: DashboardConfig;
  dashboardUrl?: string;
}

export interface AlertConfig {
  enabled: boolean;
  channels: string[];
  escalation: boolean;
}

export interface DashboardConfig {
  enabled: boolean;
  port: number;
  auth: boolean;
}

export interface MonitoringResult {
  success: boolean;
  startTime: string;
  metrics?: any;
  healthStatus?: any;
  alerts?: any[];
  dashboardUrl?: string;
  error?: string;
}

export interface MetricData {
  timestamp: number;
  value: any;
  tags: Record<string, string>;
}

export interface AlertRule {
  name: string;
  condition: string;
  severity: 'info' | 'warning' | 'critical';
  description: string;
}

export interface HealthCheck {
  name: string;
  endpoint: string;
  timeout: number;
  interval: number;
}

export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    loadAverage: number[];
  };
  memory: {
    usage: number;
    total: number;
    available: number;
    cached: number;
  };
  disk: {
    usage: number;
    total: number;
    available: number;
    iops: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    errors: number;
  };
}

export interface BusinessMetrics {
  activeUsers: number;
  sessionsPerHour: number;
  conversionRate: number;
  revenue: {
    hourly: number;
    daily: number;
  };
  featureUsage: Record<string, number>;
} 