import { handlers } from "@/auth"

// 添加错误处理和日志记录
export const { GET, POST } = handlers

// 移除 edge runtime 配置，因为 OpenNext 不支持在这个路由中使用 edge runtime
// export const runtime = 'edge' 