/**
 * 用户评分 API 路由
 * GET /api/scores - 获取用户评分或排名
 * POST /api/scores/calculate - 计算用户评分
 */

import { NextRequest, NextResponse } from 'next/server';
import { scoreService } from '@/services/score.service';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const algorithmVersion = searchParams.get('algorithmVersion') || 'V1';
    const getRank = searchParams.get('getRank') === 'true';

    if (userId) {
      const userIdNum = parseInt(userId);
      if (isNaN(userIdNum)) {
        return NextResponse.json({
          success: false,
          error: '用户ID格式错误'
        }, { status: 400 });
      }

      if (getRank) {
        // 获取用户排名
        const result = await scoreService.getUserRank(userIdNum, algorithmVersion);
        return NextResponse.json(result, { 
          status: result.success ? 200 : 404 
        });
      } else {
        // 获取用户评分
        const result = await scoreService.getUserScore(userIdNum, algorithmVersion);
        return NextResponse.json(result, { 
          status: result.success ? 200 : 404 
        });
      }
    } else {
      // 获取算法统计信息
      const result = await scoreService.getAlgorithmStats(algorithmVersion);
      return NextResponse.json(result, { 
        status: result.success ? 200 : 500 
      });
    }

  } catch (error) {
    console.error('评分数据API错误:', error);
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
      algorithmVersion?: string;
      action?: string;
    };
    const { userId, userIds, algorithmVersion = 'V1', action } = body;

    if (action === 'recalculate') {
      // 重新计算所有用户评分
      const result = await scoreService.recalculateAllScores(algorithmVersion);
      return NextResponse.json(result, { 
        status: result.success ? 200 : 500 
      });
    }

    if (userId) {
      // 计算单个用户的评分
      const userIdNum = parseInt(userId);
      if (isNaN(userIdNum)) {
        return NextResponse.json({
          success: false,
          error: '用户ID格式错误'
        }, { status: 400 });
      }

      const result = await scoreService.calculateAndSaveUserScore(userIdNum, algorithmVersion);
      return NextResponse.json(result, { 
        status: result.success ? 200 : 500 
      });

    } else if (userIds && Array.isArray(userIds)) {
      // 批量计算用户评分
      const userIdNums = userIds.map(id => parseInt(id)).filter(id => !isNaN(id));
      if (userIdNums.length === 0) {
        return NextResponse.json({
          success: false,
          error: '没有有效的用户ID'
        }, { status: 400 });
      }

      const result = await scoreService.batchCalculateUserScores(userIdNums, algorithmVersion);
      return NextResponse.json(result, { 
        status: result.success ? 200 : 500 
      });

    } else {
      return NextResponse.json({
        success: false,
        error: '请提供userId、userIds或action参数'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('评分计算API错误:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}