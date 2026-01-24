'use client'

import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">

      {/* SKY BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-100 to-white" />

      {/* CLOUD MIST (STRONG + VISIBLE) */}
      <div className="absolute bottom-40 left-1/4 h-[520px] w-[520px] rounded-full bg-white opacity-90 blur-[160px]" />
      <div className="absolute bottom-48 right-1/4 h-[480px] w-[480px] rounded-full bg-white opacity-85 blur-[150px]" />
      <div className="absolute bottom-56 left-1/2 h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-white opacity-80 blur-[140px]" />

      {/* CLOUD HORIZON (THIS IS THE KEY) */}
      <svg
        viewBox="0 0 1440 320"
        className="absolute bottom-0 left-0 w-full"
        preserveAspectRatio="none"
      >
        <path
          fill="#ffffff"
          d="M0,224L80,213.3C160,203,320,181,480,176C640,171,800,181,960,197.3C1120,213,1280,235,1360,245.3L1440,256L1440,0L0,0Z"
        />
      </svg>

      {/* CONTENT */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">

        <h1 className="text-4xl md:text-5xl font-semibold text-slate-800 leading-tight">
          Everyone knows something
          <br className="hidden md:block" />
          worth sharing
        </h1>

        <p className="mt-6 max-w-2xl text-lg md:text-xl text-slate-600">
          Turn your knowledge and experience into income by hosting
          paid one-to-one conversations.
        </p>

        {/* CTAs */}
        <div className="mt-14 flex flex-wrap justify-center gap-6">
          <Link
            href="/become-a-pro/step-1-basic"
            className="flex items-center gap-3 rounded-full bg-orange-500 px-10 py-4 text-white text-sm font-medium shadow-xl hover:bg-orange-600 transition"
          >
            <span className="text-lg">💬</span>
            Host a conversation
          </Link>

          <Link
            href="/explore"
            className="flex items-center gap-3 rounded-full bg-white px-10 py-4 text-sm font-medium text-slate-700 shadow-xl hover:shadow-2xl transition"
          >
            <span className="text-lg">🔍</span>
            Explore conversations
          </Link>
        </div>

        {/* INFOGRAPHICS */}
        <div className="mt-24 flex flex-wrap justify-center gap-16 text-slate-600">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💡</span>
            <span className="text-sm">Real experiences</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl">🤝</span>
            <span className="text-sm">1-on-1 conversations</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl">💸</span>
            <span className="text-sm">Get paid flexibly</span>
          </div>
        </div>
      </div>
    </section>
  )
}
