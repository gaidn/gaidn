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
    const response = await fetch(`${this.baseUrl}/user`, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'gaidn-app'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API 错误: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * 获取用户仓库列表
   */
  async getUserRepositories(accessToken: string, username: string): Promise<GitHubRepository[]> {
    const allRepos: GitHubRepository[] = [];
    let page = 1;
    const perPage = 100;
    
    while (true) {
      const response = await fetch(`${this.baseUrl}/users/${username}/repos?page=${page}&per_page=${perPage}&sort=updated`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'gaidn-app'
        }
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API 错误: ${response.status} ${response.statusText}`);
      }
      
      const repos = await response.json() as GitHubRepository[];
      
      if (repos.length === 0) {
        break;
      }
      
      allRepos.push(...repos);
      page++;
    }
    
    return allRepos;
  }

  /**
   * 获取用户的组织信息
   */
  async getUserOrganizations(accessToken: string): Promise<GitHubOrganization[]> {
    const response = await fetch(`${this.baseUrl}/user/orgs`, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'gaidn-app'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API 错误: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * 获取仓库的语言统计
   */
  async getRepositoryLanguages(accessToken: string, owner: string, repo: string): Promise<Record<string, number>> {
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/languages`, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'gaidn-app'
      }
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        // 可能是私有仓库或权限不足，跳过
        return {};
      }
      throw new Error(`GitHub API 错误: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * 汇总用户所有仓库的语言统计
   */
  async getUserLanguageStats(accessToken: string, repositories: GitHubRepository[]): Promise<UserLanguage[]> {
    const languageStats: Record<string, number> = {};
    
    // 遍历所有仓库获取语言统计
    for (const repo of repositories) {
      try {
        const languages = await this.getRepositoryLanguages(accessToken, repo.full_name.split('/')[0], repo.name);
        
        for (const [language, bytes] of Object.entries(languages)) {
          languageStats[language] = (languageStats[language] || 0) + bytes;
        }
      } catch (error) {
        console.warn(`获取仓库 ${repo.full_name} 语言统计失败:`, error);
        // 继续处理其他仓库
      }
    }
    
    // 计算百分比
    const totalBytes = Object.values(languageStats).reduce((sum, bytes) => sum + bytes, 0);
    
    return Object.entries(languageStats).map(([language, bytes]) => ({
      id: 0, // 这会在数据库中自动分配
      user_id: 0, // 这会在调用时设置
      language,
      bytes,
      percentage: totalBytes > 0 ? (bytes / totalBytes) * 100 : 0,
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
      console.log('开始收集 GitHub 用户数据...');
      
      // 获取用户基本信息
      const profile = await this.getUserProfile(accessToken);
      console.log(`获取用户信息成功: ${profile.login}`);
      
      // 获取用户仓库
      const repositories = await this.getUserRepositories(accessToken, profile.login);
      console.log(`获取到 ${repositories.length} 个仓库`);
      
      // 获取用户组织
      const organizations = await this.getUserOrganizations(accessToken);
      console.log(`获取到 ${organizations.length} 个组织`);
      
      // 获取语言统计
      const languages = await this.getUserLanguageStats(accessToken, repositories);
      console.log(`统计到 ${languages.length} 种编程语言`);
      
      return {
        profile,
        repositories,
        organizations,
        languages
      };
    } catch (error) {
      console.error('收集 GitHub 用户数据失败:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const githubService = new GitHubService();