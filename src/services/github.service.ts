/**
 * GitHub API 服务
 * 封装与 GitHub API 的交互逻辑
 */

import type { GitHubUserProfile, GitHubRepository, GitHubOrganization, UserRepository, UserLanguage, UserOrganization } from '@/types/user';

export class GitHubService {
  private baseUrl = 'https://api.github.com';
  
  /**
   * 获取用户详细信息
   */
  async getUserProfile(accessToken: string): Promise<GitHubUserProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'gaidn-app'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GitHub API 用户信息获取失败: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`GitHub API 用户信息获取失败: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('获取 GitHub 用户信息时发生错误:', error);
      throw error;
    }
  }

  /**
   * 获取用户仓库列表（限制前100个最新仓库）
   */
  async getUserRepositories(accessToken: string, username: string): Promise<GitHubRepository[]> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${username}/repos?per_page=100&sort=updated`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'gaidn-app'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GitHub API 仓库列表获取失败: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`GitHub API 仓库列表获取失败: ${response.status} ${response.statusText}`);
      }
      
      return await response.json() as GitHubRepository[];
    } catch (error) {
      console.error('获取 GitHub 仓库列表时发生错误:', error);
      throw error;
    }
  }

  /**
   * 获取用户的组织信息
   */
  async getUserOrganizations(accessToken: string): Promise<GitHubOrganization[]> {
    try {
      const response = await fetch(`${this.baseUrl}/user/orgs`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'gaidn-app'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GitHub API 组织信息获取失败: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`GitHub API 组织信息获取失败: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('获取 GitHub 组织信息时发生错误:', error);
      throw error;
    }
  }

  /**
   * 基于仓库的 language 字段统计用户语言使用情况
   * 避免为每个仓库单独调用 API
   */
  async getUserLanguageStats(accessToken: string, repositories: GitHubRepository[]): Promise<UserLanguage[]> {
    const languageStats: Record<string, number> = {};
    
    // 基于仓库的主要语言进行统计
    for (const repo of repositories) {
      if (repo.language) {
        // 使用 star 数作为权重，更能反映用户的技能水平
        const weight = repo.stargazers_count + 1; // +1 避免0权重
        languageStats[repo.language] = (languageStats[repo.language] || 0) + weight;
      }
    }
    
    // 计算百分比
    const totalWeight = Object.values(languageStats).reduce((sum, weight) => sum + weight, 0);
    
    return Object.entries(languageStats).map(([language, weight]) => ({
      id: 0, // 这会在数据库中自动分配
      user_id: 0, // 这会在调用时设置
      language,
      bytes: weight, // 使用权重代替字节数
      percentage: totalWeight > 0 ? (weight / totalWeight) * 100 : 0,
      last_updated: new Date().toISOString()
    })).sort((a, b) => b.percentage - a.percentage);
  }

  /**
   * 将 GitHub 仓库转换为用户仓库格式
   */
  convertToUserRepositories(userId: number, githubRepos: GitHubRepository[]): UserRepository[] {
    return githubRepos.map(repo => ({
      id: 0, // 这会在数据库中自动分配
      user_id: userId,
      repo_id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      is_private: repo.private,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at
    }));
  }

  /**
   * 将 GitHub 组织转换为用户组织格式
   */
  convertToUserOrganizations(userId: number, githubOrgs: GitHubOrganization[]): UserOrganization[] {
    return githubOrgs.map(org => ({
      id: 0, // 这会在数据库中自动分配
      user_id: userId,
      org_id: org.id,
      login: org.login,
      name: org.name,
      avatar_url: org.avatar_url,
      description: org.description,
      created_at: new Date().toISOString()
    }));
  }

  /**
   * 获取用户的完整 GitHub 数据
   */
  async collectUserData(accessToken: string): Promise<{
    profile: GitHubUserProfile;
    repositories: GitHubRepository[];
    organizations: GitHubOrganization[];
    languages: UserLanguage[];
  }> {
    try {
      // 获取用户基本信息
      console.log(`👤 正在获取用户基本信息...`);
      const profile = await this.getUserProfile(accessToken);
      console.log(`✅ 用户信息获取成功: ${profile.login} (${profile.name})`);
      
      // 获取用户仓库
      console.log(`📚 正在获取用户仓库列表...`);
      const repositories = await this.getUserRepositories(accessToken, profile.login);
      console.log(`✅ 仓库列表获取成功: ${repositories.length} 个仓库`);
      
      // 获取用户组织
      console.log(`🏢 正在获取用户组织信息...`);
      const organizations = await this.getUserOrganizations(accessToken);
      console.log(`✅ 组织信息获取成功: ${organizations.length} 个组织`);
      
      // 获取语言统计
      console.log(`🔤 正在统计编程语言使用情况...`);
      const languages = await this.getUserLanguageStats(accessToken, repositories);
      console.log(`✅ 语言统计完成: ${languages.length} 种编程语言`);
      
      return {
        profile,
        repositories,
        organizations,
        languages
      };
    } catch (error) {
      console.error('❌ GitHub 数据收集失败:', error);
      
      // 提供更详细的错误信息
      if (error instanceof Error) {
        if (error.message.includes('403')) {
          throw new Error('GitHub API 访问权限不足，请检查 access token 权限');
        } else if (error.message.includes('401')) {
          throw new Error('GitHub API 认证失败，access token 可能已过期');
        } else if (error.message.includes('404')) {
          throw new Error('GitHub 用户或资源不存在');
        } else if (error.message.includes('rate limit')) {
          throw new Error('GitHub API 速率限制，请稍后重试');
        } else {
          throw new Error(`GitHub API 调用失败: ${error.message}`);
        }
      }
      
      throw new Error('GitHub 数据收集过程中发生未知错误');
    }
  }
}

// 导出单例实例
export const githubService = new GitHubService();