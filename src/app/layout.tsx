import './globals.css'
import React from 'react'

export const metadata = {
  title: 'animpal',
  description: '感情に合わせて日記を書けるアプリ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="bg-neutral-950 text-white">
      <body className="font-sans bg-neutral-950 min-h-screen">
        {children}
      </body>
    </html>
  )
}
