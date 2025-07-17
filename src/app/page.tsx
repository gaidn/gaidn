import { UserInfo } from "@/components/UserInfo";
import { auth } from "@/auth";
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";

export default async function Home(): Promise<JSX.Element> {
  const session = await auth();

  return (
    <PageLayout pattern="grid">
      <PageHeader
        title="欢迎来到 GAIDN"
        description="Global AI Developer Network - 连接全球 AI 开发者的社区平台"
      >
        <div className="mt-6">
          {session ? (
            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">欢迎回来！</h2>
              <div className="flex items-center justify-center">
                <UserInfo />
              </div>
            </div>
          ) : (
            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">开始您的 AI 开发者之旅</h2>
              <div className="flex items-center justify-center">
                <UserInfo />
              </div>
            </div>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/profile" className="group block bg-card/50 backdrop-blur-sm p-6 rounded-lg border hover:shadow-md hover:border-primary/20 transition-all duration-300">
          <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">个人资料</h2>
          <p className="text-muted-foreground">查看和管理您的个人资料信息。</p>
        </Link>

        <Link href="/leaderboard" className="group block bg-card/50 backdrop-blur-sm p-6 rounded-lg border hover:shadow-md hover:border-primary/20 transition-all duration-300">
          <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">排行榜</h2>
          <p className="text-muted-foreground">查看开发者排名和贡献情况。</p>
        </Link>
      </div>
    </PageLayout>
  );
}
