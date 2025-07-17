import NextAuth from "next-auth"
import { authOptions } from "./config"

// 确保在 Cloudflare 环境中正确初始化
try {
  // 检查环境变量是否存在
  if (!process.env.NEXTAUTH_SECRET) {
    console.warn("警告: NEXTAUTH_SECRET 环境变量未设置，这可能导致认证问题")
  }
  
  if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) {
    console.warn("警告: GitHub OAuth 环境变量未正确设置")
  }
} catch (error) {
  console.error("NextAuth 初始化错误:", error)
}

// 创建 NextAuth 实例
const nextAuthInstance = NextAuth(authOptions)

export const { handlers, signIn, signOut, auth } = nextAuthInstance 