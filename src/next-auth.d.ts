import { User as CustomUser } from './types/user';

declare module "next-auth" {
  interface Session {
    user: CustomUser & {
      name?: string | null
      email?: string | null
      image?: string | null
      githubUsername?: string
    }
  }

  interface User {
    name?: string | null
    email?: string | null
    image?: string | null
    githubUsername?: string
  }

  export interface Account {
    provider: string
    type: string
    providerAccountId: string
    access_token?: string
    expires_at?: number
    token_type?: string
    scope?: string
    id_token?: string
  }

  export interface NextAuthConfig {
    providers: any[]
    pages?: {
      signIn?: string
    }
    callbacks?: {
      signIn?: (params: any) => Promise<boolean | string>
      redirect?: (params: any) => Promise<string>
      session?: (params: any) => Promise<any>
      jwt?: (params: any) => Promise<any>
    }
    debug?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: CustomUser
    githubUsername?: string
  }
} 