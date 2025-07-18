/**
 * 个人资料 API 路由 - /api/profile
 * 专门用于当前登录用户的个人资料管理
 */

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { userService } from '@/services/user.service';
import type { ProfileUpdateRequest, ProfileApiResponse } from '@/types/profile';
import type { User } from '@/types/user';

/**
 * GET /api/profile - 获取当前用户的个人资料
 */
export async function GET(): Promise<NextResponse> {
  try {
    // 验证用户是否已登录
    const session = await auth();
    if (!session?.user?.id) {
      const response: ProfileApiResponse = {
        success: false,
        error: '用户未登录'
      };
      return NextResponse.json(response, { status: 401 });
    }

    // 获取用户完整信息
    const result = await userService.getAllUsers();
    if (!result.success || !result.data) {
      const response: ProfileApiResponse = {
        success: false,
        error: '获取用户信息失败'
      };
      return NextResponse.json(response, { status: 500 });
    }

    // 查找当前用户
    const currentUser = result.data.find(u => u.id === session.user.id);
    if (!currentUser) {
      const response: ProfileApiResponse = {
        success: false,
        error: '用户不存在'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // 返回个人资料数据
    const response: ProfileApiResponse<User> = {
      success: true,
      data: currentUser
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('获取个人资料失败:', error);
    const response: ProfileApiResponse = {
      success: false,
      error: '获取个人资料失败'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * PUT /api/profile - 更新当前用户的个人资料
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    // 验证用户是否已登录
    const session = await auth();
    if (!session?.user?.id) {
      const response: ProfileApiResponse = {
        success: false,
        error: '用户未登录'
      };
      return NextResponse.json(response, { status: 401 });
    }

    // 解析请求体
    const body: ProfileUpdateRequest = await request.json();
    
    // API 层职责：基础参数验证
    if (!body.name || typeof body.name !== 'string') {
      const response: ProfileApiResponse = {
        success: false,
        error: '显示名称是必需的'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 调用服务层处理个人资料更新
    const result = await userService.updateCurrentUserProfile(session.user.id, body);

    if (!result.success) {
      const response: ProfileApiResponse = {
        success: false,
        error: result.error
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 返回更新后的个人资料
    const response: ProfileApiResponse = {
      success: true,
      data: result.data
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('更新个人资料失败:', error);
    const response: ProfileApiResponse = {
      success: false,
      error: '更新个人资料失败'
    };
    return NextResponse.json(response, { status: 500 });
  }
}