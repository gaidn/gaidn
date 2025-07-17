/**
 * 用户 API 路由
 * 遵循架构原则：只处理 HTTP 相关逻辑，业务逻辑委托给服务层
 */

import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/services/user.service';
import { CreateUserRequest, ApiResponse } from '@/types/user';
import { currentDBType } from '@/lib/db';

/**
 * GET /api/users - 获取用户列表
 */
export async function GET(request: NextRequest) {
  try {
    // API 层职责：解析查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // 基础参数验证（API层职责）
    if (page < 1 || limit < 1 || limit > 100) {
      const response: ApiResponse = {
        success: false,
        error: '无效的分页参数'
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    // 调用服务层处理业务逻辑
    const result = await userService.getAllUsers(page, limit);
    
    if (!result.success) {
      const response: ApiResponse = {
        success: false,
        error: result.error
      };
      return NextResponse.json(response, { status: 500 });
    }
    
    // API 层职责：格式化响应
    const response: ApiResponse = {
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      dbType: currentDBType
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
 * POST /api/users - 创建新用户
 */
export async function POST(request: NextRequest) {
  try {
    // API 层职责：解析请求体
    const body: CreateUserRequest = await request.json();
    
    // 基础参数检查（API层职责）
    if (!body.name || !body.email) {
      const response: ApiResponse = {
        success: false,
        error: '姓名和邮箱都是必填项'
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    // 调用服务层处理业务逻辑（包括验证、重复检查等）
    const result = await userService.createUser(body);
    
    if (!result.success) {
      const response: ApiResponse = {
        success: false,
        error: result.error
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    // API 层职责：格式化响应
    const response: ApiResponse = {
      success: true,
      data: result.data
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('创建用户失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '创建用户失败'
    };
    return NextResponse.json(response, { status: 500 });
  }
}