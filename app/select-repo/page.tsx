"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { SearchRepo } from "@/components/searchrepo"

export default function SelectRepoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // If not authenticated, redirect to home for auth
    if (status === "unauthenticated") {
      router.push('/')
    }
  }, [status, router])

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

  if (!session) {
    return null // Will redirect to home
  }

  return <SearchRepo />
}