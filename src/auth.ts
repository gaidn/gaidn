import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

// 检查环境变量
function checkEnvVariables() {
  const requiredEnvVars = [
    'GITHUB_ID',
    'GITHUB_SECRET',
    'NEXTAUTH_SECRET'
  ]
  
  const missingEnvVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  )
  
  if (missingEnvVars.length > 0) {
    console.error(`缺少必要的环境变量: ${missingEnvVars.join(', ')}`)
    console.error('请确保在 .env.local 文件中设置这些变量')
    
    // 打印所有可用的环境变量名称（不包含值，以防泄露敏感信息）
    console.log('可用的环境变量:')
    Object.keys(process.env)
      .filter(key => !key.startsWith('npm_'))
      .forEach(key => console.log(`- ${key}: ${key.includes('SECRET') || key.includes('KEY') ? '[已设置]' : process.env[key]}`))
  } else {
    console.log('所有必要的环境变量已设置')
  }
}

console.log('初始化 NextAuth 配置...')
checkEnvVariables()

export const authConfig = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin', // 自定义登录页面路径
  },
  callbacks: {
    // @ts-ignore
    async session({ session, token }) {
      console.log('NextAuth session回调被调用:', { sessionData: session, tokenData: token })
      if (token.githubUsername) {
        session.user.githubUsername = token.githubUsername
      }
      return session
    },
    // @ts-ignore
    async jwt({ token, account, profile }) {
      console.log('NextAuth jwt回调被调用:', { 
        tokenData: token, 
        accountProvider: account?.provider,
        hasProfile: !!profile
      })
      
      if (account?.provider === 'github' && profile) {
        console.log('GitHub profile信息:', { login: profile.login })
        token.githubUsername = profile.login
      }
      return token
    },
    // @ts-ignore
    async signIn({ user, account, profile }) {
      console.log('NextAuth signIn回调被调用:', { 
        userData: user, 
        accountProvider: account?.provider,
        hasProfile: !!profile
      })
      return true
    },
    // @ts-ignore
    async redirect({ url, baseUrl }) {
      // 确保重定向URL的安全性
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      } else if (url.startsWith(baseUrl)) {
        return url
      }
      return baseUrl
    }
  },
  debug: process.env.NODE_ENV === 'development',
  logger: {
    // @ts-ignore
    error(code, metadata) {
      console.error(`NextAuth错误 [${code}]:`, metadata)
    },
    // @ts-ignore
    warn(code) {
      console.warn(`NextAuth警告 [${code}]`)
    },
    // @ts-ignore
    debug(code, metadata) {
      console.log(`NextAuth调试 [${code}]:`, metadata)
    },
  },
}

// @ts-ignore
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
console.log('NextAuth实例创建完成') 