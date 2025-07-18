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

    console.log(`📊 [API路由] 收到排行榜请求: URL=${request.url}`);
    console.log(`📊 [API路由] 解析参数: page=${query.page}, limit=${query.limit}, algorithm_version=${query.algorithm_version}`);

    // 参数验证
    if (query.page && query.page < 1) {
      console.log(`❌ [API路由] 参数验证失败: 页码 ${query.page} 必须大于0`);
      return NextResponse.json({
        success: false,
        error: '页码必须大于0'
      }, { status: 400 });
    }

    if (query.limit && (query.limit < 1 || query.limit > 100)) {
      console.log(`❌ [API路由] 参数验证失败: 限制 ${query.limit} 必须在1-100之间`);
      return NextResponse.json({
        success: false,
        error: '每页数量必须在1-100之间'
      }, { status: 400 });
    }

    console.log(`📊 [API路由] API: 获取排行榜数据, 页面: ${query.page}, 限制: ${query.limit}, 算法版本: ${query.algorithm_version}`);

    // 获取排行榜数据
    console.log(`🔍 [API路由] 调用 scoreService.getRankings...`);
    const result = await scoreService.getRankings(query);
    console.log(`📊 [API路由] scoreService.getRankings 返回: 成功=${result.success}, 错误=${result.error || '无'}`);

    if (!result.success) {
      console.log(`❌ [API路由] 服务层返回错误: ${result.error}`);
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    if (result.data) {
      console.log(`✅ [API路由] 排行榜数据获取成功: ${result.data.users.length} 个用户, 总数=${result.data.pagination.total}`);
      if (result.data.users.length > 0) {
        console.log(`📊 [API路由] 第一名用户: ${result.data.users[0].name} (${result.data.users[0].score.toFixed(2)} 分)`);
      }
    } else {
      console.log(`⚠️ [API路由] 返回数据为空`);
    }

    const response = NextResponse.json(result, { status: 200 });
    console.log(`🎉 [API路由] 响应已发送: 状态码=200`);
    return response;

  } catch (error) {
    console.error('❌ [API路由] 排行榜API错误:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}