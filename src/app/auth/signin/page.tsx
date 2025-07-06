"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { Github } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          登录账户
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  使用以下方式登录
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={() => signIn("github", { callbackUrl: "/" })}
              >
                <Github className="h-5 w-5" />
                <span>使用 GitHub 账号登录</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 