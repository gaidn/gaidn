declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      githubUsername?: string
      customName?: string
    }
  }

  interface User {
    name?: string | null
    email?: string | null
    image?: string | null
    githubUsername?: string
    customName?: string
  }
} 