import { UserInfo } from "@/components/UserInfo";
import { auth } from "@/auth";
import PageLayout from "@/components/PageLayout";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">欢迎来到 GAIDN - Global AI Developer Network</h1>
        
        <div className="mb-8">
          {session ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">已登录用户</h2>
              <UserInfo />
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">请登录</h2>
              <UserInfo />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/profile" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">个人资料</h2>
            <p className="text-gray-600">查看和编辑您的个人资料信息。</p>
          </Link>

          <Link href="/leaderboard" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">排行榜</h2>
            <p className="text-gray-600">查看开发者排名和贡献情况。</p>
          </Link>

          <Link href="/settings" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">设置</h2>
            <p className="text-gray-600">管理您的账户设置和偏好。</p>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
