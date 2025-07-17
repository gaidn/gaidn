/**
 * GitHub 数据收集 API
 * 在用户登录后收集完整的 GitHub 数据
 */

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { userService } from '@/services/user.service';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 验证用户是否已登录
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '用户未登录' },
        { status: 401 }
      );
    }

    // 获取请求体
    const body = await request.json() as { accessToken?: string };
    let { accessToken } = body;

    // 如果没有提供 accessToken，尝试从 session 中获取
    if (!accessToken || accessToken === 'from-session') {
      const sessionWithToken = session as { accessToken?: string };
      accessToken = sessionWithToken.accessToken;
    }

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: '缺少 GitHub access token' },
        { status: 400 }
      );
    }

    console.log(`开始为用户 ${session.user.id} 收集 GitHub 数据...`);

    // 收集并保存 GitHub 数据
    const result = await userService.collectAndSaveGitHubData(
      session.user.id.toString(),
      accessToken
    );

    if (!result.success) {
      console.error('收集 GitHub 数据失败:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log(`用户 ${session.user.id} 的 GitHub 数据收集完成`);

    return NextResponse.json({
      success: true,
      message: 'GitHub 数据收集完成',
      data: result.data
    });

  } catch (error) {
    console.error('GitHub 数据收集 API 错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '服务器内部错误',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// 获取用户的 GitHub 数据统计
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // 验证用户是否已登录
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '用户未登录' },
        { status: 401 }
      );
    }

    const _userId = session.user.id;

    // 获取用户的 GitHub 数据统计
    const user = await userService.getUserByEmail(session.user.email!);
    
    if (!user.success || !user.data) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    // 这里可以添加更多的统计信息
    const stats = {
      public_repos: user.data.public_repos || 0,
      public_gists: user.data.public_gists || 0,
      followers: user.data.followers || 0,
      following: user.data.following || 0,
      github_created_at: user.data.github_created_at,
      github_updated_at: user.data.github_updated_at
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('获取 GitHub 数据统计 API 错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '服务器内部错误',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}