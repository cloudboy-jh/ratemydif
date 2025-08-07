# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## RateMyGit Project

A Next.js application for AI-powered Git commit quality assessment with GitHub integration and authentication.

## Development Commands

- Install dependencies: `npm install` or `pnpm install` 
- Start development server: `npm run dev` or `pnpm dev`
- Build for production: `npm run build` or `pnpm build`
- Start production server: `npm run start`
- Lint code: `npm run lint` or `pnpm lint`
- No dedicated type-check command available - use `npm run build` to check types

## Project Architecture

### Tech Stack
- **Frontend**: Next.js 15+ with App Router and TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library and CSS variables
- **Authentication**: NextAuth.js with GitHub OAuth provider
- **Fonts**: Geist Sans and Geist Mono fonts
- **AI Integration**: Anthropic Claude API (primary) with OpenAI GPT fallback
- **GitHub Integration**: Octokit REST API with OAuth authentication

### Core Application Structure

**Git Commit Quality Assessment**: The app's key feature is `AIChangelogSummary` component with two distinct views:
- 😠 **Roast Mode**: Brutally honest AI feedback about commit quality (default)
- 💻 **Code Mode**: Raw git commit message display

**Authentication Flow**: NextAuth.js handles GitHub OAuth with session management via `AuthProvider` wrapper component.

**Repository Selection**: Users authenticate, select GitHub repos, then get brutally honest AI feedback about their commit quality.

### Key API Routes

- `app/api/auth/[...nextauth]/route.ts` - NextAuth.js GitHub OAuth handler
- `app/api/roast/route.ts` - AI commit roasting with brutal feedback (primary feature)
- `app/api/changelog/route.ts` - Git commit history processing  
- `app/api/repositories/route.ts` - GitHub repository listing
- `app/api/search-repo/route.ts` - Repository search functionality

### Component Architecture

**Core Components**:
- `components/ai-changelog-summary.tsx` - Main commit roasting interface with roast/code view modes
- `components/changelog-list.tsx` - Changelog display and formatting
- `components/navigation.tsx` - App navigation with auth state
- `components/session-provider.tsx` - NextAuth session context wrapper

**UI Components**: Full shadcn/ui component library in `components/ui/` with custom theme integration.

### Configuration Details

**Styling System**: Uses CSS variables for theming with both light/dark modes. Tailwind config extends with custom color palette and animations.

**Next.js Config**: Build optimizations disabled (`ignoreDuringBuilds: true`, `ignoreBuildErrors: true`) and images unoptimized for deployment flexibility.

**Mobile Optimization**: Layout includes iOS Safari viewport fixes and touch target improvements.

## Environment Variables

Required in `.env.local`:

```env
# AI API Keys (one or both required)
ANTHROPIC_API_KEY=your_claude_api_key_here  
OPENAI_API_KEY=your_openai_api_key_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# GitHub OAuth App
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## Development Notes

**AI Integration Pattern**: Roast API route uses Claude API with OpenAI fallback, utilizing randomized prompts for brutally honest feedback. Error handling includes fallback chains and proper status codes.

**State Management**: React hooks for component state, NextAuth for session management, no external state library used.

**Mobile-First Design**: Responsive layouts with specific iOS Safari fixes and touch-friendly interfaces.

**Component Patterns**: Uses shadcn/ui patterns with Radix UI primitives, consistent with className-based styling and variant props.