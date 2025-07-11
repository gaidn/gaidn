import { AdapterUser } from "next-auth/adapters";
import { Account, User } from "next-auth";
import { v4 as uuidv4 } from 'uuid';
import { User as UserType } from "@/types/user";

export async function handleSignInUser(
  user: User | AdapterUser,
  account: Account
): Promise<UserType | null> {
  try {
    if (!user.email) {
      throw new Error("无效的登录用户");
    }
    if (!account.type || !account.provider || !account.providerAccountId) {
      throw new Error("无效的登录账号");
    }

    const userInfo: UserType = {
      uuid: uuidv4(),
      email: user.email,
      nickname: user.name || "",
      avatar_url: user.image || "",
      signin_type: account.type,
      signin_provider: account.provider,
      signin_openid: account.providerAccountId,
      created_at: new Date(),
      signin_ip: "127.0.0.1", // 简化版本，实际应该获取真实 IP
      githubUsername: account.provider === 'github' ? (user.name || undefined) : undefined
    };

    // 这里应该有保存用户到数据库的逻辑
    // 简化版本，直接返回用户信息
    console.log("用户登录成功:", userInfo);

    return userInfo;
  } catch (e) {
    console.error("处理用户登录失败:", e);
    throw e;
  }
} 