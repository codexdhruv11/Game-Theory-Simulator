"use client"

import React from 'react'
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-mono',
})

export function FontProvider({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      {children}
    </div>
  )
} 