"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { Github, AlertCircle, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useTranslations } from "next-intl";

// 将使用 useSearchParams 的逻辑提取到单独的组件中
function SignInForm(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const t = useTranslations('auth.signin');

  const handleGitHubSignIn = async (): Promise<void> => {
    setIsLoading(true);
    console.log('🔐 用户点击 GitHub 登录按钮');
    
    try {
      await signIn("github", { callbackUrl });
    } catch (error) {
      console.error('💥 GitHub 登录失败:', error);
      setIsLoading(false);
    }
  };

  // 根据错误类型提供友好的错误信息
  const getErrorMessage = (error: string | null): string | null => {
    if (!error) return null;
    
    // 尝试获取对应的错误翻译
    try {
      return t(`errors.${error}`);
    } catch {
      // 如果没有对应的翻译，使用默认错误信息
      return t('errors.Default');
    }
  };

  const errorMessage = getErrorMessage(error);

  return (
    <>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          {t('title')}
        </h2>
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  {t('signInWith')}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <Button
                size="lg"
                className="enhanced-gradient-button w-full flex items-center justify-center gap-3 px-8 py-6 text-lg font-semibold text-white"
                onClick={handleGitHubSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Github className="h-5 w-5" />
                )}
                <span>
                  {isLoading ? t('signingIn') : t('githubButton')}
                </span>
              </Button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                {t('dataNotice')}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {t('permissionNotice')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// 加载状态组件
function SignInLoading(): JSX.Element {
  const t = useTranslations('auth.signin');
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          {t('title')}
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 主页面组件，使用 Suspense 包装 SignInForm
export default function SignInPage(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<SignInLoading />}>
        <SignInForm />
      </Suspense>
    </div>
  );
} 