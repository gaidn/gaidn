/**
 * 用户业务服务
 * 封装用户相关业务逻辑，处理复杂业务规则
 */

import { User, CreateUserRequest, UserServiceResponse } from '@/types/user';
import { UserModel } from '@/models/user';
import { getDB } from '@/lib/db';

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
      
      const user = await this.userModel!.upsertUserByGithub(profile);
      
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