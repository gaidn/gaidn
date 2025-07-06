export interface User {
  uuid: string;
  email: string;
  nickname: string;
  avatar_url: string;
  signin_type?: string;
  signin_provider?: string;
  signin_openid?: string;
  created_at: Date;
  signin_ip?: string;
  githubUsername?: string;
} 