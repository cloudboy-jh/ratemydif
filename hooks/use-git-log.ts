import { useState, useEffect } from 'react'

export function useGitLog() {
  const [commitHistory, setCommitHistory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // Mock git log data for demonstration
    // In a real implementation, this would come from an API that runs `git log --pretty=format:"%h %s" -n 10`
    const mockCommitHistory = `a1b2c3 Fix auth bug in login component
d4e5f6 Update README with installation instructions
f7g8h9 Refactor login flow to use new authentication service
1a2b3c Add loading spinner to dashboard for better UX
4d5e6f Fix typo in onboarding screen welcome message
9g8h7i Implement password reset functionality
2f3g4h Add unit tests for user authentication
5h6i7j Update dependencies to latest versions
8k9l0m Fix responsive design issues on mobile devices
3n4o5p Add error handling for API requests`

    // Simulate API delay
    setTimeout(() => {
      setCommitHistory(mockCommitHistory)
      setLoading(false)
    }, 500)
  }, [])

  return {
    commitHistory,
    loading,
    error
  }
}