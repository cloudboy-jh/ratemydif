import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Session:', session ? 'exists' : 'null')
    console.log('Access token:', session?.accessToken ? 'present' : 'missing')
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated or missing access token' },
        { status: 401 }
      )
    }

    // Fetch user's repositories from GitHub API
    const response = await fetch(
      'https://api.github.com/user/repos?sort=updated&per_page=100',
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
          error: 'Failed to fetch repositories from GitHub',
          details: errorData.message || 'Unknown error'
        },
        { status: response.status }
      )
    }

    const repositories = await response.json()

    // Filter and format repositories
    const formattedRepos = repositories.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      description: repo.description,
      html_url: repo.html_url,
      updated_at: repo.updated_at
    }))

    return NextResponse.json(formattedRepos)

  } catch (error) {
    console.error('Error fetching repositories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 