/**
 * 用户业务服务
 * 封装用户相关业务逻辑，处理复杂业务规则
 */

import type { User, CreateUserRequest, UserServiceResponse, GitHubUserProfile } from '@/types/user';
import type { ProfileUpdateRequest, ProfileUpdateResponse, ProfileValidationError } from '@/types/profile';
import { UserModel } from '@/models/user';
import { getDB } from '@/lib/db';
import { githubService } from './github.service';
import { statsService } from './stats.service';
import { scoreService } from './score.service';

export class UserService {
  private userModel: UserModel | null = null;

  /**
   * 初始化服务（获取数据库实例）
   */
  private async init(): Promise<void> {
    if (!this.userModel) {
      try {
        console.log('🔌 用户服务正在初始化数据库连接...');
        const db = await getDB();
        this.userModel = new UserModel(db);
        console.log('✅ 用户服务数据库连接初始化完成');
      } catch (error) {
        console.error('❌ 用户服务数据库连接初始化失败:', error);
        throw new Error(`用户服务初始化失败: ${error instanceof Error ? error.message : '数据库连接失败'}`);
      }
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
      return {
        success: false,
        error: '查找用户失败'
      };
    }
  }

  /**
   * 更新当前用户的个人资料
   * 专门用于个人资料编辑功能
   */
  async updateCurrentUserProfile(userId: number, profileData: ProfileUpdateRequest): Promise<ProfileUpdateResponse> {
    try {
      await this.init();
      
      // 业务逻辑：验证必要字段
      const validationErrors: ProfileValidationError[] = [];
      
      // 姓名验证
      if (!profileData.name || profileData.name.trim().length === 0) {
        validationErrors.push({
          field: 'name',
          message: '显示名称不能为空'
        });
      } else if (profileData.name.length < 2 || profileData.name.length > 50) {
        validationErrors.push({
          field: 'name',
          message: '显示名称长度必须在2-50个字符之间'
        });
      }
      
      // 个人简介验证
      if (profileData.bio && profileData.bio.length > 500) {
        validationErrors.push({
          field: 'bio',
          message: '个人简介不能超过500个字符'
        });
      }
      
      // 位置验证
      if (profileData.location && profileData.location.length > 100) {
        validationErrors.push({
          field: 'location',
          message: '位置信息不能超过100个字符'
        });
      }
      
      // 网站验证
      if (profileData.blog && profileData.blog.length > 200) {
        validationErrors.push({
          field: 'blog',
          message: '网站地址不能超过200个字符'
        });
      }
      
      // 网站URL格式验证（简单验证）
      if (profileData.blog && profileData.blog.trim() !== '') {
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        if (!urlPattern.test(profileData.blog)) {
          validationErrors.push({
            field: 'blog',
            message: '请输入有效的网站地址'
          });
        }
      }
      
      // 如果有验证错误，返回错误信息
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: validationErrors.map(e => e.message).join('; ')
        };
      }
      
      // 业务逻辑：检查用户是否存在
      const existingUser = await this.userModel!.getUserById(userId);
      if (!existingUser) {
        return {
          success: false,
          error: '用户不存在'
        };
      }
      
      // 准备更新数据（清理空字符串）
      const updateData: Partial<CreateUserRequest> = {
        name: profileData.name.trim(),
        bio: profileData.bio?.trim() || undefined,
        location: profileData.location?.trim() || undefined,
        blog: profileData.blog?.trim() || undefined,
        company: profileData.company?.trim() || undefined
      };
      
