/**
 * 用户评分计算服务
 * 处理用户评分的计算和管理
 */

import type { 
  UserScore, 
  CreateUserScoreRequest, 
  ScoreServiceResponse,
  ScoreCalculationInput,
  RankingUser,
  RankingQuery,
  RankingResponse,
  UserStats
} from '@/types/scoring';
import type { UserRepository } from '@/types/user';
import { UserScoresModel } from '@/models/user-scores';
import { UserStatsModel } from '@/models/user-stats';
import { UserModel } from '@/models/user';
import { getDB } from '@/lib/db';
import { scoreEngine } from '@/lib/scoring';
import { getTopLanguages } from '@/lib/scoring';

export class ScoreService {
  private userScoresModel: UserScoresModel | null = null;
  private userStatsModel: UserStatsModel | null = null;
  private userModel: UserModel | null = null;

  /**
   * 初始化服务
   */
  private async init(): Promise<void> {
    if (!this.userScoresModel || !this.userStatsModel || !this.userModel) {
      try {
        console.log('🔌 评分服务正在初始化数据库连接...');
        const db = await getDB();
        this.userScoresModel = new UserScoresModel(db);
        this.userStatsModel = new UserStatsModel(db);
        this.userModel = new UserModel(db);
        console.log('✅ 评分服务数据库连接初始化完成');
      } catch (error) {
        console.error('❌ 评分服务数据库连接初始化失败:', error);
        throw new Error(`评分服务初始化失败: ${error instanceof Error ? error.message : '数据库连接失败'}`);
      }
    }
  }

