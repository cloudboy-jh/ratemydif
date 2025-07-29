import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      date: string
    }
  }
  html_url: string
}

interface ChangelogEntry {
  title: string
  date: string
  repoLink: string
  summary: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated or missing access token' },
        { status: 401 }
      )
    }

    // Get repository info from query parameters
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner')
    const repo = searchParams.get('repo')

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Repository owner and name are required' },
        { status: 400 }
      )
    }

    // Fetch recent commits from GitHub API using user's access token
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=20`,
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'changelog-app'
        }
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { 
          error: 'Failed to fetch commits from GitHub',
          details: errorData.message || 'Unknown error'
        },
        { status: response.status }
      )
    }

    const commits: GitHubCommit[] = await response.json()

    // Transform commits to changelog format
    const changelogEntries: ChangelogEntry[] = commits.map(commit => {
      const messageLines = commit.commit.message.split('\n')
      const title = messageLines[0]
      const summary = commit.commit.message
      
      // Format date to readable format
      const commitDate = new Date(commit.commit.author.date)
      const date = commitDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      return {
        title,
        date,
        repoLink: commit.html_url,
        summary
      }
    })

    return NextResponse.json(changelogEntries)

  } catch (error) {
    console.error('Error fetching changelog:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 