      // 更新用户信息
      const updatedUser = await this.userModel!.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return {
          success: false,
          error: '更新个人资料失败'
        };
      }
      
      // 返回更新后的个人资料数据
      return {
        success: true,
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          bio: updatedUser.bio,
          location: updatedUser.location,
          blog: updatedUser.blog,
          company: updatedUser.company
        }
      };
    } catch (error) {
      console.error('更新个人资料失败:', error);
      return {
        success: false,
        error: '更新个人资料时发生错误'
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
    } catch {
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
    } catch {
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
    const startTime = Date.now();
    const userIdNum = Number.parseInt(userId);
    
    try {
      await this.init();
      
      console.log(`📊 开始收集用户 ${userId} 的 GitHub 数据...`);
      
      // 步骤 1: 获取完整的 GitHub 数据
      console.log(`📡 正在调用 GitHub API 获取用户数据...`);
      const githubData = await githubService.collectUserData(accessToken);
      console.log(`✅ GitHub API 调用完成，获取到: ${githubData.repositories.length} 个仓库, ${githubData.organizations.length} 个组织, ${githubData.languages.length} 种语言`);
      
      // 步骤 2: 更新用户基本信息
      console.log(`💾 正在更新用户基本信息...`);
      await this.userModel!.upsertUserByGithub(githubData.profile);
      console.log(`✅ 用户基本信息更新完成`);
      
      // 步骤 3: 保存仓库信息
      console.log(`🏗️  正在保存 ${githubData.repositories.length} 个仓库信息...`);
      const userRepositories = githubService.convertToUserRepositories(userIdNum, githubData.repositories);
      await this.userModel!.saveUserRepositories(userIdNum, userRepositories);
      console.log(`✅ 仓库信息保存完成`);
      
      // 步骤 4: 保存语言统计
      console.log(`🔤 正在保存 ${githubData.languages.length} 种语言统计...`);
      const userLanguages = githubData.languages.map(lang => ({ ...lang, user_id: userIdNum }));
      await this.userModel!.saveUserLanguages(userIdNum, userLanguages);
      console.log(`✅ 语言统计保存完成`);
      
      // 步骤 5: 保存组织信息
      console.log(`🏢 正在保存 ${githubData.organizations.length} 个组织信息...`);
      const userOrganizations = githubService.convertToUserOrganizations(userIdNum, githubData.organizations);
      await this.userModel!.saveUserOrganizations(userIdNum, userOrganizations);
      console.log(`✅ 组织信息保存完成`);
      
      // 步骤 6: 计算统计数据
      console.log(`📊 正在计算用户统计数据...`);
      const statsResult = await statsService.calculateAndSaveUserStats(userIdNum);
      if (statsResult.success) {
        console.log(`✅ 用户统计数据计算完成`);
      } else {
        console.error(`⚠️  用户统计数据计算失败: ${statsResult.error}`);
      }
      
      // 步骤 7: 计算评分
      console.log(`🎯 正在计算用户评分...`);
      const scoreResult = await scoreService.calculateAndSaveUserScore(userIdNum);
      if (scoreResult.success) {
        console.log(`✅ 用户评分计算完成: ${scoreResult.data?.score.toFixed(2)} 分`);
      } else {
        console.error(`⚠️  用户评分计算失败: ${scoreResult.error}`);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`🎉 用户 ${userId} 的 GitHub 数据收集完成! 耗时: ${duration}ms`);
      
      return {
        success: true,
        data: true
      };
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.error(`💥 用户 ${userId} 的 GitHub 数据收集失败! 耗时: ${duration}ms`);
      console.error('错误详情:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : '收集和保存 GitHub 数据失败'
      };
    }
  }

  /**
   * 通过用户名或 ID 获取用户的公开资料
   * 返回脱敏后的用户信息，适合公开查看
   */
  async getUserPublicProfile(identifier: string): Promise<UserServiceResponse<User>> {
    try {
      await this.init();
      
      // 使用新的 getUserByUsernameOrId 方法查找用户
      const user = await this.userModel!.getUserByUsernameOrId(identifier);
      
      if (!user) {
        return {
          success: false,
          error: '用户不存在'
        };
      }
      
      // 业务逻辑：返回公开信息，对敏感信息进行脱敏处理
      const publicProfile: User = {
        ...user,
        email: this.maskEmail(user.email), // 脱敏邮箱
        // 保留公开的字段
        id: user.id,
        name: user.name,
        login: user.login,
        image: user.image,
        bio: user.bio,
        company: user.company,
        location: user.location,
        blog: user.blog,
        public_repos: user.public_repos,
        public_gists: user.public_gists,
        followers: user.followers,
        following: user.following,
        github_created_at: user.github_created_at,
        github_updated_at: user.github_updated_at,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
      
      return {
        success: true,
        data: publicProfile
      };
    } catch (error) {
      console.error('获取用户公开资料失败:', error);
      return {
        success: false,
        error: '获取用户公开资料失败'
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