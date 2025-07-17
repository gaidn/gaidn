/**
 * 认证错误页面
 * 显示登录过程中发生的错误信息
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

// 将使用 useSearchParams 的逻辑提取到单独的组件中
function AuthErrorContent(): JSX.Element {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  // 根据错误类型提供友好的错误信息
  const getErrorMessage = (error: string | null): { title: string; description: string } => {
    switch (error) {
      case 'Configuration':
        return {
          title: '配置错误',
          description: '认证服务配置有误，请联系系统管理员。'
        };
      case 'AccessDenied':
        return {
          title: '访问被拒绝',
          description: '您没有权限访问此应用程序。'
        };
      case 'Verification':
        return {
          title: '验证失败',
          description: '验证链接无效或已过期，请重新尝试。'
        };
      case 'Default':
      case 'CallbackRouteError':
        return {
          title: '登录失败',
          description: '登录过程中发生错误，可能是数据库连接问题或服务器繁忙。请稍后重试。'
        };
      default:
        return {
          title: '未知错误',
          description: '发生了未知错误，请稍后重试或联系支持团队。'
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="mt-4 text-2xl font-bold text-gray-900">
          {errorInfo.title}
        </CardTitle>
        <CardDescription className="mt-2 text-gray-600">
          {errorInfo.description}
        </CardDescription>
        {error && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-600">
              错误代码: <code className="font-mono text-red-600">{error}</code>
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
          <Link href="/auth/signin" className="flex-1">
            <Button variant="default" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              重新登录
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </Link>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            如果问题持续存在，请联系技术支持
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// 加载状态组件
function AuthErrorLoading(): JSX.Element {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
          <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
        </div>
        <CardTitle className="mt-4 text-2xl font-bold text-gray-900">
          加载中...
        </CardTitle>
        <CardDescription className="mt-2 text-gray-600">
          正在处理错误信息
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

// 主页面组件，使用 Suspense 包装 AuthErrorContent
export default function AuthErrorPage(): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Suspense fallback={<AuthErrorLoading />}>
          <AuthErrorContent />
        </Suspense>
      </div>
    </div>
  );
}