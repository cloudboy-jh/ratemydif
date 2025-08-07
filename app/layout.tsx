import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { AuthProvider } from '@/components/session-provider'

export const metadata: Metadata = {
  title: 'GitScroll',
  description: 'AI-powered changelog viewer for GitHub repositories',
  icons: {
    icon: '/1.svg',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}

/* iOS Safari specific fixes */
body {
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Prevent horizontal scrolling */
html, body {
  overflow-x: hidden;
  width: 100%;
}

/* Touch target improvements for mobile */
@media (max-width: 768px) {
  button, a, input, select, textarea {
    min-height: 44px;
    min-width: 44px;
  }
}

/* Fix iOS Safari viewport issues */
@supports (-webkit-touch-callout: none) {
  .min-h-screen {
    min-height: -webkit-fill-available;
  }
}
        `}</style>
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
