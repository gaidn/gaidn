/**
 * 用户统计数据 API 路由
 * GET /api/stats - 获取统计概览
 * POST /api/stats/calculate - 计算用户统计数据
 */

import { NextRequest, NextResponse } from 'next/server';
import { statsService } from '@/services/stats.service';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      // 获取特定用户的统计数据
      const userIdNum = parseInt(userId);
      if (isNaN(userIdNum)) {
        return NextResponse.json({
          success: false,
          error: '用户ID格式错误'
        }, { status: 400 });
      }

      const result = await statsService.getUserStats(userIdNum);
      return NextResponse.json(result, { 
        status: result.success ? 200 : 404 
      });
    } else {
      // 获取统计概览
      const result = await statsService.getStatsOverview();
      return NextResponse.json(result, { 
        status: result.success ? 200 : 500 
      });
    }

  } catch (error) {
    console.error('统计数据API错误:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as {
      userId?: string;
      userIds?: string[];
    };
    const { userId, userIds } = body;

    if (userId) {
      // 计算单个用户的统计数据
      const userIdNum = parseInt(userId);
      if (isNaN(userIdNum)) {
        return NextResponse.json({
          success: false,
          error: '用户ID格式错误'
        }, { status: 400 });
      }

      const result = await statsService.calculateAndSaveUserStats(userIdNum);
      return NextResponse.json(result, { 
        status: result.success ? 200 : 500 
      });

    } else if (userIds && Array.isArray(userIds)) {
      // 批量计算用户统计数据
      const userIdNums = userIds.map(id => parseInt(id)).filter(id => !isNaN(id));
      if (userIdNums.length === 0) {
        return NextResponse.json({
          success: false,
          error: '没有有效的用户ID'
        }, { status: 400 });
      }

      const result = await statsService.batchCalculateUserStats(userIdNums);
      return NextResponse.json(result, { 
        status: result.success ? 200 : 500 
      });

    } else {
      return NextResponse.json({
        success: false,
        error: '请提供userId或userIds参数'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('统计数据计算API错误:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}