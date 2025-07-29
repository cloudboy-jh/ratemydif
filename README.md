# Vertical changelog component

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/jack-s-projects-79534cb2/v0-vertical-changelog-component)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/7CslDAkLU43)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/jack-s-projects-79534cb2/v0-vertical-changelog-component](https://vercel.com/jack-s-projects-79534cb2/v0-vertical-changelog-component)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/7CslDAkLU43](https://v0.dev/chat/projects/7CslDAkLU43)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## GitHub OAuth Integration Setup

This changelog app now includes GitHub OAuth authentication and repository selection functionality.

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# GitHub OAuth App Configuration
# Create a GitHub OAuth App at: https://github.com/settings/developers
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# Legacy GitHub Token (optional - for direct API access)
GITHUB_TOKEN=your_github_personal_access_token_here
```

### GitHub OAuth App Setup

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: Changelog Generator
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