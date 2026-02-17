import './globals.css'
import dynamic from 'next/dynamic'
import type { Metadata } from 'next'
import Footer from './components/layout/Footer'

const Header = dynamic(
  () => import('./components/layout/Header'),
  { ssr: false }
)

export const metadata: Metadata = {
  metadataBase: new URL('https://intella.in'),

  title: {
    default: 'Intella India | Book 1-on-1 Calls with Real Industry Experts',
    template: '%s | Intella India',
  },

  description:
    'Intella is an India-first platform to book paid 1-on-1 calls with founders, product managers, consultants, and professionals. Learn directly from real world experience.',

  keywords: [
    '1 on 1 expert call India',
    'paid mentorship India',
    'career guidance call India',
    'talk to product manager India',
    'startup mentor India',
    'expert consultation platform India',
    'book expert call online India',
  ],

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  verification: {
    google: 'nz6AMDOdNx7s6bdCrPcYmYrNbaNCdcQNAmK3x18nsPk',
  },

  openGraph: {
    title: 'Intella India | Book 1-on-1 Calls with Real Industry Experts',
    description:
      'Connect with real professionals across India. Book 1-on-1 calls and learn from real world experience.',
    url: 'https://intella.in',
    siteName: 'Intella India',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Intella India | 1-on-1 Expert Calls Platform',
    description:
      'Book paid 1-on-1 calls with founders, product managers and professionals across India.',
  },

  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col"
      >
        <Header />

        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  )
}
