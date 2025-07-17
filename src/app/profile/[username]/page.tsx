import PageLayout from "@/components/PageLayout";
import GitHubProfile from "@/components/GitHubProfile";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDB } from "@/lib/db";
import { UserModel } from "@/models/user";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps): Promise<JSX.Element> {
  const { username } = await params;
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }
  
  // 获取完整的用户信息
  const db = await getDB();
  const userModel = new UserModel(db);
  
  // 根据用户名查找用户（这里简化处理，实际应该通过 login 字段查找）
  const user = await userModel.getUserById(session.user.id);
  
  if (!user) {
    redirect('/auth/signin');
  }
  
  // 检查是否是用户自己的资料页面
  const isOwnProfile = user.login === username || user.name === username;

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isOwnProfile ? '我的资料' : `${user.name} 的资料`}
          </h1>
          <p className="text-gray-600">
            {isOwnProfile ? '查看您的 GitHub 数据和个人信息' : `查看 ${user.name} 的 GitHub 数据和个人信息`}
          </p>
        </div>
        
        {/* 使用新的 GitHubProfile 组件 */}
        <GitHubProfile user={user} />
      </div>
    </PageLayout>
  );
} 