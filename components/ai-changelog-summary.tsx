"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, RotateCcw, Code2, Angry } from "lucide-react"
import { ShareRoastButton } from "@/components/share-roast-button"

type ViewMode = 'commits' | 'roast'

interface AIChangelogSummaryProps {
  commitHistory: string
  onToggleView?: (mode: ViewMode) => void
  showToggle?: boolean
  repoName?: string
}

export function AIChangelogSummary({ 
  commitHistory, 
  onToggleView, 
  showToggle = true,
  repoName
}: AIChangelogSummaryProps) {
  const [roast, setRoast] = useState<string>("")
  const [roastLoading, setRoastLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [currentView, setCurrentView] = useState<ViewMode>('roast')

  // Auto-generate roast on component mount
  useEffect(() => {
    if (commitHistory.trim() && !roast) {
      generateRoast()
    }
  }, [commitHistory])


  const generateRoast = async () => {
    if (!commitHistory.trim()) {
      setError("No commit history available to roast")
      return
    }

    setRoastLoading(true)
    setError("")

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commitHistory }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate roast")
      }

      const data = await response.json()
      setRoast(data.roast)
      setCurrentView('roast')
      onToggleView?.('roast')
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setRoastLoading(false)
    }
  }

  const handleViewChange = (mode: ViewMode) => {
    if (mode === 'roast' && !roast) {
      generateRoast()
      return
    }
    setCurrentView(mode)
    onToggleView?.(mode)
  }

  const regenerateContent = () => {
    if (currentView === 'roast') {
      setRoast("")
      generateRoast()
    }
  }

  return (
    <div className="space-y-4">
      {/* Top-right toggle controls */}
      {showToggle && (
        <div className="flex justify-center sm:justify-end gap-2 overflow-x-auto pb-2">
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 min-w-fit">
            <Button
              onClick={() => handleViewChange('roast')}
              variant={currentView === 'roast' ? 'default' : 'ghost'}
              size="sm"
              className={`h-10 px-3 sm:h-8 min-h-[44px] sm:min-h-[32px] whitespace-nowrap ${
                currentView === 'roast'
                  ? 'bg-white dark:bg-zinc-700 shadow-sm text-red-600 dark:text-red-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
              disabled={roastLoading}
            >
              <Angry className="w-4 h-4 mr-1" />
              {roastLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Roast"}
            </Button>
            <Button
              onClick={() => handleViewChange('commits')}
              variant={currentView === 'commits' ? 'default' : 'ghost'}
              size="sm"
              className={`h-10 px-3 sm:h-8 min-h-[44px] sm:min-h-[32px] whitespace-nowrap ${
                currentView === 'commits'
                  ? 'bg-white dark:bg-zinc-700 shadow-sm text-green-600 dark:text-green-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Code2 className="w-4 h-4 mr-1" />
              Code
            </Button>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-300">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}


      {/* Roast view */}
      {currentView === 'roast' && (
        <>
          {roastLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Preparing brutal assessment...</span>
                </div>
              </CardContent>
            </Card>
          ) : roast ? (
            <Card id="main-roast-card" className="bg-zinc-50 dark:bg-zinc-900 border-red-200 dark:border-red-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Angry className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <CardTitle className="text-red-700 dark:text-red-300">
                      Git Roast - Brutally Honest Assessment
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShareRoastButton
                      roast={{
                        content: roast,
                        repoName: repoName,
                        type: 'main'
                      }}
                      screenshotElementId="main-roast-card"
                      className="no-screenshot"
                    />
                    <Button 
                      onClick={regenerateContent} 
                      variant="outline"
                      size="sm"
                      className="border-red-300 dark:border-red-600 no-screenshot"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      More Pain
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-red-600 dark:text-red-400">
                  ⚠️ Warning: Extremely judgmental AI feedback ahead
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none text-red-800 dark:text-red-200"
                  dangerouslySetInnerHTML={{ 
                    __html: roast.replace(/\n/g, '<br>') 
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-zinc-50 dark:bg-zinc-900 border-red-200 dark:border-red-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Button 
                    onClick={() => generateRoast()} 
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Angry className="w-4 h-4 mr-2" />
                    Roast My Git Commits
                  </Button>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    Prepare for brutal honesty about your coding habits
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Raw commit display */}
      {currentView === 'commits' && commitHistory && (
        <Card className="bg-zinc-50 dark:bg-zinc-900 border-green-200 dark:border-green-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <CardTitle className="text-green-700 dark:text-green-300">Recent Commits</CardTitle>
            </div>
            <CardDescription>
              Raw git log output
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="font-mono text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words bg-zinc-50 dark:bg-zinc-900 p-4 rounded border">
              {commitHistory}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}