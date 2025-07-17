import PageLayout from "@/components/PageLayout";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps): Promise<JSX.Element> {
  const { username } = await params;
  
  // 模拟用户数据
  const user = {
    username: username,
    name: "张三",
    tagline: "全栈开发者，专注于AI和Web技术",
    avatar: "https://github.com/identicons/zhangsan.png",
    joinedAt: "2024-01-15",
    bio: "热爱编程，专注于人工智能和Web开发。喜欢开源项目，致力于构建更好的开发者社区。",
    stats: {
      repositories: 25,
      followers: 120,
      following: 85
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 用户信息卡片 */}
        <div className="bg-card border rounded-lg p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <span className="text-3xl font-semibold">{user.name[0]}</span>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground text-lg">@{user.username}</p>
                <p className="text-lg mt-2">{user.tagline}</p>
              </div>
              <p className="text-muted-foreground">{user.bio}</p>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-semibold">{user.stats.repositories}</span>
                  <span className="text-muted-foreground ml-1">仓库</span>
                </div>
                <div>
                  <span className="font-semibold">{user.stats.followers}</span>
                  <span className="text-muted-foreground ml-1">关注者</span>
                </div>
                <div>
                  <span className="font-semibold">{user.stats.following}</span>
                  <span className="text-muted-foreground ml-1">关注中</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                加入时间：{user.joinedAt}
              </div>
            </div>
          </div>
        </div>

        {/* 技能标签 */}
        <div className="bg-card border rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">技能标签</h2>
          <div className="flex flex-wrap gap-2">
            {["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "Machine Learning", "AI", "Web Development"].map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* 最近活动 */}
        <div className="bg-card border rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">最近活动</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs">📝</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">创建了新的仓库</p>
                <p className="text-sm text-muted-foreground">ai-project-demo</p>
              </div>
              <span className="text-sm text-muted-foreground">2天前</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs">⭐</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">给项目点了星标</p>
                <p className="text-sm text-muted-foreground">awesome-ai-tools</p>
              </div>
              <span className="text-sm text-muted-foreground">1周前</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs">🔧</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">提交了代码</p>
                <p className="text-sm text-muted-foreground">修复了登录功能</p>
              </div>
              <span className="text-sm text-muted-foreground">2周前</span>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 