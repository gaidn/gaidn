/**
 * 认证错误页面
 * 显示登录过程中发生的错误信息
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';

// 将使用 useSearchParams 的逻辑提取到单独的组件中
function AuthErrorContent(): JSX.Element {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const t = useTranslations('auth.error');

  // 根据错误类型提供友好的错误信息
  const getErrorMessage = (error: string | null): { title: string; description: string } => {
    switch (error) {
      case 'Configuration':
        return {
          title: t('configuration_error.title'),
          description: t('configuration_error.description')
        };
      case 'AccessDenied':
        return {
          title: t('access_denied.title'),
          description: t('access_denied.description')
        };
      case 'Verification':
        return {
          title: t('verification_failed.title'),
          description: t('verification_failed.description')
        };
      case 'Default':
      case 'CallbackRouteError':
        return {
          title: t('login_failed.title'),
          description: t('login_failed.description')
        };
      default:
        return {
          title: t('unknown_error.title'),
          description: t('unknown_error.description')
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
              {t('error_code')}: <code className="font-mono text-red-600">{error}</code>
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
          <Link href="/auth/signin" className="flex-1">
            <Button variant="default" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('retry_login')}
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back_to_home')}
            </Button>
          </Link>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            {t('contact_support')}
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
          {/* Loading text should use common translations */}
          Loading...
        </CardTitle>
        <CardDescription className="mt-2 text-gray-600">
          Processing error information...
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