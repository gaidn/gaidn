import { GitHubLoginButton } from '@/auth/github'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录到您的账户
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            使用您的 GitHub 账号快速登录
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex justify-center">
            <GitHubLoginButton 
              size="lg"
              className="w-full max-w-xs"
            />
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">
              登录即表示您同意我们的服务条款和隐私政策
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 