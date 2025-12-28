import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Punjabi Wordle',
  description: 'A Punjabi language version of Wordle',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pa">
      <body>{children}</body>
    </html>
  )
}

