import { redirect } from "next/navigation";
import { auth } from "@/auth";

interface ProfilePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps): Promise<void> {
  const { locale } = await params;
  const session = await auth();
  
  if (!session?.user?.name) {
    // 如果用户未登录，重定向到登录页面
    redirect(`/${locale}/auth/signin`);
  }
  
  // 如果用户已登录，重定向到用户的个人资料页面
  redirect(`/${locale}/profile/${session.user.name}`);
} 