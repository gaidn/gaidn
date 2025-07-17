/**
 * 用户组织 API 路由 - /api/users/[id]/organizations
 * 获取指定用户的 GitHub 组织信息
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { UserModel } from '@/models/user';
import type { ApiResponse } from '@/types/user';

/**
 * GET /api/users/[id]/organizations - 获取用户的 GitHub 组织列表
 */
export async function GET(
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
    
    // 获取数据库实例
    const db = await getDB();
    const userModel = new UserModel(db);
    
    // 检查用户是否存在
    const user = await userModel.getUserById(id);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: '用户不存在'
      };
      return NextResponse.json(response, { status: 404 });
    }
    
    // 获取用户组织信息
    const organizations = await userModel.getUserOrganizations(id);
    
    const response: ApiResponse = {
      success: true,
      data: organizations,
      total: organizations.length
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('获取用户组织失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取用户组织失败'
    };
    return NextResponse.json(response, { status: 500 });
  }
}