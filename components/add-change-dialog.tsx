"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

type ChangelogEntry = {
  title: string
  date: string
  repoUrl: string
  summary: string
}

interface AddChangeDialogProps {
  onAddEntry: (entry: ChangelogEntry) => void
}

export function AddChangeDialog({ onAddEntry }: AddChangeDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newEntry, setNewEntry] = useState<ChangelogEntry>({
    title: "",
    date: "",
    repoUrl: "",
    summary: "",
  })

  const handleAddEntry = () => {
    if (newEntry.title && newEntry.date && newEntry.summary) {
      onAddEntry(newEntry)
      setNewEntry({ title: "", date: "", repoUrl: "", summary: "" })
      setIsDialogOpen(false)
    }
  }

  const handleInputChange = (field: keyof ChangelogEntry, value: string) => {
    setNewEntry((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="font-mono bg-transparent border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Change
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] font-mono bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="font-mono text-zinc-900 dark:text-zinc-100">Add New Changelog Entry</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="font-mono text-zinc-700 dark:text-zinc-300">
              Title
            </Label>
            <Input
              id="title"
              value={newEntry.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g. Improved File Uploads"
              className="font-mono bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date" className="font-mono text-zinc-700 dark:text-zinc-300">
              Date
            </Label>
            <Input
              id="date"
              value={newEntry.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              placeholder="e.g. July 29, 2025"
              className="font-mono bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="repoUrl" className="font-mono text-zinc-700 dark:text-zinc-300">
              Repository URL (optional)
            </Label>
            <Input
              id="repoUrl"
              value={newEntry.repoUrl}
              onChange={(e) => handleInputChange("repoUrl", e.target.value)}
              placeholder="https://github.com/..."
              className="font-mono bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="summary" className="font-mono text-zinc-700 dark:text-zinc-300">
              Summary
            </Label>
            <Textarea
              id="summary"
              value={newEntry.summary}
              onChange={(e) => handleInputChange("summary", e.target.value)}
              placeholder="- Added new feature&#10;- Fixed bug&#10;- Improved performance"
              rows={4}
              className="font-mono bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            className="font-mono bg-transparent border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddEntry}
            className="font-mono bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            Add Entry
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
