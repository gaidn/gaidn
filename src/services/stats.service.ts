/**
 * 用户统计数据计算服务
 * 处理用户统计数据的计算和管理
 */

import type { 
  UserStats, 
  CreateUserStatsRequest, 
  LanguageDistribution,
  ScoreServiceResponse
} from '@/types/scoring';
import type { UserRepository } from '@/types/user';
import { UserStatsModel } from '@/models/user-stats';
import { UserModel } from '@/models/user';
import { getDB } from '@/lib/db';
import { 
  generateLanguageDistribution, 
  countAIProjects 
} from '@/lib/scoring';

export class StatsService {
  private userStatsModel: UserStatsModel | null = null;
  private userModel: UserModel | null = null;

  /**
   * 初始化服务
   */
  private async init(): Promise<void> {
    if (!this.userStatsModel || !this.userModel) {
      try {
        console.log('🔌 统计服务正在初始化数据库连接...');
        const db = await getDB();
        this.userStatsModel = new UserStatsModel(db);
        this.userModel = new UserModel(db);
        console.log('✅ 统计服务数据库连接初始化完成');
      } catch (error) {
        console.error('❌ 统计服务数据库连接初始化失败:', error);
        throw new Error(`统计服务初始化失败: ${error instanceof Error ? error.message : '数据库连接失败'}`);
      }
    }
  }

