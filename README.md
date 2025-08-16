# RateMyGit

A Next.js application for AI-powered Git commit quality assessment with GitHub integration and brutal honesty.

## Overview

RateMyGit provides brutally honest AI feedback about your Git commits. Connect your GitHub account, select a repository, and get roasted by AI about your coding habits and commit quality.

## GitHub OAuth Integration Setup

This changelog app now includes GitHub OAuth authentication and repository selection functionality.

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# AI API Keys (at least one required)
ANTHROPIC_API_KEY=your_claude_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# GitHub OAuth App Configuration
# Create a GitHub OAuth App at: https://github.com/settings/developers
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here
```

### API Keys Setup

#### Anthropic Claude API (Recommended)
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an account and get your API key
3. Add it to `.env.local` as `ANTHROPIC_API_KEY`

#### OpenAI API (Fallback)
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get your API key
3. Add it to `.env.local` as `OPENAI_API_KEY`

**Note**: You need at least one AI API key. The app will use Claude if available, otherwise OpenAI.

### GitHub OAuth App Setup

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: RateMyGit
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret** to your `.env.local` file

### NextAuth Secret Setup

Generate a random secret for NextAuth:

```bash
openssl rand -base64 32
```

Or use any random string and add it to your `.env.local` file as `NEXTAUTH_SECRET`.

### Usage

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000` (you'll be redirected to the home page)
3. Click "Connect with GitHub" to authenticate
4. Select a repository from the list
5. Click "View Changelog for [repository]" to see the changelog page
6. Click "Fetch from GitHub" to load real commit data
7. The app will display the most recent 20 commits from your selected repository
8. Each commit shows:
   - Title (first line of commit message)
   - Date (formatted as readable text)
   - Link to the commit on GitHub
   - Full commit message as summary

### API Endpoint

The backend API is available at `/api/changelog` and returns JSON data in the following format:

```json
[
  {
    "title": "Commit message title",
    "date": "January 15, 2025",
    "repoLink": "https://github.com/owner/repo/commit/abc123",
    "summary": "Full commit message with details..."
  }
]
```