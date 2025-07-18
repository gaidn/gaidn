/**
 * 评分系统模块导出
 */

// 核心引擎
export { ScoreEngine, scoreEngine } from './score-engine';

// 算法实现
export { ScoreV1 } from './algorithms/score-v1';

// 工具函数
export {
  calculateQualityScore,
  calculateActivityScore,
  calculateDiversityScore,
  calculateRepoCountScore,
  calculateAIProjectScore,
  generateLanguageDistribution,
  getTopLanguages,
  calculateTimeDecayFactor,
  normalizeScore,
  calculateOriginalityScore
} from './score-utils';

// AI 检测工具
export {
  detectAIProject,
  countAIProjects,
  getAIProjects
} from './ai-detector';