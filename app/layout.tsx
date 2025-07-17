import type { Metadata } from 'next'
import { IBM_Plex_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { SuppressHydrationWarning } from '@/components/suppress-hydration-warning'
import { RemoveBisAttribute } from '@/components/remove-bis-attribute'
import { AuthProvider } from '@/contexts/AuthContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FontProvider } from '@/components/font-provider'

// Load IBM Plex Sans for server-side rendering
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
      <body className={`${ibmPlexSans.variable} font-sans font-ibm-plex-sans`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={['light', 'dark', 'system', 'theme-academic', 'theme-neon']}
        >
          <AuthProvider>
            <TooltipProvider>
              <FontProvider>
                <RemoveBisAttribute />
                <SuppressHydrationWarning>
                  {children}
                </SuppressHydrationWarning>
              </FontProvider>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}