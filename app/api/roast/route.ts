import { NextRequest, NextResponse } from 'next/server'
import { RoastRequest, RoastResponse, RatingLevel } from '@/types/roast'

export const SYSTEM_PROMPT = `You are a developer roast comic. Humor must be grounded in concrete technical details and lightly flavored by the author's GitHub profile. Respect RATING_LEVEL for spice. Never include slurs or hateful content toward protected classes. Keep it clever and dev-aware. Output EXACTLY two lines.`;

export const COMMIT_PROMPT = (ratingLevel: string, patch: string, profileJson: unknown) => `
RATING_LEVEL: ${ratingLevel}

COMMIT_PATCH (verbatim):
${patch}

AUTHOR_PROFILE_JSON (verbatim):
${JSON.stringify(profileJson)}

TASK:
Analyze the code changes and infer intent/impact. Use profile details for color. OUTPUT EXACTLY TWO LINES, no intro text:

Line 1: <= 280 chars, tweetable summary roast tied to a SPECIFIC change.

Line 2: Longer roast that cites at least one concrete technical detail from the diff (file/function/var/logic) + one taste-appropriate jab tied to the profile.`;

export const PROFILE_PROMPT = (ratingLevel: string, profileJson: unknown, reposJson: unknown) => `
RATING_LEVEL: ${ratingLevel}

AUTHOR_PROFILE_JSON (verbatim):
${JSON.stringify(profileJson)}

RECENT_REPOSITORIES_JSON (verbatim):
${JSON.stringify(reposJson)}

TASK:
Roast this developer based on their GitHub profile and recent repositories. Use concrete details from their repos, languages, commit patterns, and profile info. OUTPUT EXACTLY TWO LINES, no intro text:

Line 1: <= 280 chars, tweetable roast about their coding style/choices.

Line 2: Longer roast that cites specific repos, languages, or patterns + profile details.`;

export const REPO_PROMPT = (ratingLevel: string, repoJson: unknown, profileJson: unknown, recentCommits: unknown) => `
RATING_LEVEL: ${ratingLevel}

REPOSITORY_JSON (verbatim):
${JSON.stringify(repoJson)}

AUTHOR_PROFILE_JSON (verbatim):
${JSON.stringify(profileJson)}

RECENT_COMMITS (verbatim):
${JSON.stringify(recentCommits)}

TASK:
Roast this repository and its author. Use concrete details from the repo description, languages, structure, recent commits, and author profile. OUTPUT EXACTLY TWO LINES, no intro text:

Line 1: <= 280 chars, tweetable roast about the repository.

Line 2: Longer roast that cites specific repo details, tech choices, or commit patterns + author profile jabs.`;

// Simple in-memory cache for 15 minutes
const cache = new Map<string, { data: RoastResponse; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

function getCacheKey(commitUrl: string, ratingLevel: string, model?: string): string {
  const sha = commitUrl.split('/commit/')[1]?.split('?')[0] || commitUrl;
  return `${sha}-${ratingLevel}-${model || 'default'}`;
}

type RoastType = 'commit' | 'profile' | 'repository';

function determineRoastType(url: string): { type: RoastType; username: string; repo?: string } | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    if (pathParts.length === 0) return null;
    
    // Commit URL: /owner/repo/commit/hash
    if (pathParts.length >= 4 && pathParts[2] === 'commit') {
      return { type: 'commit', username: pathParts[0], repo: pathParts[1] };
    }
    
    // Repository URL: /owner/repo
    if (pathParts.length === 2) {
      return { type: 'repository', username: pathParts[0], repo: pathParts[1] };
    }
    
    // Profile URL: /owner
    if (pathParts.length === 1) {
      return { type: 'profile', username: pathParts[0] };
    }
    
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RoastRequest = await request.json();
    const { commitUrl, username, ratingLevel, model } = body;

    // Validation and URL handling
    if (!commitUrl) {
      return NextResponse.json(
        { error: 'Commit URL is required' },
        { status: 400 }
      );
    }

    // Determine roast type (commit, profile, or repository)
    const roastInfo = determineRoastType(commitUrl);
    if (!roastInfo) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL. Please provide a profile, repository, or commit URL.' },
        { status: 400 }
      );
    }

    const actualUsername = roastInfo.username;

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
    let roastResult;

    // Handle different roast types
    switch (roastInfo.type) {
      case 'commit':
        roastResult = await handleCommitRoast(commitUrl, actualUsername, ratingLevel as RatingLevel, model, claudeApiKey, openaiApiKey);
        break;
      case 'profile':
        roastResult = await handleProfileRoast(actualUsername, ratingLevel as RatingLevel, model, claudeApiKey, openaiApiKey);
        break;
      case 'repository':
        roastResult = await handleRepositoryRoast(actualUsername, roastInfo.repo!, ratingLevel as RatingLevel, model, claudeApiKey, openaiApiKey);
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported URL type' },
          { status: 400 }
        );
    }

    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);

    if (!roastResult.success) {
      return NextResponse.json(
        { error: roastResult.error },
        { status: 500 }
      );
    }

    const response: RoastResponse = {
      tweet: (roastResult as any).tweet,
      deepRoast: (roastResult as any).deepRoast,
      model: (roastResult as any).model,
      durationMs
    };

    // Cache the response
    cache.set(cacheKey, { data: response, timestamp: Date.now() });

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
  const prompt = COMMIT_PROMPT(ratingLevel, patch, profileJson);

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

