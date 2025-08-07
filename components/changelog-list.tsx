"use client"

import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import { ChangelogItemDialog } from "@/components/changelog-item-dialog"

type ChangelogEntry = {
  title: string
  date: string
  repoLink: string
  summary: string
}

interface ChangelogListProps {
  entries: ChangelogEntry[]
}

export function ChangelogList({ entries }: ChangelogListProps) {
  return (
    <main className="relative h-[600px] sm:h-[800px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-400 dark:scrollbar-thumb-zinc-600 scrollbar-track-zinc-200 dark:scrollbar-track-zinc-800">
      {/* Timeline line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-zinc-300 dark:bg-zinc-700 transform -translate-x-1/2 hidden sm:block"></div>

      <div className="space-y-8">
        {entries.map((entry, index) => (
          <div key={index} className="relative">
            {/* Timeline dot */}
            <div className="absolute left-1/2 top-6 w-3 h-3 bg-zinc-400 dark:bg-zinc-600 rounded-full transform -translate-x-1/2 hidden sm:block"></div>

            <ChangelogItemDialog entry={entry}>
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 sm:p-6 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 relative z-10 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors touch-manipulation">
                <div className="flex flex-col gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      {index === 0 && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>}
                      <h3 className="text-lg sm:text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 leading-tight break-words">{entry.title}</h3>
                    </div>
                    <time className="text-xs sm:text-sm font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                      {entry.date}
                    </time>
                  </div>
                  {entry.repoLink && (
                    <div className="flex justify-end">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-transparent min-h-[44px] whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a href={entry.repoLink} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">View Commit</span>
                          <span className="sm:hidden">View</span>
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
                <pre className="font-mono text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words overflow-x-auto">
                  {entry.summary}
                </pre>
              </div>
            </ChangelogItemDialog>
          </div>
        ))}
      </div>
    </main>
  )
}
