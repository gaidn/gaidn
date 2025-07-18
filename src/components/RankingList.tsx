"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trophy, Star, GitFork, Calendar, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { RankingUser, RankingResponse } from "@/types/scoring";

interface RankingListProps {
  initialPage?: number;
  initialLimit?: number;
}

export function RankingList({ initialPage = 1, initialLimit = 10 }: RankingListProps): JSX.Element {
  const [users, setUsers] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [algorithmVersion, _setAlgorithmVersion] = useState("V1");

  const fetchRankings = useCallback(async (currentPage: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const url = `/api/rankings?page=${currentPage}&limit=${limit}&algorithm_version=${algorithmVersion}`;
      console.log(`🔍 [前端] 发送排行榜请求: ${url}`);
      console.log(`📊 [前端] 请求参数: page=${currentPage}, limit=${limit}, algorithm_version=${algorithmVersion}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`📊 [前端] 收到响应: 状态码=${response.status}, OK=${response.ok}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RankingResponse = await response.json();
      console.log(`📊 [前端] 解析响应数据: 成功=${data.success}, 错误=${data.error || '无'}`);

      if (!data.success) {
        throw new Error(data.error || '获取排行榜数据失败');
      }

      if (data.data) {
        console.log(`✅ [前端] 排行榜数据获取成功: ${data.data.users.length} 个用户, 总数=${data.data.pagination.total}`);
        console.log(`📊 [前端] 分页信息: 当前页=${data.data.pagination.page}, 总页数=${data.data.pagination.totalPages}`);
        
        if (data.data.users.length > 0) {
          console.log(`📊 [前端] 第一名用户: ${data.data.users[0].name} (${data.data.users[0].score.toFixed(2)} 分)`);
        }

        setUsers(data.data.users);
        setTotal(data.data.pagination.total);
        setTotalPages(data.data.pagination.totalPages);
        
        // 注意：这里不要重新设置 algorithmVersion，保持请求时的版本
        console.log(`📊 [前端] 状态更新完成: users.length=${data.data.users.length}, total=${data.data.pagination.total}, totalPages=${data.data.pagination.totalPages}`);
      } else {
        console.log(`⚠️ [前端] 响应数据为空`);
      }
    } catch (err) {
      console.error('❌ [前端] 获取排行榜数据失败:', err);
      setError(err instanceof Error ? err.message : '获取排行榜数据失败');
    } finally {
      setLoading(false);
      console.log(`🏁 [前端] 请求处理完成`);
    }
  }, [limit, algorithmVersion]);

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
    fetchRankings(newPage);
  };

  const handleRefresh = (): void => {
    fetchRankings(page);
  };

  useEffect(() => {
    fetchRankings(page);
  }, [page, fetchRankings]);

  if (loading) {
    return (
      <div className="grid gap-4">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-6 rounded-lg border bg-card animate-pulse">
            <div className="h-8 w-8 bg-muted rounded-md"></div>
            <div className="h-12 w-12 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 w-32 bg-muted rounded"></div>
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-4 w-48 bg-muted rounded"></div>
            </div>
            <div className="text-right space-y-2">
              <div className="h-4 w-16 bg-muted rounded"></div>
              <div className="h-4 w-12 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription className="flex items-center justify-between">
          <span>加载排行榜数据时出错: {error}</span>
          <Button onClick={handleRefresh} size="sm">
            重试
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (users.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          暂无排行榜数据。请确保已有用户完成评分计算。
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* 排行榜头部信息 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="text-sm text-muted-foreground">
            共 {total} 名开发者 | 算法版本: {algorithmVersion}
          </span>
        </div>
        <Button onClick={handleRefresh} size="sm" variant="outline">
          刷新
        </Button>
      </div>

      {/* 排行榜列表 */}
      <div className="grid gap-4">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/profile/${user.login || user.id}`}
            className="flex items-center gap-4 p-6 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4 flex-1">
              {/* 排名 */}
              <div className="text-2xl font-bold text-muted-foreground w-8">
                #{user.rank}
              </div>
              
              {/* 用户头像 */}
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold">{user.name[0]}</span>
                )}
              </div>
              
              {/* 用户信息 */}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-muted-foreground">@{user.login || `user${user.id}`}</p>
                
                {/* 用户详细信息 */}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    最后更新: {user.stats.last_updated ? new Date(user.stats.last_updated).toLocaleDateString('zh-CN') : '未知'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* 评分和统计信息 */}
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {user.score.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">评分</div>
              
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Code className="h-3 w-3 mr-1" />
                    {user.stats.total_repos || 0} 仓库
                  </Badge>
                  {user.stats.ai_repos !== undefined && user.stats.ai_repos > 0 && (
                    <Badge variant="outline" className="text-xs">
                      🤖 {user.stats.ai_repos} AI
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {user.stats.stars_sum || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="h-3 w-3" />
                    {user.stats.forks_sum || 0}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 分页导航 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            variant="outline"
            size="sm"
          >
            上一页
          </Button>
          
          <div className="flex items-center gap-1">
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const pageNumber = i + 1;
              return (
                <Button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  variant={page === pageNumber ? "default" : "ghost"}
                  size="sm"
                  className="w-8 h-8"
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>
          
          <Button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            variant="outline"
            size="sm"
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
}