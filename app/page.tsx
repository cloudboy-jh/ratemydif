"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun, ArrowUpDown, Pencil } from "lucide-react"
import { ChangelogList } from "@/components/changelog-list"
import { AddChangeDialog } from "@/components/add-change-dialog"

type ChangelogEntry = {
  title: string
  date: string
  repoUrl: string
  summary: string
}

const initialChangelogData: ChangelogEntry[] = [
  {
    title: "Improved File Uploads",
    date: "July 29, 2025",
    repoUrl: "https://github.com/vercel/next.js/pull/12345",
    summary: `
- Added support for drag-and-drop file uploads.
- Increased the maximum file size limit to 100MB.
- Improved error handling for failed uploads.
    `.trim(),
  },
  {
    title: "New Dashboard Analytics",
    date: "July 22, 2025",
    repoUrl: "https://github.com/vercel/next.js/pull/12340",
    summary: `
- Introduced a new analytics section in the user dashboard.
- Added real-time visitor tracking.
- Included customizable date ranges for reports.
    `.trim(),
  },
  {
    title: "Dark Mode Support",
    date: "July 15, 2025",
    repoUrl: "https://github.com/vercel/next.js/pull/12333",
    summary: `
- Implemented a site-wide dark mode theme.
- Users can now toggle between light and dark modes.
- Saved user preference in local storage.
    `.trim(),
  },
  {
    title: "API Performance Enhancements",
    date: "July 08, 2025",
    repoUrl: "https://github.com/vercel/next.js/pull/12321",
    summary: `
- Optimized database queries for faster API responses.
- Reduced average API latency by 30%.
- Implemented caching for frequently accessed endpoints.
    `.trim(),
  },
  {
    title: "User Authentication Overhaul",
    date: "July 01, 2025",
    repoUrl: "https://github.com/vercel/next.js/pull/12315",
    summary: `
- Migrated to OAuth 2.0 for improved security.
- Added support for social login providers.
- Implemented two-factor authentication.
- Enhanced password reset functionality.
    `.trim(),
  },
]

export default function ChangelogPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [changelogData, setChangelogData] = useState<ChangelogEntry[]>(initialChangelogData)
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [title, setTitle] = useState("Changelog")
  const [isEditingTitle, setIsEditingTitle] = useState(false)

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

  const handleAddEntry = (newEntry: ChangelogEntry) => {
    setChangelogData([newEntry, ...changelogData])
  }

  const sortByDate = () => {
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
  }

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen transition-colors duration-300">
      <div className="container mx-auto max-w-3xl px-4 py-12 sm:py-12">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setIsEditingTitle(false)
                  }
                }}
                className="text-4xl font-bold font-mono text-zinc-900 dark:text-zinc-50 bg-transparent border-none outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 rounded px-2"
                autoFocus
              />
            ) : (
              <h1
                className="text-4xl font-bold font-mono text-zinc-900 dark:text-zinc-50 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors px-2"
                onClick={() => setIsEditingTitle(true)}
              >
                {title}
              </h1>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-transparent"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </header>

        <div className="flex justify-center items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingTitle(true)}
            className="font-mono bg-transparent border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit Title
          </Button>
          <AddChangeDialog onAddEntry={handleAddEntry} />
          <Button
            variant="outline"
            size="sm"
            onClick={sortByDate}
            className="font-mono bg-transparent border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            {sortOrder === "newest" ? "Oldest First" : "Newest First"}
          </Button>
        </div>

        <ChangelogList entries={changelogData} />
      </div>
    </div>
  )
}
