/**
 * @file genesis-execute.ts
 * @description Main execution script for GenesisAuditEngine.v6.Ω
 * @version 6.0
 * @audit-note Genesis execution entry point
 * @rule-source .cursor/rules/L1-constitution.mdc
 * @symbolic-id genesis-execute-main
 */

import { executeGenesisEngine } from './core/genesis/GenesisEngine';
import { logger } from './services/logger';
import type { LoopConfig, Artifact } from './core/genesis/types';

/**
 * Main Genesis execution function
 */
async function main() {
  console.log('🚀 GenesisAuditEngine.v6.Ω - ULTIMATE RECURSIVE MASTER SYSTEM');
  console.log('=' .repeat(80));
  
  const projectPath = process.cwd();
  
  const config: Partial<LoopConfig> = {
    maxIterations: 5,
    targetEntropy: 0.1,
    convergenceThreshold: 0.95,
    mythicMode: true,
    platforms: ['web', 'mobile', 'desktop'],
    enableEvolution: true,
    learningRate: 0.1
  };

  try {
    logger.info('🎯 Starting Genesis recursive transformation', {
      projectPath,
      config
    });

    const result = await executeGenesisEngine(projectPath, config);

    console.log('\n🏁 GENESIS TRANSFORMATION COMPLETE');
    console.log('=' .repeat(80));
    console.log(`✅ Converged: ${result.converged}`);
    console.log(`🔄 Iterations: ${result.iterations}`);
    console.log(`⏱️  Total Time: ${(result.totalTime / 1000).toFixed(2)}s`);
    console.log(`📊 Final Score: ${(result.finalMetrics.overall_score * 100).toFixed(1)}%`);
    
    console.log('\n📈 CONVERGENCE METRICS:');
    console.log(`  🎯 Delta Collapse: ${(result.finalMetrics.delta_collapse_score * 100).toFixed(1)}%`);
    console.log(`  🌀 Entropy Reduction: ${(result.finalMetrics.entropy_reduction * 100).toFixed(1)}%`);
    console.log(`  🏛️  L1 Compliance: ${(result.finalMetrics.L1_compliance * 100).toFixed(1)}%`);
    console.log(`  🔧 MCP Coverage: ${(result.finalMetrics.mcp_coverage * 100).toFixed(1)}%`);
    console.log(`  🎨 UI Consistency: ${(result.finalMetrics.ui_consistency * 100).toFixed(1)}%`);
    console.log(`  🔒 Security Score: ${(result.finalMetrics.security_score * 100).toFixed(1)}%`);
    
    console.log('\n📁 GENERATED ARTIFACTS:');
    result.artifacts.forEach((artifact: Artifact) => {
      console.log(`  📄 ${artifact.type}: ${artifact.path} (${artifact.size} bytes)`);
    });

    if (result.converged) {
      console.log('\n🎉 SYMBOLIC CONVERGENCE ACHIEVED!');
      console.log('The system has reached optimal state with full governance compliance.');
    } else {
      console.log('\n⚠️  CONVERGENCE NOT ACHIEVED');
      console.log('Consider increasing maxIterations or adjusting convergence threshold.');
    }

  } catch (error) {
    logger.error('❌ Genesis execution failed', {
      error: error instanceof Error ? error.message : String(error)
    }, error);
    
    console.error('\n💥 GENESIS EXECUTION FAILED');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Execute if this file is run directly
const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isMainModule) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main as executeGenesis }; 