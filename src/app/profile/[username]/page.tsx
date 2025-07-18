import PageLayout from "@/components/PageLayout";
import ProfileTabs from "@/components/ProfileTabs";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDB } from "@/lib/db";
import { UserModel } from "@/models/user";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps): Promise<JSX.Element> {
  const { username } = await params;
  const { tab: _tab } = await searchParams;
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
      <PageHeader
        title={isOwnProfile ? '我的资料' : `${user.name} 的资料`}
        description={isOwnProfile ? '查看和管理您的个人资料信息' : `查看 ${user.name} 的个人资料信息`}
      />
      
      {/* 使用新的 ProfileTabs 组件 */}
      <ProfileTabs user={user} isOwnProfile={isOwnProfile} />
    </PageLayout>
  );
} 