/**
 * GitHub 数据收集 API
 * 在用户登录后收集完整的 GitHub 数据
 */

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { userService } from '@/services/user.service';

export async function POST(_request: NextRequest): Promise<NextResponse> {
  console.log('🚀 收到 GitHub 数据收集请求...');
  
  try {
    // 验证用户是否已登录
    const session = await auth();
    if (!session?.user?.id) {
      console.error('❌ 用户未登录');
      return NextResponse.json(
        { success: false, error: '用户未登录' },
        { status: 401 }
      );
    }

    console.log(`👤 用户 ${session.user.id} (${session.user.email}) 请求数据收集`);

    // 从 session 中获取 accessToken
    const sessionWithToken = session as { accessToken?: string };
    const accessToken = sessionWithToken.accessToken;

    if (!accessToken) {
      console.error('❌ 缺少 GitHub access token');
      return NextResponse.json(
        { success: false, error: '缺少 GitHub access token，请重新登录' },
        { status: 400 }
      );
    }

    console.log(`🔑 已找到 GitHub access token`);
    console.log(`📊 开始为用户 ${session.user.id} 收集 GitHub 数据...`);

    // 收集并保存 GitHub 数据
    const result = await userService.collectAndSaveGitHubData(
      session.user.id.toString(),
      accessToken
    );

    if (!result.success) {
      console.error(`❌ 用户 ${session.user.id} 的 GitHub 数据收集失败:`, result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log(`✅ 用户 ${session.user.id} 的 GitHub 数据收集完成`);

    return NextResponse.json({
      success: true,
      message: 'GitHub 数据收集完成',
      data: result.data
    });

  } catch (error) {
    console.error('💥 GitHub 数据收集 API 异常:', error);
    
    // 提供更详细的错误信息
    let errorMessage = '服务器内部错误';
    if (error instanceof Error) {
      if (error.message.includes('数据库连接失败')) {
        errorMessage = '数据库连接失败，请稍后重试';
      } else if (error.message.includes('GitHub API')) {
        errorMessage = 'GitHub API 调用失败，请稍后重试';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'GitHub API 请求频率过高，请稍后重试';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
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