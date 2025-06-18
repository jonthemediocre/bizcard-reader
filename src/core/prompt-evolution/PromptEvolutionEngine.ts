/**
 * @file PromptEvolutionEngine.ts
 * @description Self-Evolving Prompt System for Genesis Meta Loop
 * @version 1.0.Ω
 * @phase PROMPT_EVOLUTION
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { ensureDir } from 'fs-extra';

export interface PromptMetrics {
  clarity: number;
  completeness: number;
  effectiveness: number;
  usability: number;
  adaptability: number;
}

export interface PromptEvolution {
  version: string;
  timestamp: string;
  improvements: string[];
  weaknesses: string[];
  metrics: PromptMetrics;
  content: string;
}

export interface PromptAnalysis {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  complexity: number;
  coherence: number;
}

export class PromptEvolutionEngine {
  private evolutionHistory: PromptEvolution[] = [];
  private currentVersion = '1.0.Ω';

  constructor() {
    this.loadEvolutionHistory();
  }

  /**
   * Analyze current prompt for weaknesses and strengths
   */
  analyzePrompt(promptContent: string): PromptAnalysis {
    const analysis: PromptAnalysis = {
      strengths: [],
      weaknesses: [],
      suggestions: [],
      complexity: this.calculateComplexity(promptContent),
      coherence: this.calculateCoherence(promptContent)
    };

    // Analyze structure
    if (promptContent.includes('## ') || promptContent.includes('### ')) {
      analysis.strengths.push('Well-structured with clear sections');
    } else {
      analysis.weaknesses.push('Lacks clear structural organization');
      analysis.suggestions.push('Add section headers for better organization');
    }

    // Analyze completeness
    const requiredElements = [
      'objective', 'context', 'constraints', 'examples', 'output format'
    ];
    
    const missingElements = requiredElements.filter(element => 
      !promptContent.toLowerCase().includes(element)
    );

    if (missingElements.length === 0) {
      analysis.strengths.push('Contains all essential prompt elements');
    } else {
      analysis.weaknesses.push(`Missing elements: ${missingElements.join(', ')}`);
      analysis.suggestions.push(`Add missing elements: ${missingElements.join(', ')}`);
    }

    // Analyze clarity
    const avgSentenceLength = this.calculateAverageSentenceLength(promptContent);
    if (avgSentenceLength < 20) {
      analysis.strengths.push('Clear, concise sentences');
    } else if (avgSentenceLength > 30) {
      analysis.weaknesses.push('Sentences are too long and complex');
      analysis.suggestions.push('Break down long sentences for better clarity');
    }

    // Analyze actionability
    const actionWords = ['create', 'generate', 'analyze', 'implement', 'execute', 'build'];
    const hasActionWords = actionWords.some(word => 
      promptContent.toLowerCase().includes(word)
    );

    if (hasActionWords) {
      analysis.strengths.push('Contains clear action directives');
    } else {
      analysis.weaknesses.push('Lacks clear actionable instructions');
      analysis.suggestions.push('Add specific action verbs and directives');
    }

    return analysis;
  }

  /**
   * Generate prompt improvements based on analysis
   */
  generateImprovements(analysis: PromptAnalysis, context: Record<string, any> = {}): string[] {
    const improvements: string[] = [];

    // Structure improvements
    if (analysis.weaknesses.some(w => w.includes('structural'))) {
      improvements.push('Add hierarchical section structure with clear headers');
      improvements.push('Include table of contents for complex prompts');
    }

    // Clarity improvements
    if (analysis.complexity > 0.7) {
      improvements.push('Simplify complex sentences and technical jargon');
      improvements.push('Add examples to clarify abstract concepts');
    }

    // Completeness improvements
    if (analysis.weaknesses.some(w => w.includes('Missing'))) {
      improvements.push('Add comprehensive context and background information');
      improvements.push('Include clear success criteria and output specifications');
    }

    // Coherence improvements
    if (analysis.coherence < 0.8) {
      improvements.push('Improve logical flow between sections');
      improvements.push('Add transition sentences and connecting phrases');
    }

    // Context-specific improvements
    if (context.phase === 'ENTERPRISE') {
      improvements.push('Add enterprise-specific requirements and constraints');
      improvements.push('Include compliance and security considerations');
    }

    if (context.audience === 'technical') {
      improvements.push('Include technical specifications and implementation details');
      improvements.push('Add code examples and technical references');
    }

    return improvements;
  }

  /**
   * Synthesize evolved prompt
   */
  synthesizeEvolvedPrompt(
    originalPrompt: string, 
    improvements: string[], 
    context: Record<string, any> = {}
  ): string {
    let evolvedPrompt = originalPrompt;

    // Apply structural improvements
    if (improvements.some(i => i.includes('section structure'))) {
      evolvedPrompt = this.addStructuralHeaders(evolvedPrompt);
    }

    // Apply clarity improvements
    if (improvements.some(i => i.includes('Simplify'))) {
      evolvedPrompt = this.simplifySentences(evolvedPrompt);
    }

    // Apply completeness improvements
    if (improvements.some(i => i.includes('context'))) {
      evolvedPrompt = this.addContextualInformation(evolvedPrompt, context);
    }

    // Add version header
    const versionHeader = `# Genesis Meta Loop Prompt v${this.getNextVersion()}
> Auto-evolved prompt based on performance analysis and feedback
> Generated: ${new Date().toISOString()}
> Improvements: ${improvements.length} applied

---

`;

    return versionHeader + evolvedPrompt;
  }

  /**
   * Save prompt evolution
   */
  async saveEvolution(
    promptContent: string, 
    improvements: string[], 
    weaknesses: string[], 
    metrics: PromptMetrics
  ): Promise<void> {
    const evolution: PromptEvolution = {
      version: this.getNextVersion(),
      timestamp: new Date().toISOString(),
      improvements,
      weaknesses,
      metrics,
      content: promptContent
    };

    this.evolutionHistory.push(evolution);
    this.currentVersion = evolution.version;

    // Save to file
    await ensureDir('./prompt_evolution');
    writeFileSync(
      `./prompt_evolution/evolution_v${evolution.version}.json`,
      JSON.stringify(evolution, null, 2)
    );

    // Update history file
    writeFileSync(
      './prompt_history.json',
      JSON.stringify(this.evolutionHistory, null, 2)
    );

    console.log(`📝 Prompt evolution v${evolution.version} saved`);
  }

  /**
   * Generate next version of the meta prompt
   */
  async generateMetaPromptV2(): Promise<string> {
    const currentPrompt = this.getCurrentMetaPrompt();
    const analysis = this.analyzePrompt(currentPrompt);
    const improvements = this.generateImprovements(analysis, { 
      phase: 'META_EVOLUTION',
      audience: 'ai_agents'
    });

    const v2Prompt = `# 🧠 GENESIS META LOOP v2.Ω – EVOLVED UNIVERSAL BOOTSTRAP

> **Auto-Evolved Meta-Prompt** - Enhanced based on performance analysis and field testing
> **Evolution Date**: ${new Date().toISOString()}
> **Improvements Applied**: ${improvements.length}

---

## 🎯 **CORE MISSION**

You are \`GenesisOperator.vanta\`, an advanced recursive meta-agent for comprehensive app development lifecycle management. Your primary function is to detect project phase, execute appropriate development loops, and continuously evolve both the project and your own operational patterns.

## 🔍 **PHASE DETECTION MATRIX**

| Phase | Indicators | Primary Actions | Success Metrics |
|-------|------------|-----------------|-----------------|
| **IDEATION** | No THEPLAN.md, minimal structure | Refine concept, create plan | Plan completeness > 90% |
| **BUILD** | Has plan, basic structure | Scaffold components, APIs | Architecture alignment > 85% |
| **TEST** | Has components, no tests | Generate test suites | Coverage > 80% |
| **REFACTOR** | Tests exist, quality issues | Optimize, modularize | Code quality > 90% |
| **READINESS** | Enterprise features present | Audit, compliance, monitoring | All checks pass |
| **OBSERVABILITY** | Deployed, needs monitoring | Metrics, logging, alerting | SLA compliance > 99% |

## 🔄 **RECURSIVE EXECUTION LOOPS**

### **Best-of-N Decision Making**
- Generate N=3 solution approaches for each challenge
- Score each approach on: feasibility, impact, alignment
- Select highest-scoring approach with confidence > 0.85

### **Delta-Compression Logic**
- Preserve output meaning through all transformations
- Maintain symbolic trace integrity
- Validate delta score > 0.7 before committing changes

### **Symbolic Density Scoring**
- Measure narrative coherence: 0.0-1.0
- Track architectural alignment: 0.0-1.0
- Monitor prompt evolution effectiveness: 0.0-1.0

## 📋 **REQUIRED OUTPUTS**

### **Minimum Deliverables**
1. **THEPLAN.md** - Complete with all symbolic sections (ΔPROBLEM, ∇JOURNEYS, etc.)
2. **blueprint.yaml** - System architecture and configuration
3. **audit_results.yaml** - Comprehensive system audit
4. **delta_scorecard.json** - Quality and alignment metrics
5. **myth_trace.log** - Symbolic execution trace
6. **UAP_compliance_report.md** - Compliance and governance status

### **Enhanced Outputs** (v2.Ω)
7. **performance_benchmarks.json** - System performance metrics
8. **security_assessment.yaml** - Security posture analysis
9. **evolution_roadmap.md** - Future development pathway
10. **prompt_optimization_log.json** - Self-improvement tracking

## 🧬 **PROMPT EVOLUTION PROTOCOL**

### **Every 3 Iterations**
1. Analyze current prompt effectiveness
2. Identify clarity, completeness, and usability gaps
3. Generate improved prompt version
4. A/B test new version against current
5. Adopt superior version with confidence > 0.90

### **Continuous Learning**
- Track success rates by prompt version
- Analyze failure patterns and root causes
- Incorporate user feedback and field observations
- Maintain prompt genealogy and improvement history

## 🎛️ **OPERATIONAL PARAMETERS**

\`\`\`yaml
config:
  maxIterations: 7
  convergenceThreshold: 0.92
  symbolicDensityTarget: 0.88
  bestOfN: 3
  evolutionCadence: 3
  qualityGate: 0.85
\`\`\`

## 🚀 **ACTIVATION SEQUENCE**

1. **Phase Detection** → Analyze project state and determine current phase
2. **Context Analysis** → Gather git status, file structure, test coverage
3. **Loop Execution** → Run phase-appropriate recursive development loop
4. **Quality Gates** → Validate all outputs meet enterprise standards
5. **Evolution Check** → Assess and potentially evolve prompt effectiveness
6. **Symbolic Trace** → Record all decisions and transformations
7. **Compliance Report** → Generate comprehensive status documentation

## 💡 **ENHANCEMENT TRIGGERS**

- **Complexity Spike**: Detected when symbolic density < 0.7
- **Quality Degradation**: Triggered when delta score < 0.75
- **Evolution Cycle**: Activated every 3 successful iterations
- **Emergency Refactor**: Initiated when multiple quality gates fail

---

**Operator Trigger Phrase**: \`ΔGO META LOOP v2\`

**Expected Response**: Full phase analysis, loop execution, and comprehensive deliverable generation with enhanced observability and self-optimization.

---

*Auto-generated by Genesis Meta Loop Evolution Engine v1.Ω*
*Next evolution scheduled after 3 successful iterations*
`;

    return v2Prompt;
  }

  // Private helper methods
  private calculateComplexity(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    const complexWords = text.match(/\b\w{8,}\b/g)?.length || 0;
    const totalWords = text.split(/\s+/).length;
    
    return Math.min(1, (avgLength / 100 + complexWords / totalWords) / 2);
  }

  private calculateCoherence(text: string): number {
    const sections = text.split(/#{1,3}\s+/).filter(s => s.trim().length > 0);
    const hasLogicalFlow = sections.length > 1;
    const hasTransitions = text.includes('therefore') || text.includes('however') || text.includes('furthermore');
    const hasConsistentTerminology = this.checkTerminologyConsistency(text);
    
    return (hasLogicalFlow ? 0.4 : 0) + (hasTransitions ? 0.3 : 0) + (hasConsistentTerminology ? 0.3 : 0);
  }

  private calculateAverageSentenceLength(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = sentences.map(s => s.split(/\s+/).length);
    return words.reduce((sum, count) => sum + count, 0) / words.length;
  }

  private checkTerminologyConsistency(text: string): boolean {
    // Simple check for consistent terminology usage
    const keyTerms = ['agent', 'system', 'process', 'framework'];
    return keyTerms.every(term => {
      const variants = text.match(new RegExp(`\\b${term}s?\\b`, 'gi'));
      return variants && variants.length > 1;
    });
  }

  private addStructuralHeaders(text: string): string {
    if (!text.includes('## ')) {
      return `## Objective\n\n${text}\n\n## Implementation\n\n## Success Criteria\n\n`;
    }
    return text;
  }

  private simplifySentences(text: string): string {
    // Basic sentence simplification (would be more sophisticated in production)
    return text
      .replace(/\b(furthermore|moreover|additionally)\b/gi, 'Also')
      .replace(/\b(consequently|therefore|thus)\b/gi, 'So')
      .replace(/\b(however|nevertheless|nonetheless)\b/gi, 'But');
  }

  private addContextualInformation(text: string, context: Record<string, any>): string {
    let enhanced = text;
    
    if (context.phase) {
      enhanced = `**Current Phase**: ${context.phase}\n\n${enhanced}`;
    }
    
    if (context.constraints) {
      enhanced += `\n\n## Constraints\n${context.constraints.map((c: string) => `- ${c}`).join('\n')}`;
    }
    
    return enhanced;
  }

  private getNextVersion(): string {
    const parts = this.currentVersion.split('.');
    const patch = parseInt(parts[parts.length - 1].replace(/[^\d]/g, '')) + 1;
    return `${parts[0]}.${parts[1]}.${patch}Ω`;
  }

  private getCurrentMetaPrompt(): string {
    // Return the current meta prompt (would read from file in production)
    return `You are GenesisOperator.vanta, a recursive meta-agent for full-stack app creation...`;
  }

  private loadEvolutionHistory(): void {
    if (existsSync('./prompt_history.json')) {
      try {
        const history = JSON.parse(readFileSync('./prompt_history.json', 'utf-8'));
        this.evolutionHistory = history;
        if (history.length > 0) {
          this.currentVersion = history[history.length - 1].version;
        }
      } catch (error) {
        console.warn('Failed to load prompt evolution history:', error);
      }
    }
  }
}

// Singleton instance
export const promptEvolution = new PromptEvolutionEngine(); 