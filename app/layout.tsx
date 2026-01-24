import './globals.css'
import dynamic from 'next/dynamic'
import Footer from './components/layout/Footer'

const Header = dynamic(
  () => import('./components/layout/Header'),
  { ssr: false }
)

export const metadata = {
  title: 'Callwithpro',
  description: 'Book 1-on-1 calls with trusted professionals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="bg-white text-gray-900 antialiased"
        suppressHydrationWarning
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
