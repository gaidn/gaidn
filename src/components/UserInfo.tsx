"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { Github, LogOut } from "lucide-react";
import Image from "next/image";

export function UserInfo(): JSX.Element {
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
          <Image
            src={session.user.image}
            alt={session.user?.name || "用户头像"}
            width={48}
            height={48}
            className="rounded-full"
          />
        )}
        <div>
          <h2 className="text-xl font-bold">{session.user?.name || "用户"}</h2>
          <p className="text-sm text-gray-500">{session.user?.email}</p>
          {session.user?.github_id && (
            <p className="text-sm text-gray-500">
              GitHub ID: {session.user.github_id}
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