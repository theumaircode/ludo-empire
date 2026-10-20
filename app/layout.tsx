import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cinzel, Rajdhani } from 'next/font/google'
import './globals.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-cinzel',
})

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani',
})

export const metadata: Metadata = {
  title: 'LUDO EMPIRE',
  description:
    'Enter the Mysterious Forest and conquer the Black Hole Singularity to claim the Universe Ruling Ring.',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/game-icon.jpg',
    shortcut: '/images/game-icon.jpg',
    apple: '/images/game-icon.jpg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#040507',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${rajdhani.variable} dark`}>
      <body className="bg-[#040507] text-[#e8dcc4] font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
