import { handlers } from "@/auth"
import { NextRequest } from "next/server"

// 添加错误处理和日志记录
console.log("NextAuth 路由处理程序初始化")

// 包装处理程序以添加错误处理
const wrappedHandlers = {
  GET: async (req: Request) => {
    try {
      console.log(`NextAuth GET 请求: ${req.url}`)
      // 使用 any 类型暂时绕过类型检查，因为 handlers.GET 期望 NextRequest 类型
      // 但在 Cloudflare Workers 环境中实际上可以处理标准 Request
      const response = await (handlers.GET as any)(req)
      console.log(`NextAuth GET 响应状态: ${response.status}`)
      return response
    } catch (error) {
      console.error("NextAuth GET 处理错误:", error)
      // 返回详细的错误信息而不是抛出异常
      return new Response(
        JSON.stringify({ 
          error: "内部服务器错误", 
          message: error instanceof Error ? error.message : "未知错误",
          stack: error instanceof Error ? error.stack : undefined
        }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      )
    }
  },
  POST: async (req: Request) => {
    try {
      console.log(`NextAuth POST 请求: ${req.url}`)
      // 使用 any 类型暂时绕过类型检查
      const response = await (handlers.POST as any)(req)
      console.log(`NextAuth POST 响应状态: ${response.status}`)
      return response
    } catch (error) {
      console.error("NextAuth POST 处理错误:", error)
      // 返回详细的错误信息而不是抛出异常
      return new Response(
        JSON.stringify({ 
          error: "内部服务器错误", 
          message: error instanceof Error ? error.message : "未知错误",
          stack: error instanceof Error ? error.stack : undefined
        }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      )
    }
  }
}

export const { GET, POST } = wrappedHandlers

// // 确保 Cloudflare 环境中能够正确处理错误
// export const runtime = 'edge'