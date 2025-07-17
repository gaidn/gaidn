/**
 * 用户数据模型
 * 封装用户表的 CRUD 操作
 */

import { User, CreateUserRequest } from '@/types/user';

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
    const { name, email, image, github_id } = userData;
    
    const result = await this.db.prepare(
      'INSERT INTO users (name, email, image, github_id) VALUES (?, ?, ?, ?) RETURNING *'
    ).bind(name, email, image || null, github_id || null).first();
    
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
    const { name, email, image, github_id } = userData;
    
    // 构建动态 SQL
    const updates: string[] = [];
    const values: any[] = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    
    if (image !== undefined) {
      updates.push('image = ?');
      values.push(image);
    }
    
    if (github_id !== undefined) {
      updates.push('github_id = ?');
      values.push(github_id);
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
  async upsertUserByGithub(profile: { name: string; email: string; image?: string; id: string }): Promise<User> {
    // 查找是否已存在该 GitHub 用户
    const existingUser = await this.getUserByGithubId(profile.id);
    
    if (existingUser) {
      // 更新用户信息
      const updated = await this.updateUser(existingUser.id, {
        name: profile.name || existingUser.name,
        email: profile.email || existingUser.email,
        image: profile.image || existingUser.image
      });
      return updated as User;
    } else {
      // 创建新用户
      return this.createUser({
        name: profile.name,
        email: profile.email,
        image: profile.image,
        github_id: profile.id
      });
    }
  }
} 