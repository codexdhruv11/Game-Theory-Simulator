import type { Metadata } from 'next'
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { SuppressHydrationWarning } from '@/components/suppress-hydration-warning'
import { RemoveBisAttribute } from '@/components/remove-bis-attribute'
import { AuthProvider } from '@/contexts/AuthContext'

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-mono',
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
})

export const metadata: Metadata = {
  title: 'Game Theory Simulator',
  description: 'Interactive game theory simulations and analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ibmPlexMono.variable} ${ibmPlexSans.variable} font-sans`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={['light', 'dark', 'system', 'theme-academic', 'theme-neon']}
        >
          <AuthProvider>
            <RemoveBisAttribute />
            <SuppressHydrationWarning>
              {children}
            </SuppressHydrationWarning>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}