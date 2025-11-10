import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Farcaster Scheduler',
  description: 'Schedule and manage your Farcaster casts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          src="https://neynarxyz.github.io/siwn/raw/1.2.0/index.js"
          async
        ></script>
      </head>
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
