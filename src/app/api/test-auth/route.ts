import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    GITHUB_ID: process.env.GITHUB_ID ? '已设置' : '未设置',
    GITHUB_SECRET: process.env.GITHUB_SECRET ? '已设置' : '未设置',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '已设置' : '未设置',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '未设置',
  }

  return NextResponse.json({
    message: '环境变量检查',
    envVars,
    timestamp: new Date().toISOString()
  })
} 