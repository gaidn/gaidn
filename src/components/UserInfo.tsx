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
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";

export function UserInfo(): JSX.Element {
  const { data: session, status } = useSession();
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

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
        onClick={() => router.push("/auth/signin")}
      >
        <Github className="h-4 w-4" />
        <span>{t("user.sign_in")}</span>
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
            alt={session.user?.name || t("user.profile")}
            fallback={session.user?.name?.charAt(0) || "U"}
            size="sm"
          />
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium truncate max-w-[120px]">
              {session.user?.name || t("user.profile")}
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
              {session.user?.name || t("user.profile")}
            </p>
            <p className="text-xs text-muted-foreground">
              {session.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link 
            href="/profile" 
            className="flex items-center gap-2 w-full"
            locale={locale}
          >
            <User className="h-4 w-4" />
            {t("user.profile")}
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link 
            href="/profile?tab=settings" 
            className="flex items-center gap-2 w-full"
            locale={locale}
          >
            <Settings className="h-4 w-4" />
            {t("navigation.settings")}
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          {t("user.sign_out")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 