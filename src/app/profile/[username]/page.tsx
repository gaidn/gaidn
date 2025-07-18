import PageLayout from "@/components/PageLayout";
import ProfileTabs from "@/components/ProfileTabs";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
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
  
  // 获取完整的用户信息
  const db = await getDB();
  const userModel = new UserModel(db);
  
  // 根据 URL 中的 username 参数查找目标用户
  const targetUser = await userModel.getUserByUsernameOrId(username);
  
  if (!targetUser) {
    notFound();
  }
  
  // 检查是否是用户自己的资料页面（只有登录用户才能判断）
  const isOwnProfile = session?.user ? targetUser.id === session.user.id : false;

  return (
    <PageLayout>
      <PageHeader
        title={isOwnProfile ? '我的资料' : `${targetUser.name} 的资料`}
        description={isOwnProfile ? '查看和管理您的个人资料信息' : `查看 ${targetUser.name} 的个人资料信息`}
      />
      
      {/* 使用新的 ProfileTabs 组件 */}
      <ProfileTabs user={targetUser} isOwnProfile={isOwnProfile} />
    </PageLayout>
  );
} 