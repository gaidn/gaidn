import type { User as CustomUser } from './types/user';
import type { Provider } from '@auth/core/providers';
import type { Profile } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

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
    providers: Provider[]
    pages?: {
      signIn?: string
    }
    callbacks?: {
      signIn?: (params: {
        user: User
        account: Account | null
        profile?: Profile
        email?: { verificationRequest?: boolean }
        credentials?: Record<string, unknown>
      }) => Promise<boolean | string>
      redirect?: (params: {
        url: string
        baseUrl: string
      }) => Promise<string>
      session?: (params: {
        session: Session
        token: JWT
        user: User
      }) => Promise<Session>
      jwt?: (params: {
        token: JWT
        user?: User
        account?: Account | null
        profile?: Profile
        trigger?: 'signIn' | 'signUp' | 'update'
        isNewUser?: boolean
        session?: unknown
      }) => Promise<JWT>
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