"use client"

import Link from "next/link"
import { UserInfo } from "./UserInfo"
import { usePathname } from "next/navigation"

export default function Navbar(): JSX.Element {
  const pathname = usePathname()

  const navItems = [
    { name: "首页", href: "/" },
    { name: "排行榜", href: "/leaderboard" },
    { name: "设置", href: "/settings" },
  ]

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-800">
              GAIDN
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === item.href
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <UserInfo />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 