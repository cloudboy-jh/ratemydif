"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Github, RefreshCw, Home, Globe, Lock, ChevronRight, ChevronDown } from "lucide-react"
import { ChangelogList } from "@/components/changelog-list"
import { AIChangelogSummary } from "@/components/ai-changelog-summary"

import { Navigation } from "@/components/navigation"

type ViewMode = 'ai' | 'commits' | 'roast'

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
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [currentView, setCurrentView] = useState<ViewMode>('ai')
  const [commitHistory, setCommitHistory] = useState<string>("")

  useEffect(() => {
    // Check if user is authenticated and has selected a repository
    const selectedRepoStr = localStorage.getItem('selectedRepository')
    if (selectedRepoStr) {
      setSelectedRepo(JSON.parse(selectedRepoStr))
    }
  }, [])

  useEffect(() => {
    if (session?.accessToken) {
      console.log('Session and access token available, fetching repositories...')
      fetchRepositories()
    } else if (session && !session.accessToken) {
      console.log('Session exists but no accessToken')
      setError('Authentication token missing. Please try signing in again.')
    } else if (status === 'unauthenticated') {
      console.log('User is not authenticated')
    }
  }, [session, status])

  const fetchRepositories = async () => {
    setLoadingRepos(true)
    try {
      console.log('Fetching repositories...')
      const response = await fetch('/api/repositories')
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Repositories fetched:', data.length)
        setRepositories(data)
      } else {
        let errorData
        try {
          errorData = await response.json()
        } catch (parseError) {
          errorData = { error: 'Failed to parse error response' }
        }
        console.error('Failed to fetch repositories:', errorData)
        setError(errorData.error || 'Failed to fetch repositories')
      }
    } catch (error) {
      console.error('Failed to fetch repositories:', error)
      setError('Network error while fetching repositories')
    } finally {
      setLoadingRepos(false)
    }
  }

  const handleRepoSelect = (repo: Repository) => {
    setSelectedRepo({
      owner: repo.full_name.split('/')[0],
      name: repo.name,
      fullName: repo.full_name
    })
    // Store in localStorage for the changelog page
    localStorage.setItem('selectedRepository', JSON.stringify({
      owner: repo.full_name.split('/')[0],
      name: repo.name,
      fullName: repo.full_name
    }))
  }

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
      <Navigation />
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
          <div className="space-y-8">
            {/* Repository Selection */}
            <Card className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="font-mono text-zinc-900 dark:text-zinc-100">
                  Select Repository
                </CardTitle>
                <CardDescription className="font-mono text-zinc-600 dark:text-zinc-400">
                  Choose a repository to generate changelog from
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-700 dark:text-red-300 font-mono text-sm mb-2">
                      {error}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setError(null)
                        fetchRepositories()
                      }}
                      className="font-mono border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/20"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                )}
                {loadingRepos ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100 mx-auto mb-4"></div>
                    <p className="text-zinc-600 dark:text-zinc-400 font-mono">Loading repositories...</p>
                  </div>
                ) : repositories.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-zinc-600 dark:text-zinc-400 font-mono mb-4">No repositories found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchRepositories}
                      disabled={loadingRepos}
                      className="font-mono"
                    >
                      {loadingRepos ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      {loadingRepos ? "Loading..." : "Retry"}
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 max-h-[900px] overflow-y-auto">
                    {repositories.map((repo) => (
                      <div
                        key={repo.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          (selectedRepo as SelectedRepository | null)?.name === repo.name
                            ? 'bg-zinc-200 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-600'
                            : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                        }`}
                        onClick={() => handleRepoSelect(repo)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {repo.private ? (
                              <Lock className="h-4 w-4 text-zinc-500" />
                            ) : (
                              <Globe className="h-4 w-4 text-zinc-500" />
                            )}
                            <div>
                              <h3 className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                                {repo.name}
                              </h3>
                              <p className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                                {repo.full_name}
                              </p>
                              {repo.description && (
                                <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">
                                  {repo.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={repo.private ? "secondary" : "default"} className="font-mono">
                              {repo.private ? "Private" : "Public"}
                            </Badge>
                            {(selectedRepo as SelectedRepository | null)?.name === repo.name && (
                              <ChevronRight className="h-4 w-4 text-zinc-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Repository Info */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    {selectedRepo.fullName}
                  </h2>
                  <p className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                    Currently viewing changelog
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRepo(null)
                    localStorage.removeItem('selectedRepository')
                  }}
                  className="font-mono border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Change Repository
                </Button>
              </div>
            </div>

            <div className="flex justify-center items-center gap-2 sm:gap-4 mb-8 flex-wrap px-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchGitHubCommits}
                disabled={isLoading}
                className="font-mono bg-transparent border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[44px] px-3 whitespace-nowrap"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-1 sm:mr-2 animate-spin" />
                ) : (
                  <Github className="w-4 h-4 mr-1 sm:mr-2" />
                )}
                <span className="hidden sm:inline">{isLoading ? "Loading..." : "Refresh Commits"}</span>
                <span className="sm:hidden">{isLoading ? "Loading" : "Refresh"}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={sortByDate}
                disabled={isSorting}
                className="font-mono bg-transparent border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[44px] px-3 whitespace-nowrap"
              >
                {isSorting ? (
                  <RefreshCw className="w-4 h-4 mr-1 sm:mr-2 animate-spin" />
                ) : (
                  <ArrowUpDown className="w-4 h-4 mr-1 sm:mr-2" />
                )}
                <span className="hidden sm:inline">{isSorting ? "Sorting..." : (sortOrder === "newest" ? "Oldest First" : "Newest First")}</span>
                <span className="sm:hidden">{isSorting ? "Sort" : "Sort"}</span>
              </Button>
            </div>

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
                />
                {currentView === 'commits' && <ChangelogList entries={changelogData} />}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
