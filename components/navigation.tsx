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
      <div className="w-full px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Far left - Logo and Home */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img 
              src={isDarkMode ? "/2.svg" : "/1.svg"} 
              alt="Logo" 
              className="h-8 w-auto sm:h-12" 
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/select-repo')}
              className="font-mono bg-transparent border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[44px] px-2 text-xs"
            >
              <Home className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Roast</span>
            </Button>
          </div>

          {/* Center - Repository info and controls (only show when repo is selected) */}
          {selectedRepo && (
            <div className="hidden lg:flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 gap-4 ml-16">
              <div className="text-center">
                <h2 className="font-mono font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  {selectedRepo.fullName}
                </h2>
                <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                  Ready for roasting
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefreshCommits}
                  disabled={isLoading}
                  className="font-mono bg-transparent border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[44px] px-2 whitespace-nowrap text-xs"
                >
                  {isLoading ? (
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Github className="w-3 h-3 mr-1" />
                  )}
                  <span>Refresh</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSortByDate}
                  disabled={isSorting}
                  className="font-mono bg-transparent border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[44px] px-2 whitespace-nowrap text-xs"
                >
                  {isSorting ? (
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 mr-1" />
                  )}
                  <span>{sortOrder === "newest" ? "Oldest First" : "Newest First"}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Clear selected repository and redirect to repo selection
                    localStorage.removeItem('selectedRepository')
                    window.location.href = '/select-repo'
                  }}
                  className="font-mono border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[44px] px-2 text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  <span>Switch</span>
                </Button>
              </div>
            </div>
          )}
          
          {/* Far right - User info, Sign out, Theme toggle */}
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
              className="font-mono bg-transparent border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[44px] px-2 text-xs"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="font-mono bg-transparent border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[44px] px-2 text-xs"
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