  /**
   * 计算并保存用户评分
   */
  async calculateAndSaveUserScore(
    userId: number,
    algorithmVersion: string = 'V1'
  ): Promise<ScoreServiceResponse<UserScore>> {
    try {
      await this.init();

      console.log(`🎯 开始计算用户 ${userId} 的评分 (算法版本: ${algorithmVersion})...`);

      // 1. 获取用户统计数据
      const userStats = await this.userStatsModel!.getUserStats(userId);
      if (!userStats) {
        return {
          success: false,
          error: '用户统计数据不存在，请先生成统计数据'
        };
      }

      // 2. 获取用户仓库数据
      const repositories = await this.userModel!.getUserRepositories(userId);
      if (repositories.length === 0) {
        return {
          success: false,
          error: '用户没有仓库数据'
        };
      }

      // 3. 准备计算输入数据
      const calculationInput = this.prepareCalculationInput(userStats, repositories);

      // 4. 使用评分引擎计算评分
      const score = await scoreEngine.calculateScore(calculationInput, algorithmVersion);

      // 5. 保存评分
      const scoreData: CreateUserScoreRequest = {
        user_id: userId,
        score,
        algorithm_version: algorithmVersion
      };

      const savedScore = await this.userScoresModel!.upsertUserScore(scoreData);

      console.log(`✅ 用户 ${userId} 评分计算完成: ${score.toFixed(2)} 分`);

      return {
        success: true,
        data: savedScore
      };
    } catch (error) {
      console.error(`❌ 用户 ${userId} 评分计算失败:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '评分计算失败'
      };
    }
  }

  /**
   * 准备评分计算输入数据
   */
  private prepareCalculationInput(
    userStats: UserStats,
    repositories: UserRepository[]
  ): ScoreCalculationInput {
    const repositoryData = repositories.map(repo => ({
      repo_id: repo.repo_id,
      name: repo.name,
      description: repo.description ?? null,
      language: repo.language ?? null,
      stars: repo.stars,
      forks: repo.forks,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at ?? null
    }));

    return {
      userStats,
      repositoryData
    };
  }

  /**
   * 获取用户评分
   */
  async getUserScore(
    userId: number,
    algorithmVersion: string = 'V1'
  ): Promise<ScoreServiceResponse<UserScore>> {
    try {
      await this.init();

      const score = await this.userScoresModel!.getUserScore(userId, algorithmVersion);
      
      if (!score) {
        return {
          success: false,
          error: '用户评分不存在'
        };
      }

      return {
        success: true,
        data: score
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取用户评分失败'
      };
    }
  }

  /**
   * 获取用户排名
   */
  async getUserRank(
    userId: number,
    algorithmVersion: string = 'V1'
  ): Promise<ScoreServiceResponse<number>> {
    try {
      await this.init();

      const rank = await this.userScoresModel!.getUserRank(userId, algorithmVersion);
      
      if (rank === null) {
        return {
          success: false,
          error: '用户排名不存在'
        };
      }

      return {
        success: true,
        data: rank
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取用户排名失败'
      };
    }
  }

  /**
   * 获取排行榜数据
   */
  async getRankings(query: RankingQuery = {}): Promise<RankingResponse> {
    try {
      await this.init();

      const {
        page = 1,
        limit = 10,
        algorithm_version = 'V1'
      } = query;

      console.log(`📊 [服务层] 获取排行榜数据: 页面 ${page}, 限制 ${limit}, 算法版本 ${algorithm_version}`);

      // 1. 获取评分数据
      console.log(`🔍 [服务层] 开始查询评分数据...`);
      const scoreResult = await this.userScoresModel!.getRankings(
        algorithm_version,
        page,
        limit
      );
      console.log(`📊 [服务层] 评分数据查询完成: 总数=${scoreResult.total}, 记录数=${scoreResult.scores.length}`);

      if (scoreResult.scores.length === 0) {
        console.log(`⚠️ [服务层] 没有找到评分数据, 返回空结果`);
        return {
          success: true,
          data: {
            users: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0
            }
          }
        };
      }

      // 2. 获取用户详细信息和统计数据
      console.log(`🔍 [服务层] 开始获取用户详细信息...`);
      const rankingUsers: RankingUser[] = [];
      
      for (let i = 0; i < scoreResult.scores.length; i++) {
        const scoreData = scoreResult.scores[i];
        console.log(`🔍 [服务层] 处理用户 ${i + 1}/${scoreResult.scores.length}: 用户ID=${scoreData.user_id}, 分数=${scoreData.score}`);
        
        // 获取用户基本信息
        const user = await this.userModel!.getUserById(scoreData.user_id);
        if (!user) {
          console.log(`⚠️ [服务层] 用户 ${scoreData.user_id} 基本信息不存在，跳过`);
          continue;
        }
        console.log(`✅ [服务层] 用户 ${scoreData.user_id} 基本信息获取成功: ${user.name} (@${user.login})`);

        // 获取用户统计数据
        const userStats = await this.userStatsModel!.getUserStats(scoreData.user_id);
        if (!userStats) {
          console.log(`⚠️ [服务层] 用户 ${scoreData.user_id} 统计数据不存在，跳过`);
          continue;
        }
        console.log(`✅ [服务层] 用户 ${scoreData.user_id} 统计数据获取成功: ${userStats.total_repos} 个仓库, ${userStats.ai_repos} 个AI项目`);

        // 解析语言分布
        const languageDistribution = this.userStatsModel!.parseLanguageDistribution(userStats.language_distribution);
        const topLanguages = getTopLanguages(languageDistribution, 3);

        // 计算排名
        const rank = (page - 1) * limit + i + 1;
        console.log(`📊 [服务层] 用户 ${scoreData.user_id} 排名计算: 第 ${rank} 名`);

        rankingUsers.push({
          id: user.id,
          name: user.name,
          login: user.login ?? null,
          image: user.image ?? null,
          score: scoreData.score,
          rank,
          stats: {
            total_repos: userStats.total_repos,
            ai_repos: userStats.ai_repos,
            stars_sum: userStats.stars_sum,
            forks_sum: userStats.forks_sum,
            top_languages: topLanguages,
            last_updated: userStats.last_updated
          }
        });
      }

      console.log(`✅ [服务层] 排行榜数据构建完成: ${rankingUsers.length} 个用户`);
      
      if (rankingUsers.length > 0) {
        console.log(`📊 [服务层] 第一名用户: ${rankingUsers[0].name} (${rankingUsers[0].score.toFixed(2)} 分)`);
      }

      const result = {
        success: true,
        data: {
          users: rankingUsers,
          pagination: {
            page: scoreResult.page,
            limit: scoreResult.limit,
            total: scoreResult.total,
            totalPages: scoreResult.totalPages
          }
        }
      };

      console.log(`🎉 [服务层] 排行榜数据返回: 成功=${result.success}, 用户数=${result.data.users.length}, 分页信息=${JSON.stringify(result.data.pagination)}`);
      
      return result;
    } catch (error) {
      console.error('❌ [服务层] 获取排行榜数据失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取排行榜数据失败'
      };
    }
  }

  /**
   * 获取前 N 名用户
   */
  async getTopUsers(
    count: number = 10,
    algorithmVersion: string = 'V1'
  ): Promise<ScoreServiceResponse<RankingUser[]>> {
    try {
      const result = await this.getRankings({
        page: 1,
        limit: count,
        algorithm_version: algorithmVersion
      });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || '获取前N名用户失败'
        };
      }

      return {
        success: true,
        data: result.data.users
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取前N名用户失败'
      };
    }
  }

  /**
   * 批量计算用户评分
   */
  async batchCalculateUserScores(
    userIds: number[],
    algorithmVersion: string = 'V1'
  ): Promise<ScoreServiceResponse<{
    success: number;
    failed: number;
    details: { userId: number; success: boolean; score?: number; error?: string }[];
  }>> {
    try {
      await this.init();

      console.log(`🎯 开始批量计算 ${userIds.length} 个用户的评分...`);

      const results = [];
      let successCount = 0;
      let failedCount = 0;

      for (const userId of userIds) {
        try {
          const result = await this.calculateAndSaveUserScore(userId, algorithmVersion);
          if (result.success && result.data) {
            successCount++;
            results.push({ 
              userId, 
              success: true, 
              score: result.data.score 
            });
          } else {
            failedCount++;
            results.push({ 
              userId, 
              success: false, 
              error: result.error 
            });
          }
        } catch (error) {
          failedCount++;
          results.push({ 
            userId, 
            success: false, 
            error: error instanceof Error ? error.message : '未知错误' 
          });
        }
      }

      console.log(`✅ 批量评分计算完成: ${successCount} 成功, ${failedCount} 失败`);

      return {
        success: true,
        data: {
          success: successCount,
          failed: failedCount,
          details: results
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '批量计算评分失败'
      };
    }
  }

  /**
   * 重新计算所有用户评分
   */
  async recalculateAllScores(
    algorithmVersion: string = 'V1'
  ): Promise<ScoreServiceResponse<{ updated: number; failed: number }>> {
    try {
      await this.init();

      console.log(`🔄 开始重新计算所有用户的评分 (算法版本: ${algorithmVersion})...`);

      // 获取所有有统计数据的用户
      const allStats = await this.userStatsModel!.getAllUserStats();
      const userIds = allStats.map(stat => stat.user_id);

      if (userIds.length === 0) {
        return {
          success: true,
          data: { updated: 0, failed: 0 }
        };
      }

      const batchResult = await this.batchCalculateUserScores(userIds, algorithmVersion);
      
      if (!batchResult.success || !batchResult.data) {
        return {
          success: false,
          error: batchResult.error || '批量重新计算失败'
        };
      }

      return {
        success: true,
        data: {
          updated: batchResult.data.success,
          failed: batchResult.data.failed
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '重新计算所有评分失败'
      };
    }
  }

  /**
   * 获取算法统计信息
   */
  async getAlgorithmStats(algorithmVersion: string = 'V1'): Promise<ScoreServiceResponse<{
    total: number;
    avgScore: number;
    maxScore: number;
    minScore: number;
  }>> {
    try {
      await this.init();

      const stats = await this.userScoresModel!.getAlgorithmStats(algorithmVersion);

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取算法统计信息失败'
      };
    }
  }

  /**
   * 删除用户评分
   */
  async deleteUserScore(
    userId: number,
    algorithmVersion: string = 'V1'
  ): Promise<ScoreServiceResponse<boolean>> {
    try {
      await this.init();

      const result = await this.userScoresModel!.deleteUserScore(userId, algorithmVersion);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除用户评分失败'
      };
    }
  }

  /**
   * 获取可用的算法版本
   */
  async getAvailableAlgorithmVersions(): Promise<string[]> {
    try {
      await this.init();
      return await this.userScoresModel!.getAvailableAlgorithmVersions();
    } catch (error) {
      console.error('获取可用算法版本失败:', error);
      return scoreEngine.getAvailableVersions();
    }
  }
}

// 导出单例实例
export const scoreService = new ScoreService();