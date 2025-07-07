import NextAuth from "next-auth"
import { authOptions } from "./config"

// 确保在 Cloudflare 环境中正确初始化
try {
  // 检查环境变量是否存在
  console.log("NextAuth 初始化 - 环境变量检查开始")
  console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL)
  
  if (!process.env.NEXTAUTH_SECRET) {
    console.warn("警告: NEXTAUTH_SECRET 环境变量未设置，这可能导致认证问题")
  } else {
    console.log("NEXTAUTH_SECRET 已设置")
  }
  
  if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) {
    console.warn("警告: GitHub OAuth 环境变量未正确设置")
  } else {
    console.log("GitHub OAuth 环境变量检查: ID 和 SECRET 已设置")
    // 不打印具体值，避免泄露敏感信息
    console.log("GITHUB_ID 长度:", process.env.GITHUB_ID?.length)
    console.log("GITHUB_SECRET 长度:", process.env.GITHUB_SECRET?.length)
  }
  
  console.log("NextAuth 初始化 - 环境变量检查完成")
} catch (error) {
  console.error("NextAuth 初始化错误:", error)
}

// 添加更多的调试信息
const nextAuthInstance = NextAuth(authOptions)
console.log("NextAuth 实例创建完成，可用处理程序:", Object.keys(nextAuthInstance))

export const { handlers, signIn, signOut, auth } = nextAuthInstance 