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
    console.log(`🔍 正在查找 GitHub 用户: ${profile.login} (ID: ${profile.id})`);
    // 查找是否已存在该 GitHub 用户
    const existingUser = await this.getUserByGithubId(profile.id.toString());
    
    if (existingUser) {
      console.log(`📝 找到现有用户，正在更新用户信息: ${existingUser.name} (数据库 ID: ${existingUser.id})`);
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
      console.log(`✅ 用户信息更新完成: ${updated?.name}`);
      return updated as User;
    } else {
      console.log(`👤 GitHub 用户不存在，正在创建新用户: ${profile.login} (${profile.name})`);
      // 创建新用户
      const newUser = await this.createUser({
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
      console.log(`✅ 新用户创建成功: ${newUser.name} (数据库 ID: ${newUser.id})`);
      return newUser;
    }
  }

  /**
   * 保存用户仓库信息
   */
  async saveUserRepositories(userId: number, repositories: UserRepository[]): Promise<void> {
    console.log(`🗑️  正在删除用户 ${userId} 的现有仓库记录...`);
    // 先删除用户的现有仓库记录
    await this.db.prepare('DELETE FROM user_repositories WHERE user_id = ?').bind(userId).run();
    console.log(`✅ 现有仓库记录删除完成`);
    
    console.log(`💾 开始批量插入 ${repositories.length} 个仓库记录...`);
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
    console.log(`✅ 仓库记录批量插入完成 (${repositories.length} 个)`);
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
    console.log(`🗑️  正在删除用户 ${userId} 的现有语言统计...`);
    // 先删除用户的现有语言统计
    await this.db.prepare('DELETE FROM user_languages WHERE user_id = ?').bind(userId).run();
    console.log(`✅ 现有语言统计删除完成`);
    
    console.log(`💾 开始批量插入 ${languages.length} 个语言统计记录...`);
    // 批量插入新的语言统计
    for (const lang of languages) {
      await this.db.prepare(`
        INSERT INTO user_languages (user_id, language, bytes, percentage, last_updated)
        VALUES (?, ?, ?, ?, ?)
      `).bind(userId, lang.language, lang.bytes, lang.percentage, lang.last_updated || new Date().toISOString()).run();
    }
    console.log(`✅ 语言统计批量插入完成 (${languages.length} 个)`);
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
    console.log(`🗑️  正在删除用户 ${userId} 的现有组织记录...`);
    // 先删除用户的现有组织记录
    await this.db.prepare('DELETE FROM user_organizations WHERE user_id = ?').bind(userId).run();
    console.log(`✅ 现有组织记录删除完成`);
    
    console.log(`💾 开始批量插入 ${organizations.length} 个组织记录...`);
    // 批量插入新的组织记录
    for (const org of organizations) {
      await this.db.prepare(`
        INSERT INTO user_organizations (user_id, org_id, login, name, avatar_url, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(userId, org.org_id, org.login, org.name || null, org.avatar_url || null, org.description || null, org.created_at || new Date().toISOString()).run();
    }
    console.log(`✅ 组织记录批量插入完成 (${organizations.length} 个)`);
  }

  /**
   * 获取用户组织信息
   */
  async getUserOrganizations(userId: number): Promise<UserOrganization[]> {
    const result = await this.db.prepare('SELECT * FROM user_organizations WHERE user_id = ?').bind(userId).all();
    return result.results as unknown as UserOrganization[];
  }

  /**
   * 通过 GitHub 用户名获取用户
   */
  async getUserByLogin(login: string): Promise<User | null> {
    const result = await this.db.prepare('SELECT * FROM users WHERE login = ?').bind(login).first();
    return result as unknown as User | null;
  }

  /**
   * 通过用户名或 ID 获取用户
   * 支持通过 GitHub 用户名(login)或数据库 ID 查找用户
   */
  async getUserByUsernameOrId(identifier: string): Promise<User | null> {
    // 首先尝试通过 login 字段查找
    const userByLogin = await this.getUserByLogin(identifier);
    if (userByLogin) {
      return userByLogin;
    }
    
    // 如果是数字，尝试通过 ID 查找
    const numericId = Number.parseInt(identifier, 10);
    if (!isNaN(numericId)) {
      return await this.getUserById(numericId);
    }
    
    return null;
  }
} 