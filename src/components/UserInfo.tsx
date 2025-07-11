"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { Github, LogOut } from "lucide-react";

export function UserInfo() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="text-center">加载中...</div>;
  }

  if (status === "unauthenticated" || !session) {
    return (
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => window.location.href = "/auth/signin"}
      >
        <Github className="h-5 w-5" />
        <span>登录</span>
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white shadow rounded-lg">
      <div className="flex items-center gap-4">
        {session.user?.image && (
          <img
            src={session.user.image}
            alt={session.user?.name || "用户头像"}
            className="h-12 w-12 rounded-full"
          />
        )}
        <div>
          <h2 className="text-xl font-bold">{session.user?.name || "用户"}</h2>
          <p className="text-sm text-gray-500">{session.user?.email}</p>
          {session.user?.githubUsername && (
            <p className="text-sm text-gray-500">
              GitHub: {session.user.githubUsername}
            </p>
          )}
        </div>
      </div>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        <LogOut className="h-5 w-5" />
        <span>退出登录</span>
      </Button>
    </div>
  );
} 