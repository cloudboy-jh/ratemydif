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

    // Add variation to the prompt
    const roastStyles = [
      "You're a brutally honest code reviewer. Roast this commit in 1-2 savage sentences. Be blunt, use profanity if needed, and call out terrible commit habits. No fluff.",
      "You're a pissed-off senior dev. Give a harsh but hilarious 1-2 sentence roast of this commit. Swear if you want, be direct, avoid saying 'ah' constantly.",
      "You're a no-bullshit code reviewer. Deliver a short, cutting roast in 1-2 sentences. Be brutal, funny, and don't hold back on language.",
      "You're an angry git expert. Give a savage 1-2 sentence takedown of this commit. Use strong language, be merciless, skip the 'ah' filler words.",
      "You're a fed-up developer. Roast this commit in 1-2 brutal sentences. Swear freely, be savage, and avoid repetitive phrases like 'ah' or 'oh'."
    ]
    
    const randomStyle = roastStyles[Math.floor(Math.random() * roastStyles.length)]
    
    const prompt = `${randomStyle}

Commit:
${commitHistory}

Roast (1-2 sentences max):`

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
      max_tokens: 150,
      temperature: 1.0,
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
      max_tokens: 150,
      temperature: 1.0
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}