# GitSroll Project

A Next.js application for changelog management with authentication and GitHub integration.

## Project Structure
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **UI Components**: shadcn/ui component library
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS with custom theme provider

## Key Components
- `components/changelog-list.tsx` - Main changelog display
- `components/changelog-item-dialog.tsx` - Changelog item details
- `components/navigation.tsx` - App navigation
- `app/api/` - API routes for auth, changelog, and repositories

## Development Commands
- Install dependencies: `npm install` or `pnpm install`
- Start dev server: `npm run dev` or `pnpm dev`
- Build: `npm run build` or `pnpm build`
- Type check: `npm run type-check` or `pnpm type-check`
- Lint: `npm run lint` or `pnpm lint`

## Environment Variables
Create a `.env.local` file in the project root with:

```
# AI API Keys (choose one or both)
ANTHROPIC_API_KEY=your_claude_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# NextAuth configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## AI Changelog Features
- **API Routes**: 
  - `app/api/summary/route.ts` - Processes git commit history with AI
  - `app/api/roast/route.ts` - Brutally honest AI feedback on git commits
- **Component**: `components/ai-changelog-summary.tsx` - Multi-mode changelog viewer
- **Three View Modes**:
  - 🧠 **AI** (default): Clean AI-generated changelog summaries
  - 💻 **Code**: Raw git commit messages
  - 😠 **Roast**: Extremely judgy AI feedback about coding habits
- **AI Models**: Supports Claude (Anthropic) and OpenAI GPT models

## Tech Stack
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- NextAuth.js for authentication
- Claude/OpenAI integration for AI summaries