"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Github, Globe, Lock, Search, RefreshCw, ChevronRight, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

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

export function SearchRepo() {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<'own' | 'search' | null>(null)
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [searchedRepo, setSearchedRepo] = useState<Repository | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const fetchRepositories = async () => {
    setLoadingRepos(true)
    setError(null)
    try {
      const response = await fetch('/api/repositories')
      
      if (response.ok) {
        const data = await response.json()
        setRepositories(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch repositories')
      }
    } catch (error) {
      setError('Network error while fetching repositories')
    } finally {
      setLoadingRepos(false)
    }
  }

  const searchRepository = async () => {
    if (!searchInput.trim()) return
    
    setSearchLoading(true)
    setSearchError(null)
    setSearchedRepo(null)
    
    try {
      // Parse the input - it could be a full URL, owner/repo format, or just repo name
      let owner = ""
      let repo = ""
      
      if (searchInput.includes("github.com/")) {
        // Extract from GitHub URL
        const match = searchInput.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/)
        if (match) {
          owner = match[1]
          repo = match[2]
        }
      } else if (searchInput.includes("/")) {
        // owner/repo format
        const parts = searchInput.split("/")
        owner = parts[0]
        repo = parts[1]
      } else {
        setSearchError("Please enter a repository in format 'owner/repo' or paste a GitHub URL")
        return
      }
      
      if (!owner || !repo) {
        setSearchError("Invalid repository format. Use 'owner/repo' or GitHub URL")
        return
      }
      
      const response = await fetch(`/api/search-repo?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`)
      
      if (response.ok) {
        const repoData = await response.json()
        setSearchedRepo(repoData)
      } else {
        const errorData = await response.json()
        setSearchError(errorData.error || 'Repository not found')
      }
    } catch (error) {
      setSearchError('Error searching for repository')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleRepoSelect = (repo: Repository) => {
    const selectedRepo = {
      owner: repo.full_name.split('/')[0],
      name: repo.name,
      fullName: repo.full_name
    }
    
    // Store in localStorage for the changelog page
    localStorage.setItem('selectedRepository', JSON.stringify(selectedRepo))
    
    // Navigate to the main changelog page
    router.push('/')
  }

  useEffect(() => {
    if (selectedOption === 'own' && repositories.length === 0) {
      fetchRepositories()
    }
  }, [selectedOption])

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            {/* Logo */}
            <div className="mb-8">
              <img src="/1.svg" alt="Logo" className="h-28 w-auto mx-auto" />
              <div className="mt-4 flex justify-center">
                <ChevronDown className="h-8 w-8 text-orange-500" />
              </div>
            </div>

            {!selectedOption ? (
              /* Initial Choice */
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    Choose Repository Source
                  </h1>
                  <p className="text-zinc-600 dark:text-zinc-400 font-mono">
                    How would you like to select a repository?
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card 
                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    onClick={() => setSelectedOption('own')}
                  >
                    <CardHeader className="text-center pb-3">
                      <div className="mx-auto mb-2 p-3 bg-zinc-200 dark:bg-zinc-700 rounded-full w-fit">
                        <Github className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
                      </div>
                      <CardTitle className="font-mono text-lg text-zinc-900 dark:text-zinc-100">
                        Your Repositories
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <CardDescription className="font-mono text-zinc-600 dark:text-zinc-400">
                        Browse and select from your GitHub repositories
                      </CardDescription>
                      <ArrowRight className="h-5 w-5 mx-auto mt-3 text-zinc-400" />
                    </CardContent>
                  </Card>

                  <Card 
                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    onClick={() => setSelectedOption('search')}
                  >
                    <CardHeader className="text-center pb-3">
                      <div className="mx-auto mb-2 p-3 bg-zinc-200 dark:bg-zinc-700 rounded-full w-fit">
                        <Search className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
                      </div>
                      <CardTitle className="font-mono text-lg text-zinc-900 dark:text-zinc-100">
                        Search Repository
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <CardDescription className="font-mono text-zinc-600 dark:text-zinc-400">
                        Enter any public GitHub repository URL or owner/repo
                      </CardDescription>
                      <ArrowRight className="h-5 w-5 mx-auto mt-3 text-zinc-400" />
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : selectedOption === 'own' ? (
              /* Your Repositories */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      Your Repositories
                    </h2>
                    <p className="text-zinc-600 dark:text-zinc-400 font-mono text-sm">
                      Select a repository to generate changelog
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOption(null)}
                    className="font-mono"
                  >
                    Back
                  </Button>
                </div>

                <Card className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                  <CardContent className="p-6">
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
                      <div className="grid gap-3 max-h-[500px] overflow-y-auto">
                        {repositories.map((repo) => (
                          <div
                            key={repo.id}
                            className="p-4 rounded-lg border cursor-pointer transition-colors bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
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
                                <ChevronRight className="h-4 w-4 text-zinc-500" />
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
              /* Search Repository */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      Search Repository
                    </h2>
                    <p className="text-zinc-600 dark:text-zinc-400 font-mono text-sm">
                      Enter a GitHub repository URL or owner/repo format
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOption(null)}
                    className="font-mono"
                  >
                    Back
                  </Button>
                </div>

                <Card className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://github.com/owner/repo or owner/repo"
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && searchRepository()}
                          className="font-mono"
                        />
                        <Button 
                          onClick={searchRepository}
                          disabled={searchLoading || !searchInput.trim()}
                          className="font-mono bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                        >
                          {searchLoading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Search className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500 font-mono">
                        Examples: facebook/react, https://github.com/vercel/next.js
                      </p>
                    </div>

                    {searchError && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-700 dark:text-red-300 font-mono text-sm">
                          {searchError}
                        </p>
                      </div>
                    )}

                    {searchedRepo && (
                      <div className="space-y-3">
                        <h3 className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                          Repository Found
                        </h3>
                        <div
                          className="p-4 rounded-lg border cursor-pointer transition-colors bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                          onClick={() => handleRepoSelect(searchedRepo)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {searchedRepo.private ? (
                                <Lock className="h-4 w-4 text-zinc-500" />
                              ) : (
                                <Globe className="h-4 w-4 text-zinc-500" />
                              )}
                              <div>
                                <h4 className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                                  {searchedRepo.name}
                                </h4>
                                <p className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                                  {searchedRepo.full_name}
                                </p>
                                {searchedRepo.description && (
                                  <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">
                                    {searchedRepo.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={searchedRepo.private ? "secondary" : "default"} className="font-mono">
                                {searchedRepo.private ? "Private" : "Public"}
                              </Badge>
                              <ChevronRight className="h-4 w-4 text-zinc-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}