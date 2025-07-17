import { User as CustomUser } from './types/user';

declare module "next-auth" {
  interface Session {
    user: CustomUser & {
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    id?: number
    name?: string | null
    email?: string | null
    image?: string | null
    github_id?: string
    created_at?: string
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
    user?: {
      id: number
      name: string
      email: string
      image?: string
      github_id?: string
      created_at: string
    }
  }
} 