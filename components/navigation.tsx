"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, LogOut, User, Moon, Sun } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"

export function Navigation() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const root = window.document.documentElement
    if (isDarkMode) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  if (!session) {
    return null
  }

  return (
    <nav className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50">
      <div className="container mx-auto max-w-4xl px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img 
                src={isDarkMode ? "/2.svg" : "/1.svg"} 
                alt="Logo" 
                className="h-8 w-auto sm:h-12" 
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className={`font-mono min-h-[44px] px-2 sm:px-3 ${pathname === '/' ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}
              >
                <Home className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Changelog</span>
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user?.image || ''} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-mono text-zinc-700 dark:text-zinc-300 max-w-32 truncate">
                {session.user?.name}
              </span>
            </div>
            
            {/* Mobile avatar */}
            <div className="flex sm:hidden">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user?.image || ''} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="font-mono border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[44px] px-2 sm:px-3"
            >
              <LogOut className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-transparent min-h-[44px] min-w-[44px]"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
} 