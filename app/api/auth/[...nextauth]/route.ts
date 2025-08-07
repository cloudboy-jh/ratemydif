import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import type { JWT } from "next-auth/jwt"
import type { Session } from "next-auth"
import type { Account } from "next-auth"

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }: { token: JWT; account: Account | null }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Send properties to the client, like an access_token from a provider
      session.accessToken = token.accessToken as string
      return session
    },
  },
  pages: {
    signIn: "/",
  },
  // Ensure the URL is properly configured
  url: process.env.NEXTAUTH_URL || "https://ratemygit.xyz",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 