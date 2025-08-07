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

    // Add variation to the prompt and format
    const summaryStyles = [
      "Create a brief, clean changelog from this git history. Keep it short and organized. Use simple bullet points with emojis. Focus only on the most important changes.",
      "Generate a concise development summary from these commits. Use bullet points with relevant emojis. Highlight the key features and fixes.",
      "Transform this commit history into a readable changelog. Use emojis and bullet points. Focus on user-facing changes and important technical updates.",
      "Create a developer-friendly summary of these commits. Use bullet points with appropriate emojis. Emphasize the most significant changes and improvements.",
      "Build a clean, organized changelog from this git history. Use emojis and bullets. Focus on features, fixes, and notable changes."
    ]
    
    const emojiSets = [
      ["🚀", "🐛", "✨", "🔧", "📝", "🎨", "⚡", "🔒"],
      ["🌟", "🛠️", "💡", "🔥", "📦", "🎯", "⭐", "🚨"],
      ["✅", "🎉", "🔨", "💫", "📊", "🎪", "⚙️", "🌈"],
      ["🚧", "💎", "🎭", "🔮", "📈", "🎨", "⚡", "🌸"]
    ]
    
    const randomStyle = summaryStyles[Math.floor(Math.random() * summaryStyles.length)]
    const randomEmojis = emojiSets[Math.floor(Math.random() * emojiSets.length)]
    
    const prompt = `${randomStyle} Choose from these emojis: ${randomEmojis.join(' ')}

Commit history:
${commitHistory}

Brief changelog (max 4-5 bullet points):`

    let summary: string

    if (claudeApiKey) {
      // Use Claude API
      summary = await generateSummaryWithClaude(prompt, claudeApiKey)
    } else {
      // Fallback to OpenAI
      summary = await generateSummaryWithOpenAI(prompt, openaiApiKey!)
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}

async function generateSummaryWithClaude(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      temperature: 0.8,
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

async function generateSummaryWithOpenAI(prompt: string, apiKey: string): Promise<string> {
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
      max_tokens: 500,
      temperature: 0.85
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}