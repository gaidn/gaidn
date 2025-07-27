"use client"

import { UserInfo } from "./UserInfo"
import { ThemeToggle } from "./ui/theme-toggle"
import { LocaleSwitcher } from "./ui/locale-switcher"
import { Home, Trophy, Menu } from "lucide-react"
import { Button } from "./ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu"
import { Link, usePathname } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

export default function Navbar(): JSX.Element {
  const pathname = usePathname()
  const t = useTranslations()

  const navItems = [
    { name: t("navigation.home"), href: "/" as const, icon: Home },
    { name: t("navigation.leaderboard"), href: "/leaderboard" as const, icon: Trophy },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-background/70 backdrop-blur-lg border-b border-border/30 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center"
            >
              GAIDN
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-3">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                        ${isActive 
                          ? "bg-accent/70 text-accent-foreground shadow-lg backdrop-blur-md border border-border/20" 
                          : "text-muted-foreground hover:bg-accent/30 hover:text-accent-foreground hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5 hover:backdrop-blur-sm"
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
          
          {/* Desktop User Info */}
          <div className="hidden md:flex items-center justify-center gap-3">
            <LocaleSwitcher />
            <ThemeToggle />
            <UserInfo />
          </div>
          
          {/* Mobile Menu */}
          <div className="md:hidden flex items-center justify-center gap-3">
            <LocaleSwitcher />
            <ThemeToggle />
            <UserInfo />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-accent/30 hover:backdrop-blur-sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background/80 backdrop-blur-md border border-border/30 shadow-lg">
                {navItems.map((item) => {
                  const Icon = item.icon
                  
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link 
                        href={item.href} 
                        className="flex items-center justify-start gap-2 w-full hover:bg-accent/30 rounded-md px-2 py-1.5 transition-all duration-200"
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
} 