import type { AdapterUser } from "next-auth/adapters";
import type { Account, User } from "next-auth";
import { userService } from "@/services/user.service";

/**
 * 处理用户登录，整合数据库操作
 */
export async function handleSignInUser(
  user: User | AdapterUser,
  account: Account
): Promise<User> {
  console.log(`🔐 开始处理用户登录，账户类型: ${account.provider}`);
  
  try {
    // 参数验证
    if (!user.email) {
      console.error("❌ 用户邮箱为空");
      throw new Error("无效的登录用户：缺少邮箱");
    }
    if (!account.type || !account.provider || !account.providerAccountId) {
      console.error("❌ 账户信息不完整", { type: account.type, provider: account.provider, providerAccountId: account.providerAccountId });
      throw new Error("无效的登录账号：缺少必要字段");
    }

    // 根据 GitHub 账户信息创建或更新用户
    if (account.provider === 'github') {
      const profile = {
        name: user.name || 'GitHub User',
        email: user.email,
        image: user.image || undefined,
        id: account.providerAccountId
      };

      console.log(`👤 准备处理 GitHub 用户: ${profile.email} (GitHub ID: ${profile.id})`);

      // 调用服务层处理用户
      try {
        const result = await userService.upsertUserByGithub(profile);
        
        if (!result.success || !result.data) {
          console.error("❌ GitHub 用户处理失败:", result.error);
          throw new Error(result.error || "GitHub 用户处理失败");
        }
        
        console.log(`✅ GitHub 用户处理成功: ${result.data.name} (数据库 ID: ${result.data.id})`);
        
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
      } catch (serviceError) {
        console.error("💥 用户服务调用异常:", serviceError);
        
        // 检查是否是数据库连接问题
        if (serviceError instanceof Error) {
          if (serviceError.message.includes('数据库连接失败')) {
            throw new Error("数据库连接失败，请稍后重试");
          } else if (serviceError.message.includes('迁移失败')) {
            throw new Error("数据库初始化失败，请联系管理员");
          }
        }
        
        throw serviceError;
      }
    }

    // 其他登录方式处理
    console.error(`❌ 不支持的登录方式: ${account.provider}`);
    throw new Error(`不支持的登录方式: ${account.provider}`);
  } catch (e) {
    console.error("🚨 处理用户登录失败:", e);
    throw e;
  }
} 