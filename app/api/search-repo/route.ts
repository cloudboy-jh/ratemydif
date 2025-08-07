import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated or missing access token' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner')
    const repo = searchParams.get('repo')

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Owner and repo parameters are required' },
        { status: 400 }
      )
    }

    // Fetch repository information from GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'changelog-app'
        }
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Repository not found or not accessible' },
          { status: 404 }
        )
      }
      
      const errorData = await response.json()
      return NextResponse.json(
        { 
          error: 'Failed to fetch repository from GitHub',
          details: errorData.message || 'Unknown error'
        },
        { status: response.status }
      )
    }

    const repository = await response.json()

    // Format repository data to match the expected structure
    const formattedRepo = {
      id: repository.id,
      name: repository.name,
      full_name: repository.full_name,
      private: repository.private,
      description: repository.description,
      html_url: repository.html_url,
      updated_at: repository.updated_at
    }

    return NextResponse.json(formattedRepo)

  } catch (error) {
    console.error('Error searching repository:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}