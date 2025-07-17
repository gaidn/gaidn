import { handlers } from "@/auth"

// 添加错误处理

// 包装处理程序以添加错误处理
const wrappedHandlers = {
  GET: async (req: Request) => {
    try {
      // 使用 any 类型暂时绕过类型检查，因为 handlers.GET 期望 NextRequest 类型
      // 但在 Cloudflare Workers 环境中实际上可以处理标准 Request
      const response = await (handlers.GET as (req: Request) => Promise<Response>)(req)
      return response
    } catch (error) {
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
      // 使用 any 类型暂时绕过类型检查
      const response = await (handlers.POST as (req: Request) => Promise<Response>)(req)
      return response
    } catch (error) {
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