"use client"

import Link from "next/link"
import { UserInfo } from "./UserInfo"
import { ThemeToggle } from "./ui/theme-toggle"
import { usePathname } from "next/navigation"
import { Home, Trophy, Menu } from "lucide-react"
import { Button } from "./ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu"

export default function Navbar(): JSX.Element {
  const pathname = usePathname()

  const navItems = [
    { name: "首页", href: "/", icon: Home },
    { name: "排行榜", href: "/leaderboard", icon: Trophy },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
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
                        inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200
                        ${isActive 
                          ? "bg-accent/80 text-accent-foreground shadow-md backdrop-blur-sm" 
                          : "text-muted-foreground hover:bg-accent/40 hover:text-accent-foreground hover:shadow-sm hover:scale-[1.02] hover:-translate-y-0.5"
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
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <UserInfo />
          </div>
          
          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <UserInfo />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {navItems.map((item) => {
                  const Icon = item.icon
                  
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link 
                        href={item.href} 
                        className="flex items-center gap-2 w-full"
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