import { AdapterUser } from "next-auth/adapters";
import { Account, User } from "next-auth";
import { User as UserType } from "@/types/user";
import { userService } from "@/services/user.service";

/**
 * 处理用户登录，整合数据库操作
 */
export async function handleSignInUser(
  user: User | AdapterUser,
  account: Account
): Promise<User> {
  try {
    if (!user.email) {
      throw new Error("无效的登录用户");
    }
    if (!account.type || !account.provider || !account.providerAccountId) {
      throw new Error("无效的登录账号");
    }

    // 根据 GitHub 账户信息创建或更新用户
    if (account.provider === 'github') {
      const profile = {
        name: user.name || 'GitHub User',
        email: user.email,
        image: user.image || undefined,
        id: account.providerAccountId
      };

      console.log("处理 GitHub 登录:", profile.email);
      
      // 调用服务层处理用户
      const result = await userService.upsertUserByGithub(profile);
      
      if (!result.success || !result.data) {
        console.error("GitHub 用户处理失败:", result.error);
        throw new Error(result.error || "GitHub 用户处理失败");
      }
      
      console.log("用户登录成功:", result.data.email);
      
      // 将数据库用户转换为 NextAuth 用户
      const authUser: User = {
        id: result.data.id,
        name: result.data.name,
        email: result.data.email,
        image: result.data.image,
        github_id: result.data.github_id,
        created_at: result.data.created_at
      };
      
      return authUser;
    }

    // 其他登录方式处理
    throw new Error("不支持的登录方式");
  } catch (e) {
    console.error("处理用户登录失败:", e);
    throw e;
  }
} 