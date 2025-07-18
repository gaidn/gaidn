/**
 * 单个用户 API 路由 - /api/users/[id]
 * 遵循架构原则：只处理 HTTP 相关逻辑，业务逻辑委托给服务层
 */

import { type NextRequest, NextResponse } from 'next/server';
import { userService } from '@/services/user.service';
import type { CreateUserRequest, ApiResponse } from '@/types/user';

/**
 * GET /api/users/[id] - 获取指定用户信息
 * 支持通过数字 ID 或 GitHub 用户名查找用户
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // API 层职责：参数解析和验证
    const resolvedParams = await params;
    const identifier = resolvedParams.id;
    
    if (!identifier || identifier.trim() === '') {
      const response: ApiResponse = {
        success: false,
        error: '用户标识符不能为空'
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    // 检查 URL 参数，如果包含查询参数 public=true，则返回公开资料
    const url = new URL(request.url);
    const isPublicRequest = url.searchParams.get('public') === 'true';
    
    if (isPublicRequest) {
      const result = await userService.getUserPublicProfile(identifier);
      
      if (!result.success) {
        const statusCode = result.error?.includes('不存在') ? 404 : 500;
        const response: ApiResponse = {
          success: false,
          error: result.error || '获取用户失败'
        };
        return NextResponse.json(response, { status: statusCode });
      }
      
      const response: ApiResponse = {
        success: true,
        data: result.data
      };
      return NextResponse.json(response);
    }
    
    // 保持原有逻辑：通过数字 ID 查找
    const id = Number.parseInt(identifier);
    if (isNaN(id) || id <= 0) {
      const response: ApiResponse = {
        success: false,
        error: '无效的用户ID'
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    // 调用服务层获取所有用户
    const result = await userService.getAllUsers();
    
    if (!result.success || !result.data) {
      const response: ApiResponse = {
        success: false,
        error: '获取用户失败'
      };
      return NextResponse.json(response, { status: 500 });
    }
    
    // 查找指定用户
    const user = result.data.find(u => u.id === id);
    
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: '用户不存在'
      };
      return NextResponse.json(response, { status: 404 });
    }
    
    const response: ApiResponse = {
      success: true,
      data: user
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('获取用户失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取用户失败'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * PUT /api/users/[id] - 更新用户信息
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // API 层职责：参数解析和验证
    const resolvedParams = await params;
    const id = Number.parseInt(resolvedParams.id);
    
    if (isNaN(id) || id <= 0) {
      const response: ApiResponse = {
        success: false,
        error: '无效的用户ID'
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    const body: Partial<CreateUserRequest> = await request.json();
    
    // 这里可以从认证中间件获取请求用户ID
    // const requestUserId = getAuthenticatedUserId(request);
    // 暂时不实现权限检查
    
    // 调用服务层处理业务逻辑
    const result = await userService.updateUser(id, body);
    
    if (!result.success) {
      const statusCode = result.error?.includes('不存在') ? 404 : 400;
      const response: ApiResponse = {
        success: false,
        error: result.error
      };
      return NextResponse.json(response, { status: statusCode });
    }
    
    const response: ApiResponse = {
      success: true,
      data: result.data
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('更新用户失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '更新用户失败'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * DELETE /api/users/[id] - 删除用户
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // API 层职责：参数解析和验证
    const resolvedParams = await params;
    const id = Number.parseInt(resolvedParams.id);
    
    if (isNaN(id) || id <= 0) {
      const response: ApiResponse = {
        success: false,
        error: '无效的用户ID'
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    // 这里可以从认证中间件获取请求用户ID
    // const requestUserId = getAuthenticatedUserId(request);
    
    // 调用服务层处理业务逻辑
    const result = await userService.deleteUser(id);
    
    if (!result.success) {
      const statusCode = result.error?.includes('不存在') ? 404 : 400;
      const response: ApiResponse = {
        success: false,
        error: result.error
      };
      return NextResponse.json(response, { status: statusCode });
    }
    
    const response: ApiResponse = {
      success: true,
      data: result.data
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('删除用户失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '删除用户失败'
    };
    return NextResponse.json(response, { status: 500 });
  }
}