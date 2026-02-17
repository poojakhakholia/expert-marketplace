import HeroSection from './components/HeroSection'
import CategoryExpertsSection from './components/CategoryExpertsSection'
import HowItWorksSection from './components/HowItWorksSection'

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "Intella India",
        "url": "https://intella.in",
        "logo": "https://intella.in/intella-logo.png",
        "description":
          "Intella is an India-first platform to book 1-on-1 calls with founders, product managers, consultants and professionals.",
      },
      {
        "@type": "WebSite",
        "name": "Intella India",
        "url": "https://intella.in",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://intella.in/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  }

  return (
    <main>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero */}
      <HeroSection />

      {/* How it Works */}
      <HowItWorksSection />
    </main>
  )
}
