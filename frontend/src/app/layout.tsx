import React from 'react'
import './globals.css'

export const metadata = {
  title: 'FragsHub - Esports Tournament Platform',
  description: 'Join competitive gaming tournaments, register teams, and compete for prizes.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
  <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
