"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Github, RefreshCw, Home, Globe, Lock, ChevronRight, ChevronDown, RotateCcw } from "lucide-react"
import { ChangelogList } from "@/components/changelog-list"
import { AIChangelogSummary } from "@/components/ai-changelog-summary"

import { Navigation } from "@/components/navigation"

type ViewMode = 'commits' | 'roast'

interface Repository {
  id: number
  name: string
  full_name: string
  private: boolean
  description: string | null
  html_url: string
  updated_at: string
}

type SelectedRepository = {
  owner: string
  name: string
  fullName: string
}

type ChangelogEntry = {
  title: string
  date: string
  repoLink: string
  summary: string
}

export default function ChangelogPage() {
  const { data: session, status } = useSession()
  const [changelogData, setChangelogData] = useState<ChangelogEntry[]>([])
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [isLoading, setIsLoading] = useState(false)
  const [isSorting, setIsSorting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRepo, setSelectedRepo] = useState<SelectedRepository | null>(null)

  const [currentView, setCurrentView] = useState<ViewMode>('roast')
  const [commitHistory, setCommitHistory] = useState<string>("")

  useEffect(() => {
    // Check if user is authenticated and has selected a repository
    const selectedRepoStr = localStorage.getItem('selectedRepository')
    if (selectedRepoStr) {
      setSelectedRepo(JSON.parse(selectedRepoStr))
    }
  }, [])

  // Redirect authenticated users to repo selection if no repo is selected
  useEffect(() => {
    if (session && !selectedRepo) {
      const selectedRepoStr = localStorage.getItem('selectedRepository')
      if (!selectedRepoStr) {
        window.location.href = '/select-repo'
      }
    }
  }, [session, selectedRepo])



  const fetchGitHubCommits = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Get selected repository from localStorage
      const selectedRepoStr = localStorage.getItem('selectedRepository')
      if (!selectedRepoStr) {
        throw new Error('No repository selected. Please select a repository.')
      }
      
      const selectedRepo = JSON.parse(selectedRepoStr)
      
      const response = await fetch(`/api/changelog?owner=${selectedRepo.owner}&repo=${selectedRepo.name}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch commits')
      }
      
      const commits = await response.json()
      setChangelogData(commits)
      
      // Create commit history string for AI summary (simulating git log output)
      const commitHistoryString = commits.map((commit: ChangelogEntry) => 
        `${commit.date.slice(0, 7)} ${commit.title}`
      ).join('\n')
      setCommitHistory(commitHistoryString)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const sortByDate = async () => {
    setIsSorting(true)
    
    // Add a small delay to show the loading state for better UX
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const newSortOrder = sortOrder === "newest" ? "oldest" : "newest"
    setSortOrder(newSortOrder)

    const sortedData = [...changelogData].sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)

      if (newSortOrder === "newest") {
        return dateB.getTime() - dateA.getTime()
      } else {
        return dateA.getTime() - dateB.getTime()
      }
    })

    setChangelogData(sortedData)
    setIsSorting(false)
  }

  // Auto-fetch commits when repository is selected
  useEffect(() => {
    if (selectedRepo) {
      fetchGitHubCommits()
    }
  }, [selectedRepo])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      <Navigation 
        selectedRepo={selectedRepo}
        onRefreshCommits={fetchGitHubCommits}
        onSortByDate={sortByDate}
        onSwitchRepository={() => {
          localStorage.removeItem('selectedRepository')
          window.location.href = '/select-repo'
        }}
        isLoading={isLoading}
        isSorting={isSorting}
        sortOrder={sortOrder}
      />
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {!session ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="max-w-md mx-auto text-center">
              <div className="mb-8">
                <img src="/1.svg" alt="Logo" className="h-28 w-auto mx-auto" />
                <div className="mt-4 flex justify-center">
                  <ChevronDown className="h-8 w-8 text-orange-500" />
                </div>
              </div>
              <Card className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <CardHeader className="text-center">
                  <CardTitle className="font-mono text-zinc-900 dark:text-zinc-100">
                    Get Started
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => signIn('github')}
                    className="w-full font-mono bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Connect with GitHub
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : !selectedRepo ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100 mx-auto mb-4"></div>
            <p className="text-zinc-600 dark:text-zinc-400 font-mono">Redirecting to repository selection...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-300 font-mono text-sm">
                  Error: {error}
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100 mx-auto mb-4"></div>
                <p className="text-zinc-600 dark:text-zinc-400 font-mono">Loading commits...</p>
              </div>
            ) : changelogData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-600 dark:text-zinc-400 font-mono">No commits found in this repository.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <AIChangelogSummary 
                  commitHistory={commitHistory}
                  onToggleView={setCurrentView}
                  showToggle={true}
                  repoName={selectedRepo?.fullName}
                />
                {currentView === 'commits' && <ChangelogList entries={changelogData} />}
                {currentView === 'roast' && <ChangelogList entries={changelogData} showRoastButtons={true} />}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
