import PageLayout from "@/components/PageLayout";
import Link from "next/link";

export default function Leaderboard(): JSX.Element {
  // 模拟数据
  const users = [
    {
      id: 1,
      name: "张三",
      username: "zhangsan",
      tagline: "全栈开发者，专注于AI和Web技术",
      avatar: "https://github.com/identicons/zhangsan.png",
      joinedAt: "2024-01-15"
    },
    {
      id: 2,
      name: "李四",
      username: "lisi",
      tagline: "机器学习工程师，热爱开源项目",
      avatar: "https://github.com/identicons/lisi.png",
      joinedAt: "2024-02-20"
    },
    {
      id: 3,
      name: "王五",
      username: "wangwu",
      tagline: "前端开发者，UI/UX设计爱好者",
      avatar: "https://github.com/identicons/wangwu.png",
      joinedAt: "2024-03-10"
    }
  ];

  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold">开发者排行榜</h1>
          <p className="text-lg text-muted-foreground mt-2">
            发现优秀的 AI 开发者，按注册时间排序
          </p>
        </div>

        <div className="grid gap-4">
          {users.map((user, index) => (
            <Link 
              key={user.id} 
              href={`/profile/${user.username}`}
              className="flex items-center gap-4 p-6 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="text-2xl font-bold text-muted-foreground w-8">
                  #{index + 1}
                </div>
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-lg font-semibold">{user.name[0]}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-muted-foreground">@{user.username}</p>
                  <p className="text-sm text-muted-foreground mt-1">{user.tagline}</p>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>加入时间</div>
                <div>{user.joinedAt}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageLayout>
  );
} 