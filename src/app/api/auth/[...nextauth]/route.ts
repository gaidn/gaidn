import { handlers } from "@/auth"

// 添加错误处理和日志记录
export const { GET, POST } = handlers

// 确保 Cloudflare 环境中能够正确处理错误
export const runtime = 'edge' 