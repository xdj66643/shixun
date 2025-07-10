import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '智慧道路系统',
  description: 'bug小组',
  generator: '智慧道路系统',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
