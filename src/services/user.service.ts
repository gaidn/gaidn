/**
 * 用户业务服务
 * 封装用户相关业务逻辑，处理复杂业务规则
 */

import type { User, CreateUserRequest, UserServiceResponse, GitHubUserProfile } from '@/types/user';
import { UserModel } from '@/models/user';
import { getDB } from '@/lib/db';
import { githubService } from './github.service';

export class UserService {
  private userModel: UserModel | null = null;

  /**
   * 初始化服务（获取数据库实例）
   */
  private async init(): Promise<void> {
    if (!this.userModel) {
      const db = await getDB();
      this.userModel = new UserModel(db);
    }
  }

  /**
   * 获取所有用户（带分页）
   */
  async getAllUsers(page = 1, limit = 10): Promise<UserServiceResponse<User[]>> {
    try {
      await this.init();
      const users = await this.userModel!.getAllUsers();
      
      // 业务逻辑：分页处理
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = users.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: paginatedUsers,
        total: users.length,
        page,
        limit,
        totalPages: Math.ceil(users.length / limit)
      };
    } catch (error) {
      console.error('获取用户列表失败:', error);
      return {
        success: false,
        error: '获取用户列表失败'
      };
    }
  }

  /**
   * 创建用户（带验证逻辑）
   */
  async createUser(userData: CreateUserRequest): Promise<UserServiceResponse<User>> {
    try {
      await this.init();
      
      // 业务逻辑：邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return {
          success: false,
          error: '邮箱格式不正确'
        };
      }

      // 业务逻辑：检查邮箱是否已存在
      const existingUser = await this.userModel!.getUserByEmail(userData.email);
      if (existingUser) {
        return {
          success: false,
          error: '该邮箱已被注册'
        };
      }

      // 业务逻辑：姓名长度验证
      if (userData.name.length < 2 || userData.name.length > 50) {
        return {
          success: false,
          error: '姓名长度必须在2-50个字符之间'
        };
      }

      const user = await this.userModel!.createUser(userData);
      
      return {
        success: true,
        data: user
      };
    } catch (error) {
      console.error('创建用户失败:', error);
      return {
        success: false,
        error: '创建用户失败'
      };
    }
  }

  /**
   * 更新用户信息（带权限检查）
   */
  async updateUser(id: number, userData: Partial<CreateUserRequest>, requestUserId?: number): Promise<UserServiceResponse<User>> {
    try {
      await this.init();
      
      // 业务逻辑：权限检查（用户只能更新自己的信息）
      if (requestUserId && requestUserId !== id) {
        return {
          success: false,
          error: '无权限更新其他用户信息'
        };
      }

      // 业务逻辑：检查用户是否存在
      const existingUser = await this.userModel!.getUserById(id);
      if (!existingUser) {
        return {
          success: false,
          error: '用户不存在'
        };
      }

      // 业务逻辑：如果更新邮箱，检查新邮箱是否已被其他用户使用
      if (userData.email && userData.email !== existingUser.email) {
        const emailUser = await this.userModel!.getUserByEmail(userData.email);
        if (emailUser && emailUser.id !== id) {
          return {
            success: false,
            error: '该邮箱已被其他用户使用'
          };
        }
      }

      const updatedUser = await this.userModel!.updateUser(id, userData);
      
      return {
        success: true,
        data: updatedUser!
      };
    } catch (error) {
      console.error('更新用户失败:', error);
      return {
        success: false,
        error: '更新用户失败'
      };
    }
  }

  /**
   * 删除用户
   */
  async deleteUser(id: number, requestUserId?: number): Promise<UserServiceResponse<boolean>> {
    try {
      await this.init();
      
      // 业务逻辑：权限检查
      if (requestUserId && requestUserId !== id) {
        return {
          success: false,
          error: '无权限删除其他用户'
        };
      }

      // 业务逻辑：检查用户是否存在
      const user = await this.userModel!.getUserById(id);
      if (!user) {
        return {
          success: false,
          error: '用户不存在'
        };
      }

      const result = await this.userModel!.deleteUser(id);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('删除用户失败:', error);
      return {
        success: false,
        error: '删除用户失败'
      };
    }
  }

  /**
   * 根据邮箱查找用户（业务逻辑：脱敏处理）
   */
  async getUserByEmail(email: string): Promise<UserServiceResponse<User>> {
    try {
      await this.init();
      
      const user = await this.userModel!.getUserByEmail(email);
      if (!user) {
        return {
          success: false,
          error: '用户不存在'
        };
      }

      // 业务逻辑：脱敏处理邮箱
      const maskedUser = {
        ...user,
        email: this.maskEmail(user.email)
      };

      return {
        success: true,
        data: maskedUser
      };
    } catch (error) {
      console.error('查找用户失败:', error);
      return {
        success: false,
        error: '查找用户失败'
      };
    }
  }

  /**
   * 通过 GitHub 账户信息创建或更新用户
   */
  async upsertUserByGithub(profile: { name: string; email: string; image?: string; id: string }): Promise<UserServiceResponse<User>> {
    try {
      await this.init();
      
      // 验证必要字段
      if (!profile.email || !profile.name || !profile.id) {
        return {
          success: false,
          error: 'GitHub 账户信息不完整'
        };
      }
      
      // 构造临时的 GitHubUserProfile
      const githubProfile: GitHubUserProfile = {
        id: Number.parseInt(profile.id),
        login: profile.name,
        name: profile.name,
        email: profile.email,
        avatar_url: profile.image || '',
        bio: undefined,
        company: undefined,
        location: undefined,
        blog: undefined,
        public_repos: 0,
        public_gists: 0,
        followers: 0,
        following: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const user = await this.userModel!.upsertUserByGithub(githubProfile);
      
      return {
        success: true,
        data: user
      };
    } catch (error) {
      console.error('GitHub 账户处理失败:', error);
      return {
        success: false,
        error: 'GitHub 账户处理失败'
      };
    }
  }

  /**
   * 通过 GitHub 完整档案创建或更新用户
   */
  async upsertUserByGithubProfile(profile: GitHubUserProfile): Promise<UserServiceResponse<User>> {
    try {
      await this.init();
      
      const user = await this.userModel!.upsertUserByGithub(profile);
      
      return {
        success: true,
        data: user
      };
    } catch (error) {
      console.error('GitHub 完整档案处理失败:', error);
      return {
        success: false,
        error: 'GitHub 完整档案处理失败'
      };
    }
  }

  /**
   * 收集并保存用户的完整 GitHub 数据
   */
  async collectAndSaveGitHubData(userId: string, accessToken: string): Promise<UserServiceResponse<boolean>> {
    try {
      await this.init();
      
      console.log(`开始收集用户 ${userId} 的 GitHub 数据...`);
      
      // 获取完整的 GitHub 数据
      const githubData = await githubService.collectUserData(accessToken);
      
      // 更新用户基本信息
      await this.userModel!.upsertUserByGithub(githubData.profile);
      
      // 保存仓库信息
      const userRepositories = githubService.convertToUserRepositories(Number.parseInt(userId), githubData.repositories);
      await this.userModel!.saveUserRepositories(Number.parseInt(userId), userRepositories);
      
      // 保存语言统计
      const userLanguages = githubData.languages.map(lang => ({ ...lang, user_id: Number.parseInt(userId) }));
      await this.userModel!.saveUserLanguages(Number.parseInt(userId), userLanguages);
      
      // 保存组织信息
      const userOrganizations = githubService.convertToUserOrganizations(Number.parseInt(userId), githubData.organizations);
      await this.userModel!.saveUserOrganizations(Number.parseInt(userId), userOrganizations);
      
      console.log(`用户 ${userId} 的 GitHub 数据收集完成`);
      
      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('收集和保存 GitHub 数据失败:', error);
      return {
        success: false,
        error: '收集和保存 GitHub 数据失败'
      };
    }
  }

  /**
   * 私有方法：邮箱脱敏处理
   */
  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.slice(0, 2) + '*'.repeat(Math.max(0, localPart.length - 2));
    return `${maskedLocal}@${domain}`;
  }
}

// 导出单例实例
export const userService = new UserService(); 