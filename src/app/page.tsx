import SimpleNavbar from "@/components/SimpleNavbar";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SimpleNavbar />

      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              GAIDN
            </h1>
            <h2 className="text-xl md:text-2xl text-muted-foreground">
              Global AI Developer Network
            </h2>
            <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              以 GitHub 身份为基础的 AI 开发者网络平台，致力于建立一个去中心化、自由协作、公开透明的开发者生态系统
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/leaderboard" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 rounded-md px-8 bg-primary text-primary-foreground shadow hover:bg-primary/90"
            >
              查看排行榜
            </Link>
            <a 
              href="https://github.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 rounded-md px-8 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
            >
              了解更多
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="space-y-3 p-6 rounded-lg border bg-card">
              <h3 className="text-xl font-semibold">开发者画像</h3>
              <p className="text-muted-foreground">
                基于 GitHub 数据生成个人开发者画像，展示技能和贡献
              </p>
            </div>
            <div className="space-y-3 p-6 rounded-lg border bg-card">
              <h3 className="text-xl font-semibold">社区排行</h3>
              <p className="text-muted-foreground">
                公开透明的排行榜系统，发现优秀的 AI 开发者
              </p>
            </div>
            <div className="space-y-3 p-6 rounded-lg border bg-card">
              <h3 className="text-xl font-semibold">开放协作</h3>
              <p className="text-muted-foreground">
                促进知识共享和协作创新，构建开放的开发者网络
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
