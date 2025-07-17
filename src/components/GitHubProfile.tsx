/**
 * GitHub 用户档案展示组件
 * 显示用户的 GitHub 统计信息、仓库和编程语言
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { GitFork, Star, Calendar, ExternalLink, RefreshCw } from 'lucide-react';
import { type GitHubCollectApiResponse } from '@/types/api';

interface GitHubStats {
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  github_created_at: string;
  github_updated_at: string;
}

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  is_private: boolean;
  updated_at: string;
}

interface Language {
  language: string;
  bytes: number;
  percentage: number;
}

interface Organization {
  login: string;
  name: string;
  avatar_url: string;
  description: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface GitHubProfileProps {
  user: {
    id: number;
    name: string;
    login?: string;
    image?: string;
    email: string;
    bio?: string;
    company?: string;
    location?: string;
    blog?: string;
  };
}

export default function GitHubProfile({ user }: GitHubProfileProps): JSX.Element {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingSteps, setLoadingSteps] = useState<string[]>([]);

  const fetchGitHubData = useCallback(async (forceRefresh = false): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadingSteps([]);
      
      // 获取基本统计信息
      setLoadingSteps(prev => [...prev, '正在获取基本统计信息...']);
      console.log('🔄 前端：开始获取基本统计信息');
      const statsResponse = await fetch('/api/github/collect');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json() as ApiResponse<GitHubStats>;
        if (statsData.success && statsData.data) {
          setStats(statsData.data);
          console.log('✅ 前端：基本统计信息获取成功', statsData.data);
        } else {
          console.error('❌ 前端：基本统计信息获取失败', statsData.error);
        }
      } else {
        console.error('❌ 前端：基本统计信息 API 调用失败', statsResponse.status);
      }

      // 获取仓库信息
      setLoadingSteps(prev => [...prev, '正在获取仓库信息...']);
      console.log('🔄 前端：开始获取仓库信息');
      const reposResponse = await fetch(`/api/users/${user.id}/repositories`);
      if (reposResponse.ok) {
        const reposData = await reposResponse.json() as ApiResponse<Repository[]>;
        if (reposData.success && reposData.data) {
          setRepositories(reposData.data);
          console.log('✅ 前端：仓库信息获取成功', `${reposData.data.length} 个仓库`);
        } else {
          console.error('❌ 前端：仓库信息获取失败', reposData.error);
        }
      } else {
        console.error('❌ 前端：仓库信息 API 调用失败', reposResponse.status);
      }

      // 获取语言统计
      setLoadingSteps(prev => [...prev, '正在获取语言统计...']);
      console.log('🔄 前端：开始获取语言统计');
      const languagesResponse = await fetch(`/api/users/${user.id}/languages`);
      if (languagesResponse.ok) {
        const languagesData = await languagesResponse.json() as ApiResponse<Language[]>;
        if (languagesData.success && languagesData.data) {
          setLanguages(languagesData.data);
          console.log('✅ 前端：语言统计获取成功', `${languagesData.data.length} 种语言`);
        } else {
          console.error('❌ 前端：语言统计获取失败', languagesData.error);
        }
      } else {
        console.error('❌ 前端：语言统计 API 调用失败', languagesResponse.status);
      }

      // 获取组织信息
      setLoadingSteps(prev => [...prev, '正在获取组织信息...']);
      console.log('🔄 前端：开始获取组织信息');
      const orgsResponse = await fetch(`/api/users/${user.id}/organizations`);
      if (orgsResponse.ok) {
        const orgsData = await orgsResponse.json() as ApiResponse<Organization[]>;
        if (orgsData.success && orgsData.data) {
          setOrganizations(orgsData.data);
          console.log('✅ 前端：组织信息获取成功', `${orgsData.data.length} 个组织`);
        } else {
          console.error('❌ 前端：组织信息获取失败', orgsData.error);
        }
      } else {
        console.error('❌ 前端：组织信息 API 调用失败', orgsResponse.status);
      }
      
      // 如果没有数据或者强制刷新，则触发数据收集
      const hasData = stats && repositories.length > 0;
      if (!hasData || forceRefresh) {
        setLoadingSteps(prev => [...prev, '正在收集 GitHub 数据...']);
        console.log('🔄 前端：数据不完整，开始异步收集 GitHub 数据');
        
        try {
          const collectResponse = await fetch('/api/github/collect', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (collectResponse.ok) {
            const collectData: GitHubCollectApiResponse = await collectResponse.json();
            if (collectData.success) {
              console.log('✅ 前端：GitHub 数据收集成功，重新获取数据');
              setLoadingSteps(prev => [...prev, '数据收集完成，正在刷新...']);
              
              // 重新获取数据
              await fetchGitHubData(false);
              return;
            } else {
              console.error('❌ 前端：GitHub 数据收集失败', collectData.error);
              setError(`数据收集失败: ${collectData.error}`);
            }
          } else {
            console.error('❌ 前端：GitHub 数据收集 API 调用失败', collectResponse.status);
            setError('数据收集失败，请稍后重试');
          }
        } catch (collectError) {
          console.error('💥 前端：GitHub 数据收集异常:', collectError);
          setError('数据收集失败，请稍后重试');
        }
      }
      
      setLoadingSteps(prev => [...prev, '数据获取完成！']);
      console.log('🎉 前端：所有数据获取完成');
    } catch (error) {
      console.error('💥 前端：获取 GitHub 数据时发生异常:', error);
      setError(error instanceof Error ? error.message : '获取数据时发生未知错误');
    } finally {
      setIsLoading(false);
    }
  }, [user.id, stats, repositories.length]);

  const handleRefresh = async (): Promise<void> => {
    setIsRefreshing(true);
    
    try {
      console.log('🔄 用户点击刷新按钮，开始强制刷新数据');
      // 使用 forceRefresh 参数强制重新收集数据
      await fetchGitHubData(true);
    } catch (error) {
      console.error('刷新数据失败:', error);
      setError('刷新数据失败，请稍后重试');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGitHubData();
  }, [fetchGitHubData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">正在加载 GitHub 数据...</p>
          <div className="space-y-1">
            {loadingSteps.map((step, index) => (
              <p key={index} className="text-sm text-muted-foreground">
                {step}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-red-600">数据加载失败</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => fetchGitHubData(false)} variant="outline">
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 用户基本信息 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              {user.login && (
                <p className="text-muted-foreground">@{user.login}</p>
              )}
              {user.bio && (
                <p className="text-sm text-muted-foreground mt-1">{user.bio}</p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                {user.company && (
                  <span>🏢 {user.company}</span>
                )}
                {user.location && (
                  <span>📍 {user.location}</span>
                )}
                {user.blog && (
                  <a href={user.blog} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    🔗 {user.blog}
                  </a>
                )}
              </div>
            </div>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            刷新数据
          </Button>
        </CardHeader>
      </Card>

      {/* GitHub 统计信息 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.public_repos}</div>
              <p className="text-xs text-muted-foreground">公开仓库</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.followers}</div>
              <p className="text-xs text-muted-foreground">关注者</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.following}</div>
              <p className="text-xs text-muted-foreground">关注中</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.public_gists}</div>
              <p className="text-xs text-muted-foreground">公开代码片段</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 详细信息选项卡 */}
      <Tabs defaultValue="repositories" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="repositories">仓库</TabsTrigger>
          <TabsTrigger value="languages">编程语言</TabsTrigger>
          <TabsTrigger value="organizations">组织</TabsTrigger>
        </TabsList>

        {/* 仓库列表 */}
        <TabsContent value="repositories" className="space-y-4">
          <div className="grid gap-4">
            {repositories.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="text-muted-foreground">暂无仓库数据</p>
                    <p className="text-sm text-muted-foreground">
                      数据可能还在收集中，请稍后刷新页面或点击刷新按钮
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              repositories.map((repo) => (
              <Card key={repo.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg">{repo.name}</h3>
                        {repo.is_private && (
                          <Badge variant="secondary">私有</Badge>
                        )}
                        <a 
                          href={`https://github.com/${repo.full_name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {repo.description || '暂无描述'}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        {repo.language && (
                          <span className="flex items-center">
                            <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Star className="h-4 w-4 mr-1" />
                          {repo.stars}
                        </span>
                        <span className="flex items-center">
                          <GitFork className="h-4 w-4 mr-1" />
                          {repo.forks}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )))}
          </div>
        </TabsContent>

        {/* 编程语言统计 */}
        <TabsContent value="languages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>编程语言统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {languages.length === 0 ? (
                  <div className="text-center space-y-2">
                    <p className="text-muted-foreground">暂无语言统计数据</p>
                    <p className="text-sm text-muted-foreground">
                      数据可能还在收集中，请稍后刷新页面或点击刷新按钮
                    </p>
                  </div>
                ) : (
                  languages.map((lang) => (
                    <div key={lang.language} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        <span className="font-medium">{lang.language}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={lang.percentage} className="w-32" />
                        <span className="text-sm text-muted-foreground">
                          {lang.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 组织列表 */}
        <TabsContent value="organizations" className="space-y-4">
          <div className="grid gap-4">
            {organizations.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="text-muted-foreground">暂无组织数据</p>
                    <p className="text-sm text-muted-foreground">
                      数据可能还在收集中，请稍后刷新页面或点击刷新按钮
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              organizations.map((org) => (
              <Card key={org.login}>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={org.avatar_url} alt={org.name} />
                      <AvatarFallback>{org.login.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{org.name || org.login}</h3>
                      <p className="text-sm text-muted-foreground">@{org.login}</p>
                      {org.description && (
                        <p className="text-sm text-muted-foreground mt-1">{org.description}</p>
                      )}
                    </div>
                    <a 
                      href={`https://github.com/${org.login}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            )))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}