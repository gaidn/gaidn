/**
 * AI 项目检测工具
 * 根据仓库名称、描述、语言等信息判断是否为 AI 相关项目
 */

import type { AIProjectRule, RepoScoreData } from '@/types/scoring';

/**
 * AI 项目识别规则配置
 */
const AI_PROJECT_RULES: AIProjectRule[] = [
  {
    type: 'name',
    patterns: [
      'ai', 'artificial-intelligence', 'machine-learning', 'ml', 'deep-learning',
      'neural-network', 'tensorflow', 'pytorch', 'opencv', 'nlp', 'computer-vision',
      'chatbot', 'gpt', 'llm', 'transformer', 'bert', 'neural', 'algorithm',
      'face-recognition', 'speech-recognition', 'recommendation', 'classification',
      'chat','claude','gemini','grok','cursor'
    ],
    weight: 1.0
  },
  {
    type: 'description',
    patterns: [
      'artificial intelligence', 'machine learning', 'deep learning', 'neural network',
      'computer vision', 'natural language processing', 'data science', 'predictive',
      'classification', 'regression', 'clustering', 'recommendation system',
      'chatbot', 'conversational ai', 'speech recognition', 'image recognition',
      'face detection', 'object detection', 'sentiment analysis', 'text mining','chatgpt','gpt',
      'claude','gemini','grok','cursor'
    ],
    weight: 0.8
  },
  {
    type: 'language',
    patterns: ['python', 'jupyter notebook', 'r'],
    weight: 0.1
  }
];

/**
 * 检测仓库是否为 AI 项目
 */
export function detectAIProject(repo: RepoScoreData): boolean {
  let totalScore = 0;
  let maxPossibleScore = 0;

  for (const rule of AI_PROJECT_RULES) {
    maxPossibleScore += rule.weight;
    let ruleMatched = false;

    switch (rule.type) {
      case 'name':
        ruleMatched = checkNamePatterns(repo.name, rule.patterns);
        break;
      case 'description':
        ruleMatched = checkDescriptionPatterns(repo.description, rule.patterns);
        break;
      case 'language':
        ruleMatched = checkLanguagePatterns(repo.language, rule.patterns);
        break;
    }

    if (ruleMatched) {
      totalScore += rule.weight;
    }
  }

  // 阈值设为最大可能分数的 30%
  const threshold = maxPossibleScore * 0.3;
  return totalScore >= threshold;
}

/**
 * 检查仓库名称是否匹配 AI 相关模式
 */
function checkNamePatterns(name: string, patterns: string[]): boolean {
  const normalizedName = name.toLowerCase().replace(/[-_]/g, '');

  return patterns.some(pattern => {
    const normalizedPattern = pattern.toLowerCase().replace(/[-_]/g, '');
    return normalizedName.includes(normalizedPattern);
  });
}

/**
 * 检查仓库描述是否匹配 AI 相关模式
 */
function checkDescriptionPatterns(description: string | null, patterns: string[]): boolean {
  if (!description) return false;

  const normalizedDescription = description.toLowerCase();

  return patterns.some(pattern =>
    normalizedDescription.includes(pattern.toLowerCase())
  );
}

/**
 * 检查编程语言是否为 AI 常用语言
 */
function checkLanguagePatterns(language: string | null, patterns: string[]): boolean {
  if (!language) return false;

  const normalizedLanguage = language.toLowerCase();

  return patterns.some(pattern =>
    normalizedLanguage.includes(pattern.toLowerCase())
  );
}

/**
 * 批量检测多个仓库的 AI 项目数量
 */
export function countAIProjects(repos: RepoScoreData[]): number {
  return repos.filter(repo => detectAIProject(repo)).length;
}

/**
 * 获取 AI 项目列表
 */
export function getAIProjects(repos: RepoScoreData[]): RepoScoreData[] {
  return repos.filter(repo => detectAIProject(repo));
}