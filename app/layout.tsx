import './globals.css'
import dynamic from 'next/dynamic'
import Footer from './components/layout/Footer'

const Header = dynamic(
  () => import('./components/layout/Header'),
  { ssr: false }
)

export const metadata = {
  title: 'Intella',
  description: 'Book 1-on-1 calls to learn from peoples real world experience',
  verification: {
    google: 'nz6AMDOdNx7s6bdCrPcYmYrNbaNCdcQNAmK3x18nsPk',
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
        {/* Header stays at top */}
        <Header />

        {/* Main content grows to push footer down */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer stays at bottom */}
        <Footer />
      </body>
    </html>
  )
}
