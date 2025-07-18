/**
 * 排行榜 API 路由
 * GET /api/rankings - 获取排行榜数据
 */

import { NextRequest, NextResponse } from 'next/server';
import { scoreService } from '@/services/score.service';
import type { RankingQuery } from '@/types/scoring';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    
    // 解析查询参数
    const query: RankingQuery = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      algorithm_version: searchParams.get('algorithm_version') || 'V1'
    };

    // 参数验证
    if (query.page && query.page < 1) {
      return NextResponse.json({
        success: false,
        error: '页码必须大于0'
      }, { status: 400 });
    }

    if (query.limit && (query.limit < 1 || query.limit > 100)) {
      return NextResponse.json({
        success: false,
        error: '每页数量必须在1-100之间'
      }, { status: 400 });
    }

    console.log(`📊 API: 获取排行榜数据, 页面: ${query.page}, 限制: ${query.limit}, 算法版本: ${query.algorithm_version}`);

    // 获取排行榜数据
    const result = await scoreService.getRankings(query);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('排行榜API错误:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}