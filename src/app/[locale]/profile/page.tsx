import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function ProfilePage(): Promise<never> {
  const session = await auth();
  
  if (!session?.user?.name) {
    // 如果用户未登录，重定向到登录页面
    redirect("/auth/signin");
  }
  
  // 如果用户已登录，重定向到用户的个人资料页面
  redirect(`/profile/${session.user.name}`);
} 