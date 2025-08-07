"use client"

import type React from "react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Angry, Loader2, RotateCcw, Calendar, FileText } from "lucide-react"

type ChangelogEntry = {
  title: string
  date: string
  repoLink: string
  summary: string
}

interface CommitRoastDialogProps {
  entry: ChangelogEntry
  children: React.ReactNode
}

export function CommitRoastDialog({ entry, children }: CommitRoastDialogProps) {
  const [roast, setRoast] = useState<string>("")
  const [roastLoading, setRoastLoading] = useState(false)
  const [roastError, setRoastError] = useState<string>("")

  const generateRoast = async () => {
    setRoastLoading(true)
    setRoastError("")

    try {
      const commitHistory = `${entry.date} ${entry.title}`
      
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
    } catch (err) {
      setRoastError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setRoastLoading(false)
    }
  }

  // Auto-generate roast when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open && !roast && !roastLoading) {
      generateRoast()
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] font-mono bg-white dark:bg-zinc-900 border-red-200 dark:border-red-800 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Angry className="w-6 h-6 text-red-600 dark:text-red-400" />
            <DialogTitle className="font-mono text-2xl text-red-700 dark:text-red-300 mb-4">
              Git Roast - Brutally Honest Assessment
            </DialogTitle>
          </div>
          <p className="text-red-600 dark:text-red-400 text-sm">
            ⚠️ Warning: Extremely judgmental AI feedback ahead
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Commit Info */}
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <time className="text-sm font-mono text-zinc-600 dark:text-zinc-400">{entry.date}</time>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-zinc-500 dark:text-zinc-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold font-mono text-zinc-900 dark:text-zinc-100 mb-2">{entry.title}</h3>
                  <pre className="font-mono text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words">
                    {entry.summary}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Roast Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Angry className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="text-lg font-mono text-red-700 dark:text-red-300 font-bold">The Verdict</h3>
              </div>
              {roast && (
                <Button
                  onClick={() => {
                    setRoast("")
                    generateRoast()
                  }}
                  variant="outline"
                  size="sm"
                  className="border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  More Pain
                </Button>
              )}
            </div>
            
            {roastError && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 text-sm font-mono">{roastError}</p>
              </div>
            )}

            {roastLoading && (
              <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-center gap-3 text-red-600 dark:text-red-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="font-mono">Preparing brutal assessment...</span>
                </div>
              </div>
            )}

            {roast && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border-2 border-red-200 dark:border-red-800">
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none text-red-800 dark:text-red-200 font-mono leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: roast.replace(/\n/g, '<br>') 
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            variant="outline"
            className="font-mono bg-transparent border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}