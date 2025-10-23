export const metadata = {
  title: 'Mini Piano (Next.js)',
  description: 'A mini piano built with Next.js',
}

import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