  /**
   * 计算并保存用户统计数据
   */
  async calculateAndSaveUserStats(userId: number): Promise<ScoreServiceResponse<UserStats>> {
    try {
      await this.init();

      console.log(`📊 开始计算用户 ${userId} 的统计数据...`);

      // 1. 获取用户仓库数据
      const repositories = await this.userModel!.getUserRepositories(userId);
      if (repositories.length === 0) {
        console.log(`⚠️  用户 ${userId} 没有仓库数据`);
        return {
          success: false,
          error: '用户没有仓库数据'
        };
      }

      // 2. 计算统计数据
      const statsData = await this.calculateUserStatsFromRepositories(userId, repositories);

      // 3. 保存统计数据
      const savedStats = await this.userStatsModel!.upsertUserStats(statsData);

      console.log(`✅ 用户 ${userId} 统计数据计算完成: ${savedStats.total_repos} 个仓库, ${savedStats.ai_repos} 个AI项目, ${savedStats.stars_sum} 个stars`);

      return {
        success: true,
        data: savedStats
      };
    } catch (error) {
      console.error(`❌ 用户 ${userId} 统计数据计算失败:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '统计数据计算失败'
      };
    }
  }

  /**
   * 从仓库数据计算统计信息
   */
  private async calculateUserStatsFromRepositories(
    userId: number,
    repositories: UserRepository[]
  ): Promise<CreateUserStatsRequest> {
    // 转换为评分数据格式
    const repoScoreData = repositories.map(repo => ({
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

    // 计算基础统计
    const total_repos = repositories.length;
    const stars_sum = repositories.reduce((sum, repo) => sum + repo.stars, 0);
    const forks_sum = repositories.reduce((sum, repo) => sum + repo.forks, 0);

    // 计算 AI 项目数量
    const ai_repos = countAIProjects(repoScoreData);

    // 生成语言分布
    const language_distribution = generateLanguageDistribution(repoScoreData);

    // 找到最新的更新时间
    const last_updated = repositories.reduce((latest, repo) => {
      const repoUpdated = new Date(repo.updated_at);
      const latestDate = new Date(latest);
      return repoUpdated > latestDate ? repo.updated_at : latest;
    }, repositories[0]?.updated_at || new Date().toISOString());

    return {
      user_id: userId,
      total_repos,
      ai_repos,
      stars_sum,
      forks_sum,
      language_distribution,
      last_updated
    };
  }

  /**
   * 获取用户统计数据
   */
  async getUserStats(userId: number): Promise<ScoreServiceResponse<UserStats>> {
    try {
      await this.init();

      const stats = await this.userStatsModel!.getUserStats(userId);
      
      if (!stats) {
        return {
          success: false,
          error: '用户统计数据不存在'
        };
      }

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取统计数据失败'
      };
    }
  }

  /**
   * 批量计算用户统计数据
   */
  async batchCalculateUserStats(userIds: number[]): Promise<ScoreServiceResponse<{
    success: number;
    failed: number;
    details: { userId: number; success: boolean; error?: string }[];
  }>> {
    try {
      await this.init();

      console.log(`📊 开始批量计算 ${userIds.length} 个用户的统计数据...`);

      const results = [];
      let successCount = 0;
      let failedCount = 0;

      for (const userId of userIds) {
        try {
          const result = await this.calculateAndSaveUserStats(userId);
          if (result.success) {
            successCount++;
            results.push({ userId, success: true });
          } else {
            failedCount++;
            results.push({ userId, success: false, error: result.error });
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

      console.log(`✅ 批量统计计算完成: ${successCount} 成功, ${failedCount} 失败`);

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
        error: error instanceof Error ? error.message : '批量计算失败'
      };
    }
  }

  /**
   * 获取所有用户统计数据
   */
  async getAllUserStats(): Promise<ScoreServiceResponse<UserStats[]>> {
    try {
      await this.init();

      const stats = await this.userStatsModel!.getAllUserStats();

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取所有统计数据失败'
      };
    }
  }

  /**
   * 获取需要更新的用户统计数据
   */
  async getStatsForUpdate(hoursAgo: number = 24): Promise<ScoreServiceResponse<UserStats[]>> {
    try {
      await this.init();

      const stats = await this.userStatsModel!.getStatsForUpdate(hoursAgo);

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取待更新统计数据失败'
      };
    }
  }

  /**
   * 删除用户统计数据
   */
  async deleteUserStats(userId: number): Promise<ScoreServiceResponse<boolean>> {
    try {
      await this.init();

      const result = await this.userStatsModel!.deleteUserStats(userId);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除统计数据失败'
      };
    }
  }

  /**
   * 检查用户是否有统计数据
   */
  async hasUserStats(userId: number): Promise<boolean> {
    try {
      await this.init();
      return await this.userStatsModel!.hasUserStats(userId);
    } catch (error) {
      console.error('检查用户统计数据失败:', error);
      return false;
    }
  }

  /**
   * 解析语言分布
   */
  parseLanguageDistribution(distributionJson: string): LanguageDistribution {
    try {
      return JSON.parse(distributionJson);
    } catch {
      return {};
    }
  }

  /**
   * 获取统计概览
   */
  async getStatsOverview(): Promise<ScoreServiceResponse<{
    totalUsers: number;
    avgRepos: number;
    avgStars: number;
    avgAIProjects: number;
    topLanguages: Array<{ language: string; count: number }>;
  }>> {
    try {
      await this.init();

      const allStats = await this.userStatsModel!.getAllUserStats();
      
      if (allStats.length === 0) {
        return {
          success: true,
          data: {
            totalUsers: 0,
            avgRepos: 0,
            avgStars: 0,
            avgAIProjects: 0,
            topLanguages: []
          }
        };
      }

      const totalUsers = allStats.length;
      const avgRepos = allStats.reduce((sum, stat) => sum + stat.total_repos, 0) / totalUsers;
      const avgStars = allStats.reduce((sum, stat) => sum + stat.stars_sum, 0) / totalUsers;
      const avgAIProjects = allStats.reduce((sum, stat) => sum + stat.ai_repos, 0) / totalUsers;

      // 计算最受欢迎的语言
      const languageCount: { [key: string]: number } = {};
      allStats.forEach(stat => {
        const distribution = this.parseLanguageDistribution(stat.language_distribution);
        Object.entries(distribution).forEach(([lang, count]) => {
          languageCount[lang] = (languageCount[lang] || 0) + count;
        });
      });

      const topLanguages = Object.entries(languageCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([language, count]) => ({ language, count }));

      return {
        success: true,
        data: {
          totalUsers,
          avgRepos: Math.round(avgRepos * 100) / 100,
          avgStars: Math.round(avgStars * 100) / 100,
          avgAIProjects: Math.round(avgAIProjects * 100) / 100,
          topLanguages
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取统计概览失败'
      };
    }
  }
}

// 导出单例实例
export const statsService = new StatsService();