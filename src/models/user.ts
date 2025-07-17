/**
 * 用户数据模型
 * 封装用户表的 CRUD 操作
 */

import type { User, CreateUserRequest, UserRepository, UserLanguage, UserOrganization, GitHubUserProfile } from '@/types/user';

export class UserModel {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * 获取所有用户
   */
  async getAllUsers(): Promise<User[]> {
    const result = await this.db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
    return result.results as unknown as User[];
  }

  /**
   * 创建用户
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    const { 
      name, email, image, github_id, login, bio, company, location, blog,
      public_repos, public_gists, followers, following, github_created_at, github_updated_at
    } = userData;
    
    const result = await this.db.prepare(
      `INSERT INTO users (
        name, email, image, github_id, login, bio, company, location, blog,
        public_repos, public_gists, followers, following, github_created_at, github_updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
    ).bind(
      name, email, image || null, github_id || null, login || null, bio || null,
      company || null, location || null, blog || null, public_repos || 0,
      public_gists || 0, followers || 0, following || 0, 
      github_created_at || null, github_updated_at || null
    ).first();
    
    return result as unknown as User;
  }

  /**
   * 通过 ID 获取用户
   */
  async getUserById(id: number): Promise<User | null> {
    const result = await this.db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    return result as unknown as User | null;
  }

  /**
   * 通过邮箱获取用户
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    return result as unknown as User | null;
  }

  /**
   * 通过 GitHub ID 获取用户
   */
  async getUserByGithubId(githubId: string): Promise<User | null> {
    const result = await this.db.prepare('SELECT * FROM users WHERE github_id = ?').bind(githubId).first();
    return result as unknown as User | null;
  }

  /**
   * 更新用户信息
   */
  async updateUser(id: number, userData: Partial<CreateUserRequest>): Promise<User | null> {
    const { 
      name, email, image, github_id, login, bio, company, location, blog,
      public_repos, public_gists, followers, following, github_created_at, github_updated_at
    } = userData;
    
    // 构建动态 SQL
    const updates: string[] = [];
    const values: unknown[] = [];
    
    const fields = {
      name, email, image, github_id, login, bio, company, location, blog,
      public_repos, public_gists, followers, following, github_created_at, github_updated_at
    };
    
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (updates.length === 0) {
      return this.getUserById(id);
    }
    
    // 添加 ID 到参数列表
    values.push(id);
    
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ? RETURNING *`;
    const result = await this.db.prepare(sql).bind(...values).first();
    
    return result as unknown as User | null;
  }

  /**
   * 删除用户
   */
  async deleteUser(id: number): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
    return result.success;
  }

  /**
   * 通过 GitHub 账户信息创建或更新用户
   * 用于 GitHub OAuth 登录
   */
  async upsertUserByGithub(profile: GitHubUserProfile): Promise<User> {
    // 查找是否已存在该 GitHub 用户
    const existingUser = await this.getUserByGithubId(profile.id.toString());
    
    if (existingUser) {
      // 更新用户信息
      const updated = await this.updateUser(existingUser.id, {
        name: profile.name || existingUser.name,
        email: profile.email || existingUser.email,
        image: profile.avatar_url || existingUser.image,
        login: profile.login,
        bio: profile.bio,
        company: profile.company,
        location: profile.location,
        blog: profile.blog,
        public_repos: profile.public_repos,
        public_gists: profile.public_gists,
        followers: profile.followers,
        following: profile.following,
        github_created_at: profile.created_at,
        github_updated_at: profile.updated_at
      });
      return updated as User;
    } else {
      // 创建新用户
      return this.createUser({
        name: profile.name,
        email: profile.email,
        image: profile.avatar_url,
        github_id: profile.id.toString(),
        login: profile.login,
        bio: profile.bio,
        company: profile.company,
        location: profile.location,
        blog: profile.blog,
        public_repos: profile.public_repos,
        public_gists: profile.public_gists,
        followers: profile.followers,
        following: profile.following,
        github_created_at: profile.created_at,
        github_updated_at: profile.updated_at
      });
    }
  }

  /**
   * 保存用户仓库信息
   */
  async saveUserRepositories(userId: number, repositories: UserRepository[]): Promise<void> {
    // 先删除用户的现有仓库记录
    await this.db.prepare('DELETE FROM user_repositories WHERE user_id = ?').bind(userId).run();
    
    // 批量插入新的仓库记录
    for (const repo of repositories) {
      await this.db.prepare(`
        INSERT INTO user_repositories (
          user_id, repo_id, name, full_name, description, language, 
          stars, forks, is_private, created_at, updated_at, pushed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        userId, repo.repo_id, repo.name, repo.full_name, repo.description || null,
        repo.language || null, repo.stars, repo.forks, repo.is_private,
        repo.created_at, repo.updated_at, repo.pushed_at || null
      ).run();
    }
  }

  /**
   * 获取用户仓库信息
   */
  async getUserRepositories(userId: number): Promise<UserRepository[]> {
    const result = await this.db.prepare('SELECT * FROM user_repositories WHERE user_id = ? ORDER BY stars DESC').bind(userId).all();
    return result.results as unknown as UserRepository[];
  }

  /**
   * 保存用户语言统计
   */
  async saveUserLanguages(userId: number, languages: UserLanguage[]): Promise<void> {
    // 先删除用户的现有语言统计
    await this.db.prepare('DELETE FROM user_languages WHERE user_id = ?').bind(userId).run();
    
    // 批量插入新的语言统计
    for (const lang of languages) {
      await this.db.prepare(`
        INSERT INTO user_languages (user_id, language, bytes, percentage)
        VALUES (?, ?, ?, ?)
      `).bind(userId, lang.language, lang.bytes, lang.percentage).run();
    }
  }

  /**
   * 获取用户语言统计
   */
  async getUserLanguages(userId: number): Promise<UserLanguage[]> {
    const result = await this.db.prepare('SELECT * FROM user_languages WHERE user_id = ? ORDER BY percentage DESC').bind(userId).all();
    return result.results as unknown as UserLanguage[];
  }

  /**
   * 保存用户组织信息
   */
  async saveUserOrganizations(userId: number, organizations: UserOrganization[]): Promise<void> {
    // 先删除用户的现有组织记录
    await this.db.prepare('DELETE FROM user_organizations WHERE user_id = ?').bind(userId).run();
    
    // 批量插入新的组织记录
    for (const org of organizations) {
      await this.db.prepare(`
        INSERT INTO user_organizations (user_id, org_id, login, name, avatar_url, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(userId, org.org_id, org.login, org.name || null, org.avatar_url || null, org.description || null).run();
    }
  }

  /**
   * 获取用户组织信息
   */
  async getUserOrganizations(userId: number): Promise<UserOrganization[]> {
    const result = await this.db.prepare('SELECT * FROM user_organizations WHERE user_id = ?').bind(userId).all();
    return result.results as unknown as UserOrganization[];
  }
} 