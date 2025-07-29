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
      <DialogContent className="sm:max-w-[600px] font-mono bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-2xl text-zinc-900 dark:text-zinc-100 mb-4">{entry.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Section */}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            <div>
              <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Commit Date
              </p>
              <time className="text-lg font-mono text-zinc-900 dark:text-zinc-100">{entry.date}</time>
            </div>
          </div>

          {/* Repository Section */}
          {entry.repoLink && (
            <div className="flex items-center gap-3">
              <Github className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
              <div className="flex-1">
                <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Commit Link
                </p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="font-mono bg-transparent border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
              <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Commit Message
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
              <pre className="font-mono text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words leading-relaxed">
                {entry.summary}
              </pre>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            variant="outline"
            className="font-mono bg-transparent border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
