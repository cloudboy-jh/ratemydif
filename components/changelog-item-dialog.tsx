"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Github, Calendar, FileText } from "lucide-react"

type ChangelogEntry = {
  title: string
  date: string
  repoLink: string
  summary: string
}

interface ChangelogItemDialogProps {
  entry: ChangelogEntry
  children: React.ReactNode
}

export function ChangelogItemDialog({ entry, children }: ChangelogItemDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] w-[95vw] font-mono bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 max-h-[85vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg sm:text-xl lg:text-2xl text-zinc-900 dark:text-zinc-100 mb-3 sm:mb-4 break-words leading-tight">{entry.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Date Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Commit Date
              </p>
              <time className="text-sm sm:text-base lg:text-lg font-mono text-zinc-900 dark:text-zinc-100">{entry.date}</time>
            </div>
          </div>

          {/* Repository Section */}
          {entry.repoLink && (
            <div className="flex items-center gap-2 sm:gap-3">
              <Github className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Commit Link
                </p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="font-mono bg-transparent border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[44px] w-full sm:w-auto"
                >
                  <a href={entry.repoLink} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4 mr-2" />
                    View Commit
                  </a>
                </Button>
              </div>
            </div>
          )}

          {/* Summary Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
              <p className="text-xs sm:text-sm font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Commit Message
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 sm:p-4 border border-zinc-200 dark:border-zinc-700">
              <pre className="font-mono text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words leading-relaxed overflow-x-auto">
                {entry.summary}
              </pre>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4 sm:mt-6">
          <Button
            variant="outline"
            className="font-mono bg-transparent border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[44px]"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
