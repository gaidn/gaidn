"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { UserAvatar } from "./ui/user-avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { Github, LogOut, User, Settings, ChevronDown } from "lucide-react";
import Link from "next/link";

export function UserInfo(): JSX.Element {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 hover:bg-accent transition-colors"
        onClick={() => window.location.href = "/auth/signin"}
      >
        <Github className="h-4 w-4" />
        <span>登录</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-auto p-2 hover:bg-accent transition-colors"
        >
          <UserAvatar
            src={session.user?.image}
            alt={session.user?.name || "用户头像"}
            fallback={session.user?.name?.charAt(0) || "U"}
            size="sm"
          />
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium truncate max-w-[120px]">
              {session.user?.name || "用户"}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
              {session.user?.email}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">
              {session.user?.name || "用户"}
            </p>
            <p className="text-xs text-muted-foreground">
              {session.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2 w-full">
            <User className="h-4 w-4" />
            个人资料
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/profile?tab=settings" className="flex items-center gap-2 w-full">
            <Settings className="h-4 w-4" />
            设置
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 