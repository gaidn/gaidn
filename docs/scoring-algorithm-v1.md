# 评分算法 V1 技术文档

## 概述

评分算法 V1 是一个基于用户 GitHub 数据的综合评分系统，用于评估开发者的技术能力和项目影响力。该算法综合考虑了仓库质量、活跃度、技术多样性、AI 项目比例等多个维度，并应用额外的调整因子来提高评分的准确性。

## 算法架构

### 输入数据结构

算法需要以下两类输入数据：

1. **用户统计数据（UserStats）**：
   - 总仓库数（total_repos）
   - AI 项目数（ai_repos）  
   - 总 stars 数（stars_sum）
   - 总 forks 数（forks_sum）
   - 语言分布（language_distribution）
   - 最后更新时间（last_updated）

2. **仓库详细数据（RepoScoreData[]）**：
   - 仓库基本信息（名称、描述、语言）
   - 影响力指标（stars、forks）
   - 时间数据（创建时间、更新时间、推送时间）

### 核心评分权重

算法使用以下权重配置：

```typescript
const DEFAULT_WEIGHTS = {
  starsFactor: 0.25,      // 25% - 仓库质量（stars/forks）
  forksFactor: 0.15,      // 15% - fork 影响
  activityFactor: 0.20,   // 20% - 活跃度
  diversityFactor: 0.15,  // 15% - 技术多样性
  aiProjectFactor: 0.15,  // 15% - AI 项目加成
  repoCountFactor: 0.10   // 10% - 仓库数量
};
```

## 评分计算流程

### 1. 仓库质量评分（Quality Score）

**计算公式**：
```typescript
const starsScore = Math.log10(totalStars + 1) * 10;
const forksScore = Math.log10(totalForks + 1) * 5;
const qualityScore = Math.min(starsScore + forksScore, 100);
```

**特点**：
- 使用对数函数避免超大数值的影响
- Stars 权重高于 Forks
- 最高分限制在 100 分

### 2. 活跃度评分（Activity Score）

**计算逻辑**：
- 统计一年内有更新的仓库数量
- 计算活跃仓库比例
- 评估平均更新新鲜度

**计算公式**：
```typescript
const activityRatio = activeRepos.length / repos.length;
const avgFreshness = /* 基于更新时间的新鲜度计算 */;
const activityScore = Math.min(activityRatio * 50 + avgFreshness * 50, 100);
```

### 3. 技术多样性评分（Diversity Score）

**计算方法**：
- 统计使用的不同编程语言数量
- 语言数量越多分数越高，但有递减效应

**计算公式**：
```typescript
const diversityScore = Math.min(languageCount * 10, 100);
```

### 4. 仓库数量评分（Repo Count Score）

**计算公式**：
```typescript
const repoCountScore = Math.min(Math.log10(repoCount + 1) * 25, 100);
```

**特点**：
- 使用对数函数避免仓库数量过多导致分数过高
- 体现项目产出能力

### 5. AI 项目加成评分（AI Project Score）

**计算逻辑**：
- 考虑 AI 项目数量和比例
- 非线性增长模式

**计算公式**：
```typescript
const aiRatio = aiProjectCount / totalRepoCount;
const aiScore = Math.sqrt(aiRatio) * 50 + aiProjectCount * 5;
```

### 6. 加权总分计算

**计算公式**：
```typescript
const totalScore = (
  qualityScore * (weights.starsFactor + weights.forksFactor) +
  activityScore * weights.activityFactor +
  diversityScore * weights.diversityFactor +
  aiProjectScore * weights.aiProjectFactor +
  repoCountScore * weights.repoCountFactor
);
```

## 调整因子系统

### 1. 早期用户加成（Early User Bonus）

**计算方法**：
- 基于账户创建时间（使用最早的仓库创建时间）
- 账户年龄越老，加成越高

**计算公式**：
```typescript
const accountAge = /* 账户年龄计算 */;
const earlyUserBonus = Math.min(1.0 + accountAge * 0.02, 1.2);
```

**加成范围**：1.0 - 1.2 倍

### 2. 一致性加成（Consistency Bonus）

**计算方法**：
- 统计最近 3 个月内有更新的仓库比例
- 体现开发者的持续活跃度

**计算公式**：
```typescript
const consistencyRatio = recentlyActiveRepos.length / totalRepos;
const consistencyBonus = 1.0 + consistencyRatio * 0.15;
```

**加成范围**：1.0 - 1.15 倍

### 3. 影响力加成（Influence Bonus）

**计算方法**：
- 基于最高 stars 数的仓库
- 体现项目影响力

**加成规则**：
- >= 1000 stars：1.3 倍
- >= 500 stars：1.2 倍
- >= 100 stars：1.1 倍
- >= 50 stars：1.05 倍
- < 50 stars：1.0 倍

## 最终评分

**标准化处理**：
```typescript
const finalScore = normalizeScore(adjustedScore, 0, 1000);
```

最终评分被标准化到 0-1000 的范围内。

## 算法特点

### 优势
1. **多维度评估**：综合考虑质量、活跃度、多样性等多个维度
2. **抗极值干扰**：使用对数函数处理极值，避免单个高 stars 项目过度影响
3. **时间敏感性**：考虑项目的时间新鲜度和持续性
4. **AI 项目特殊处理**：针对 AI 项目给予额外加成
5. **用户成长激励**：早期用户和持续活跃用户获得额外加成

### 局限性
1. **数据依赖性**：完全依赖 GitHub 公开数据
2. **语言偏见**：对某些流行语言可能存在偏向
3. **项目类型局限**：主要适用于开源项目评估
4. **时效性问题**：历史数据可能不能完全反映当前能力

## 技术实现

### 核心类结构
```typescript
export class ScoreV1 implements ScoreCalculator {
  readonly version = 'V1';
  private weights: ScoreWeights;
  
  async calculate(input: ScoreCalculationInput): Promise<number>;
  private calculateWeightedScore(scores: ScoreComponents): number;
  private applyAdjustments(baseScore: number, userStats: UserStats, repositoryData: RepoScoreData[]): number;
}
```

### 支持工具函数
- `calculateQualityScore()` - 仓库质量评分
- `calculateActivityScore()` - 活跃度评分
- `calculateDiversityScore()` - 技术多样性评分
- `calculateRepoCountScore()` - 仓库数量评分
- `calculateAIProjectScore()` - AI 项目评分
- `normalizeScore()` - 分数标准化

## 使用示例

```typescript
import { ScoreV1 } from '@/lib/scoring/algorithms/score-v1';

const scoreCalculator = new ScoreV1();
const score = await scoreCalculator.calculate({
  userStats: userStatsData,
  repositoryData: repoData
});
```

## 版本信息

- **算法版本**：V1
- **创建时间**：2024
- **适用范围**：GitHub 开发者评分
- **维护状态**：活跃维护

## 未来改进方向

1. **代码质量分析**：集成代码质量检测工具
2. **社区贡献评估**：考虑 issue、PR 等社区贡献
3. **项目影响力权重**：根据项目类型调整权重
4. **机器学习优化**：使用 ML 模型优化权重配置
5. **多平台支持**：扩展到 GitLab、Bitbucket 等平台

---

*本文档描述了评分算法 V1 的完整技术实现，为后续算法优化和维护提供参考。*