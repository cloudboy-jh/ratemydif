"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2, RotateCcw, Code2, Angry, Zap, ChevronDown, ChevronUp } from "lucide-react"
import { ShareRoastButton } from "@/components/share-roast-button"
import { CopyButton } from "@/components/copy-button"
import { RatingLevel, RoastRequest, RoastResponse } from "@/types/roast"

type ViewMode = 'commits' | 'roast'

interface AIChangelogSummaryProps {
  commitHistory: string
  onToggleView?: (mode: ViewMode) => void
  showToggle?: boolean
  repoName?: string
}

const AVAILABLE_MODELS = [
  'gpt-4o',
  'gpt-4o-mini', 
  'o1-preview',
  'o1-mini',
  'claude-3.5-sonnet',
  'claude-3.5-haiku',
  'claude-3-opus'
]

const RATING_DESCRIPTIONS = {
  G: 'Family-friendly wit',
  PG: 'Cheeky but clean',
  R: 'Strong language allowed',
  Unhinged: 'No holds barred'
}

export function AIChangelogSummary({ 
  commitHistory, 
  onToggleView, 
  showToggle = true,
  repoName
}: AIChangelogSummaryProps) {
  const [currentView, setCurrentView] = useState<ViewMode>('roast')
  const [commitUrl, setCommitUrl] = useState('')
  const [username, setUsername] = useState('')
  const [ratingLevel, setRatingLevel] = useState<RatingLevel>('PG')
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [roastData, setRoastData] = useState<RoastResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [isRoasterOpen, setIsRoasterOpen] = useState(false)

  const generateRoast = async () => {
    if (!commitUrl.trim() || !username.trim()) {
      setError('Please provide both commit URL and username')
      return
    }

    if (!commitUrl.includes('/commit/')) {
      setError('Please provide a valid GitHub commit URL')
      return
    }

    setIsLoading(true)
    setError('')
    setRoastData(null)

    try {
      const requestBody: RoastRequest = {
        commitUrl: commitUrl.trim(),
        username: username.trim(),
        ratingLevel,
        ...(selectedModel && selectedModel !== 'auto' && { model: selectedModel })
      }

      const response = await fetch('/api/roast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate roast')
      }

      const data: RoastResponse = await response.json()
      setRoastData(data)
      setCurrentView('roast')
      onToggleView?.('roast')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewChange = (mode: ViewMode) => {
    setCurrentView(mode)
    onToggleView?.(mode)
  }

  const resetForm = () => {
    setRoastData(null)
    setError('')
  }

  return (
    <div className="space-y-4">
      {/* Top-right toggle controls */}
      {showToggle && (
        <div className="flex justify-center gap-2 px-4 sm:px-0 overflow-x-auto pb-2">
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 min-w-fit">
            <Button
              onClick={() => handleViewChange('roast')}
              variant={currentView === 'roast' ? 'default' : 'ghost'}
              size="sm"
              className={`h-10 px-3 sm:h-8 min-h-[44px] sm:min-h-[36px] whitespace-nowrap text-sm ${
                currentView === 'roast'
                  ? 'bg-white dark:bg-zinc-700 shadow-sm text-red-600 dark:text-red-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Angry className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Roast</span>
            </Button>
            <Button
              onClick={() => handleViewChange('commits')}
              variant={currentView === 'commits' ? 'default' : 'ghost'}
              size="sm"
              className={`h-10 px-3 sm:h-8 min-h-[44px] sm:min-h-[36px] whitespace-nowrap text-sm ${
                currentView === 'commits'
                  ? 'bg-white dark:bg-zinc-700 shadow-sm text-green-600 dark:text-green-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Code2 className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Code</span>
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
          {/* Collapsible Roaster Card - Commit List Style */}
          <div className="relative">
            {/* Timeline dot */}
            <div className="absolute left-1/2 top-6 w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 hidden sm:block animate-pulse"></div>

            <div className={`bg-zinc-50 dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 relative z-10 transition-colors touch-manipulation mx-2 sm:mx-0 ${
              isRoasterOpen 
                ? 'rounded-t-lg' 
                : 'rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}>
              <div 
                className="p-3 sm:p-4 lg:p-6 cursor-pointer"
                onClick={() => setIsRoasterOpen(!isRoasterOpen)}
              >
                <div className="flex flex-col gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0"></div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 leading-tight">
                        Git Commit Roaster
                      </h3>
                      {isRoasterOpen ? (
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600 dark:text-zinc-400 ml-auto" />
                      ) : (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600 dark:text-zinc-400 ml-auto" />
                      )}
                    </div>
                    <time className="text-xs sm:text-sm font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                      Get brutally honest AI feedback about specific commits
                    </time>
                  </div>
                </div>
              </div>

              {/* Collapsible Form Content */}
              {isRoasterOpen && (
                <div className="border-t border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 rounded-b-lg bg-zinc-50 dark:bg-zinc-900">
                <div className="space-y-2">
                  <Label htmlFor="commitUrl" className="font-mono text-xs sm:text-sm">GitHub Commit URL</Label>
                  <Input
                    id="commitUrl"
                    placeholder="https://github.com/user/repo/commit/abc123..."
                    value={commitUrl}
                    onChange={(e) => setCommitUrl(e.target.value)}
                    className="font-mono text-xs sm:text-sm min-h-[44px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="font-mono text-xs sm:text-sm">GitHub Username</Label>
                  <Input
                    id="username"
                    placeholder="github-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="font-mono text-xs sm:text-sm min-h-[44px]"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="font-mono text-xs sm:text-sm">Rating Level</Label>
                  <RadioGroup
                    value={ratingLevel}
                    onValueChange={(value) => setRatingLevel(value as RatingLevel)}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                  >
                    {Object.entries(RATING_DESCRIPTIONS).map(([level, description]) => (
                      <div key={level} className="flex items-center space-x-2 p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <RadioGroupItem value={level} id={level} />
                        <Label htmlFor={level} className="text-xs sm:text-sm font-mono cursor-pointer flex-1">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{level}</span>
                          <span className="text-zinc-600 dark:text-zinc-400 ml-1 font-sans block sm:inline">
                            {description}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model" className="font-mono text-xs sm:text-sm">AI Model (Optional)</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="font-mono text-xs sm:text-sm min-h-[44px]">
                      <SelectValue placeholder="Auto-select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto" className="font-mono">Auto-select</SelectItem>
                      {AVAILABLE_MODELS.map((model) => (
                        <SelectItem key={model} value={model} className="font-mono">
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button
                    onClick={generateRoast}
                    disabled={isLoading || !commitUrl.trim() || !username.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white font-mono min-h-[48px] w-full sm:w-auto flex-1"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Angry className="w-4 h-4 mr-2" />
                    )}
                    {isLoading ? 'Roasting...' : 'Generate Roast'}
                  </Button>
                  {roastData && (
                    <Button onClick={resetForm} variant="outline" className="font-mono min-h-[48px] w-full sm:w-auto">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      New Roast
                    </Button>
                  )}
                </div>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          {roastData && (
            <div className="space-y-3 sm:space-y-4 mx-2 sm:mx-0">
              {/* Tweet line */}
              <Card id="tweet-roast-card" className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <CardHeader className="pb-3 sm:pb-6">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm font-mono">
                      🐦 Tweetable Roast
                    </CardTitle>
                    <CopyButton text={roastData.tweet} className="no-screenshot font-mono flex-shrink-0" size="sm" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="font-mono text-zinc-700 dark:text-zinc-300 leading-relaxed text-xs sm:text-sm break-words">
                    {roastData.tweet}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-mono">
                    {roastData.tweet.length}/280 characters
                  </p>
                </CardContent>
              </Card>

              {/* Deep roast */}
              <Card id="deep-roast-card" className="bg-zinc-50 dark:bg-zinc-900 border-red-200 dark:border-red-800">
                <CardHeader className="pb-3 sm:pb-6">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-red-700 dark:text-red-300 text-xs sm:text-sm font-mono">
                      🔥 Deep Technical Roast
                    </CardTitle>
                    <CopyButton text={roastData.deepRoast} className="no-screenshot font-mono flex-shrink-0" size="sm" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-red-800 dark:text-red-200 leading-relaxed text-xs sm:text-sm break-words">
                    {roastData.deepRoast}
                  </p>
                </CardContent>
              </Card>

              {/* Timing footer */}
              {selectedModel && selectedModel !== 'auto' && (
                <div className="text-center">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                    ({roastData.model} • {(roastData.durationMs / 1000).toFixed(2)}s)
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Raw commit display */}
      {currentView === 'commits' && commitHistory && (
        <Card className="bg-zinc-50 dark:bg-zinc-900 border-green-200 dark:border-green-800 mx-2 sm:mx-0">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              <CardTitle className="text-green-700 dark:text-green-300 text-sm sm:text-base">Recent Commits</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Raw git log output
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <pre className="font-mono text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words bg-zinc-100 dark:bg-zinc-800 p-3 sm:p-4 rounded border overflow-x-auto">
              {commitHistory}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}