"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, LogOut, User, Moon, Sun, Github, RefreshCw, ArrowUpDown, RotateCcw } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"

interface NavigationProps {
  selectedRepo?: {
    fullName: string
  } | null
  onRefreshCommits?: () => void
  onSortByDate?: () => void
  onSwitchRepository?: () => void
  isLoading?: boolean
  isSorting?: boolean
  sortOrder?: "newest" | "oldest"
}

export function Navigation({ 
  selectedRepo, 
  onRefreshCommits, 
  onSortByDate, 
  onSwitchRepository, 
  isLoading = false, 
  isSorting = false, 
  sortOrder = "newest" 
}: NavigationProps) {
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
      <div className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Far left - Logo and Home */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <img 
              src="/ratemydiflogo.svg" 
              alt="Logo" 
              className="h-6 sm:h-8 md:h-10 lg:h-12 w-auto flex-shrink-0" 
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/select-repo')}
              className="font-mono bg-transparent border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[40px] sm:min-h-[44px] px-2 sm:px-3 text-xs sm:text-sm"
            >
              <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Roast</span>
            </Button>
          </div>

          {/* Center - Repository info and controls (only show when repo is selected) */}
          {selectedRepo && (
            <div className="hidden xl:flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 lg:px-3 py-2 gap-2 lg:gap-4 flex-1 max-w-2xl mx-4">
              <div className="text-center min-w-0 flex-1">
                <h2 className="font-mono font-semibold text-xs lg:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                  {selectedRepo.fullName}
                </h2>
                <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                  Ready for roasting
                </p>
              </div>
              <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefreshCommits}
                  disabled={isLoading}
                  className="font-mono !bg-white dark:!bg-zinc-800 !border-zinc-300 dark:!border-zinc-600 !text-zinc-700 dark:!text-zinc-300 hover:!bg-zinc-100 dark:hover:!bg-zinc-700 min-h-[36px] lg:min-h-[40px] px-2 whitespace-nowrap text-xs"
                >
                  {isLoading ? (
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Github className="w-3 h-3 mr-1" />
                  )}
                  <span className="hidden lg:inline">Refresh</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSortByDate}
                  disabled={isSorting}
                  className="font-mono !bg-white dark:!bg-zinc-800 !border-zinc-300 dark:!border-zinc-600 !text-zinc-700 dark:!text-zinc-300 hover:!bg-zinc-100 dark:hover:!bg-zinc-700 min-h-[36px] lg:min-h-[40px] px-2 whitespace-nowrap text-xs"
                >
                  {isSorting ? (
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 mr-1" />
                  )}
                  <span className="hidden lg:inline">{sortOrder === "newest" ? "Oldest" : "Newest"}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    localStorage.removeItem('selectedRepository')
                    window.location.href = '/select-repo'
                  }}
                  className="font-mono !bg-white dark:!bg-zinc-800 !border-zinc-300 dark:!border-zinc-600 !text-zinc-700 dark:!text-zinc-300 hover:!bg-zinc-100 dark:hover:!bg-zinc-700 min-h-[36px] lg:min-h-[40px] px-2 text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  <span className="hidden lg:inline">Switch</span>
                </Button>
              </div>
            </div>
          )}
          
          {/* Far right - User info, Sign out, Theme toggle */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 flex-shrink-0">
            <div className="hidden md:flex items-center space-x-2">
              <Avatar className="h-6 w-6 lg:h-8 lg:w-8">
                <AvatarImage src={session.user?.image || ''} />
                <AvatarFallback>
                  <User className="h-3 w-3 lg:h-4 lg:w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-xs lg:text-sm font-mono text-zinc-700 dark:text-zinc-300 max-w-20 lg:max-w-32 truncate">
                {session.user?.name}
              </span>
            </div>
            
            {/* Mobile avatar */}
            <div className="flex md:hidden">
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                <AvatarImage src={session.user?.image || ''} />
                <AvatarFallback>
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                </AvatarFallback>
              </Avatar>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="font-mono bg-transparent border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[40px] sm:min-h-[44px] px-2 sm:px-3 text-xs"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="font-mono bg-transparent border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[40px] sm:min-h-[44px] px-2 sm:px-3 text-xs"
            >
              <Sun className="h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
} 