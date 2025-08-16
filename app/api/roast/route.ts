import { NextRequest, NextResponse } from 'next/server'
import { RoastRequest, RoastResponse, RatingLevel } from '@/types/roast'

export const SYSTEM_PROMPT = `You are a developer roast comic. Humor must be grounded in concrete technical details from the diff and lightly flavored by the author's GitHub profile. Respect RATING_LEVEL for spice. Never include slurs or hateful content toward protected classes. Keep it clever and dev-aware. Output EXACTLY two lines.`;

export const USER_PROMPT = (ratingLevel: string, patch: string, profileJson: unknown) => `
RATING_LEVEL: ${ratingLevel}

COMMIT_PATCH (verbatim):
${patch}

AUTHOR_PROFILE_JSON (verbatim):
${JSON.stringify(profileJson)}

TASK:
Analyze the code changes and infer intent/impact. Use profile details for color. OUTPUT EXACTLY TWO LINES, no intro text:

Line 1: <= 280 chars, tweetable summary roast tied to a SPECIFIC change.

Line 2: Longer roast that cites at least one concrete technical detail from the diff (file/function/var/logic) + one taste-appropriate jab tied to the profile.`;

// Simple in-memory cache for 15 minutes
const cache = new Map<string, { data: RoastResponse; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

function getCacheKey(commitUrl: string, ratingLevel: string, model?: string): string {
  const sha = commitUrl.split('/commit/')[1]?.split('?')[0] || commitUrl;
  return `${sha}-${ratingLevel}-${model || 'default'}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: RoastRequest = await request.json();
    const { commitUrl, username, ratingLevel, model } = body;

    // Validation
    if (!commitUrl || !commitUrl.includes('/commit/')) {
      return NextResponse.json(
        { error: 'Invalid commit URL. Must include /commit/' },
        { status: 400 }
      );
    }

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    if (!['G', 'PG', 'R', 'Unhinged'].includes(ratingLevel)) {
      return NextResponse.json(
        { error: 'Invalid rating level. Must be G, PG, R, or Unhinged' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = getCacheKey(commitUrl, ratingLevel, model);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // Fetch patch and profile in parallel
    const [patchResponse, profileResponse] = await Promise.all([
      fetch(commitUrl + '.patch', {
        headers: { 'Accept': 'text/plain' }
      }),
      fetch(`https://api.github.com/users/${username}`, {
        headers: { 'Accept': 'application/vnd.github+json' }
      })
    ]);

    if (!patchResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch commit patch: ${patchResponse.statusText}` },
        { status: 400 }
      );
    }

    if (!profileResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch GitHub profile: ${profileResponse.statusText}` },
        { status: 400 }
      );
    }

    const patch = await patchResponse.text();
    const profileJson = await profileResponse.json();

    // Truncate large patches (keep head and tail, mark truncation)
    let processedPatch = patch;
    if (patch.length > 8000) {
      const lines = patch.split('\n');
      const headLines = lines.slice(0, 100);
      const tailLines = lines.slice(-100);
      processedPatch = [
        ...headLines,
        '... [TRUNCATED FOR LENGTH] ...',
        ...tailLines
      ].join('\n');
    }

    // Check for API keys
    const claudeApiKey = process.env.ANTHROPIC_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!claudeApiKey && !openaiApiKey) {
      return NextResponse.json(
        { error: 'No AI API key configured' },
        { status: 500 }
      );
    }

    const startTime = performance.now();
    
    // Generate roast
    const roastResult = await generateRoast(
      ratingLevel as RatingLevel,
      processedPatch,
      profileJson,
      model,
      claudeApiKey,
      openaiApiKey
    );

    const durationMs = Math.round(performance.now() - startTime);

    const response: RoastResponse = {
      tweet: roastResult.tweet,
      deepRoast: roastResult.deepRoast,
      model: roastResult.model,
      durationMs
    };

    // Cache the result
    cache.set(cacheKey, { data: response, timestamp: Date.now() });

    // Clean up old cache entries occasionally
    if (Math.random() < 0.1) {
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          cache.delete(key);
        }
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating roast:', error);
    return NextResponse.json(
      { error: 'Failed to generate roast' },
      { status: 500 }
    );
  }
}

async function generateRoast(
  ratingLevel: RatingLevel,
  patch: string,
  profileJson: unknown,
  preferredModel?: string,
  claudeApiKey?: string,
  openaiApiKey?: string
): Promise<{ tweet: string; deepRoast: string; model: string }> {
  const prompt = USER_PROMPT(ratingLevel, patch, profileJson);

  // Determine which model to use
  let useModel = preferredModel;
  if (!useModel) {
    useModel = claudeApiKey ? 'claude-3-haiku-20240307' : 'gpt-3.5-turbo';
  }

  let result: string;

  try {
    if (useModel.startsWith('claude') && claudeApiKey) {
      result = await generateRoastWithClaude(prompt, claudeApiKey, useModel);
    } else if ((useModel.startsWith('gpt') || useModel.startsWith('o')) && openaiApiKey) {
      result = await generateRoastWithOpenAI(prompt, openaiApiKey, useModel);
    } else {
      // Fallback
      if (claudeApiKey) {
        result = await generateRoastWithClaude(prompt, claudeApiKey, 'claude-3-haiku-20240307');
        useModel = 'claude-3-haiku-20240307';
      } else if (openaiApiKey) {
        result = await generateRoastWithOpenAI(prompt, openaiApiKey, 'gpt-3.5-turbo');
        useModel = 'gpt-3.5-turbo';
      } else {
        throw new Error('No API key available');
      }
    }
  } catch (error) {
    // Fallback to the other provider
    if (useModel.startsWith('claude') && openaiApiKey) {
      result = await generateRoastWithOpenAI(prompt, openaiApiKey, 'gpt-3.5-turbo');
      useModel = 'gpt-3.5-turbo';
    } else if (claudeApiKey) {
      result = await generateRoastWithClaude(prompt, claudeApiKey, 'claude-3-haiku-20240307');
      useModel = 'claude-3-haiku-20240307';
    } else {
      throw error;
    }
  }

  // Parse the two lines
  const lines = result.trim().split('\n').filter(line => line.trim());
  
  let tweet = lines[0] || 'Your code speaks for itself... unfortunately.';
  let deepRoast = lines[1] || 'A deeper analysis reveals... well, let\'s just say there\'s room for improvement.';

  // Ensure tweet is <= 280 characters
  if (tweet.length > 280) {
    tweet = tweet.substring(0, 277) + '...';
  }

  return { tweet, deepRoast, model: useModel };
}

async function generateRoastWithClaude(
  prompt: string,
  apiKey: string,
  model: string = 'claude-3-haiku-20240307'
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 300,
      temperature: 0.9,
      system: SYSTEM_PROMPT,
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

async function generateRoastWithOpenAI(
  prompt: string,
  apiKey: string,
  model: string = 'gpt-3.5-turbo'
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.9
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}