// Handler for commit roasting (original functionality)
async function handleCommitRoast(
  commitUrl: string,
  username: string,
  ratingLevel: RatingLevel,
  model: string | undefined,
  claudeApiKey: string | undefined,
  openaiApiKey: string | undefined
) {
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
    return { success: false, error: `Failed to fetch commit patch: ${patchResponse.statusText}` };
  }

  if (!profileResponse.ok) {
    return { success: false, error: `Failed to fetch GitHub profile: ${profileResponse.statusText}` };
  }

  const patch = await patchResponse.text();
  const profileJson = await profileResponse.json();

  // Truncate large patches
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

  return await generateRoastFromPrompt(COMMIT_PROMPT(ratingLevel, processedPatch, profileJson), model, claudeApiKey, openaiApiKey);
}

// Handler for profile roasting
async function handleProfileRoast(
  username: string,
  ratingLevel: RatingLevel,
  model: string | undefined,
  claudeApiKey: string | undefined,
  openaiApiKey: string | undefined
) {
  // Fetch profile and repositories in parallel
  const [profileResponse, reposResponse] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, {
      headers: { 'Accept': 'application/vnd.github+json' }
    }),
    fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
      headers: { 'Accept': 'application/vnd.github+json' }
    })
  ]);

  if (!profileResponse.ok) {
    return { success: false, error: `Failed to fetch GitHub profile: ${profileResponse.statusText}` };
  }

  if (!reposResponse.ok) {
    return { success: false, error: `Failed to fetch repositories: ${reposResponse.statusText}` };
  }

  const profileJson = await profileResponse.json();
  const reposJson = await reposResponse.json();

  return await generateRoastFromPrompt(PROFILE_PROMPT(ratingLevel, profileJson, reposJson), model, claudeApiKey, openaiApiKey);
}

// Handler for repository roasting
async function handleRepositoryRoast(
  username: string,
  repoName: string,
  ratingLevel: RatingLevel,
  model: string | undefined,
  claudeApiKey: string | undefined,
  openaiApiKey: string | undefined
) {
  // Fetch repository info, profile, and recent commits in parallel
  const [repoResponse, profileResponse, commitsResponse] = await Promise.all([
    fetch(`https://api.github.com/repos/${username}/${repoName}`, {
      headers: { 'Accept': 'application/vnd.github+json' }
    }),
    fetch(`https://api.github.com/users/${username}`, {
      headers: { 'Accept': 'application/vnd.github+json' }
    }),
    fetch(`https://api.github.com/repos/${username}/${repoName}/commits?per_page=10`, {
      headers: { 'Accept': 'application/vnd.github+json' }
    })
  ]);

  if (!repoResponse.ok) {
    return { success: false, error: `Failed to fetch repository: ${repoResponse.statusText}` };
  }

  if (!profileResponse.ok) {
    return { success: false, error: `Failed to fetch GitHub profile: ${profileResponse.statusText}` };
  }

  if (!commitsResponse.ok) {
    return { success: false, error: `Failed to fetch commits: ${commitsResponse.statusText}` };
  }

  const repoJson = await repoResponse.json();
  const profileJson = await profileResponse.json();
  const commitsJson = await commitsResponse.json();

  return await generateRoastFromPrompt(REPO_PROMPT(ratingLevel, repoJson, profileJson, commitsJson), model, claudeApiKey, openaiApiKey);
}

// Unified roast generation function
async function generateRoastFromPrompt(
  prompt: string,
  preferredModel: string | undefined,
  claudeApiKey: string | undefined,
  openaiApiKey: string | undefined
): Promise<{ success: boolean; tweet: string; deepRoast: string; model: string; error?: string }> {
  // Determine which model to use
  let useModel = preferredModel;
  if (!useModel) {
    useModel = claudeApiKey ? 'claude-3-haiku-20240307' : 'gpt-3.5-turbo';
  }

  try {
    let roastText: string;

    if (useModel.startsWith('claude') && claudeApiKey) {
      roastText = await generateRoastWithClaude(prompt, claudeApiKey, useModel);
    } else if (openaiApiKey) {
      roastText = await generateRoastWithOpenAI(prompt, openaiApiKey, useModel);
    } else {
      return { success: false, tweet: '', deepRoast: '', model: useModel, error: 'No suitable API key available' };
    }

    // Parse the response (expecting exactly two lines)
    const lines = roastText.trim().split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return { success: false, tweet: '', deepRoast: '', model: useModel, error: 'Invalid AI response format' };
    }

    return {
      success: true,
      tweet: lines[0].trim(),
      deepRoast: lines.slice(1).join('\n').trim(),
      model: useModel
    };
  } catch (error) {
    return { success: false, tweet: '', deepRoast: '', model: useModel, error: `AI generation failed: ${error}` };
  }
}