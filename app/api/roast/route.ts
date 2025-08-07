import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { commitHistory } = await request.json()

    if (!commitHistory || typeof commitHistory !== 'string') {
      return NextResponse.json(
        { error: 'Invalid commit history provided' },
        { status: 400 }
      )
    }

    // Check for API keys - prioritize Claude, fallback to OpenAI
    const claudeApiKey = process.env.ANTHROPIC_API_KEY
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!claudeApiKey && !openaiApiKey) {
      return NextResponse.json(
        { error: 'No AI API key configured' },
        { status: 500 }
      )
    }

    const prompt = `You are an extremely judgmental and brutally honest code reviewer who has absolutely no filter. Your job is to ruthlessly roast this developer's git commit history. Be mean, sarcastic, and brutal but still somewhat constructive. Point out poor commit message practices, inconsistent patterns, obvious mistakes, and questionable development habits. Use dark humor and don't hold back - but keep it professional enough that it's clearly meant to be humorous feedback rather than actual harassment.

Look at these commit messages and absolutely tear them apart:

${commitHistory}

Your brutal assessment:`

    let roast: string

    if (claudeApiKey) {
      // Use Claude API
      roast = await generateRoastWithClaude(prompt, claudeApiKey)
    } else {
      // Fallback to OpenAI
      roast = await generateRoastWithOpenAI(prompt, openaiApiKey!)
    }

    return NextResponse.json({ roast })
  } catch (error) {
    console.error('Error generating roast:', error)
    return NextResponse.json(
      { error: 'Failed to generate roast' },
      { status: 500 }
    )
  }
}

async function generateRoastWithClaude(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1200,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.content[0].text
}

async function generateRoastWithOpenAI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1200,
      temperature: 0.8
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}