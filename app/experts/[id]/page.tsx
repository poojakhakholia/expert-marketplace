'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/* ---------- Components (FROZEN) ---------- */
import HostProfileBanner from './components/HostProfileBanner'
import HostAbout from './components/HostAbout'
import HostTopics from './components/HostTopics'
import HostQuickFacts from './components/HostQuickFacts'
import HostReviews from './components/HostReviews'

/* ---------- Types ---------- */

type Expert = {
  user_id: string
  full_name: string
  headline?: string
  bio?: string
  city?: string
  country?: string
  company?: string
  profile_image_url?: string

  designation?: string
  experience_years?: number

  categories?: string[]
  topics?: string[]

  rating?: number
  conversations_count?: number
}

/* ---------- Page ---------- */

export default function ExpertProfilePage() {
  const { id } = useParams()
  const [expert, setExpert] = useState<Expert | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) fetchExpert()
  }, [id])

  async function fetchExpert() {
    setLoading(true)

    const { data: publicRow, error } = await supabase
      .from('public_expert_search')
      .select('*')
      .eq('user_id', id)
      .single()

    if (error || !publicRow) {
      setExpert(null)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('expert_profiles')
      .select(
        `
        profile_image_url,
        designation,
        experience_years,
        sub_category_tags
      `
      )
      .eq('user_id', id)
      .single()

    setExpert({
      user_id: publicRow.user_id,
      full_name: publicRow.full_name,
      headline: publicRow.headline,
      bio: publicRow.bio,
      city: publicRow.city,
      country: publicRow.country,
      company: publicRow.company,

      profile_image_url: profile?.profile_image_url,
      designation: profile?.designation || 'Advisor',
      experience_years: profile?.experience_years,

      categories: publicRow.categories || [],
      topics: profile?.sub_category_tags || [],

      rating: publicRow.average_rating ?? 4.9,
      conversations_count: publicRow.total_reviews ?? 0,
    })

    setLoading(false)
  }

  /* ---------- Loading / Error ---------- */

  if (loading) {
    return (
      <main className="relative min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
        <div className="mx-auto max-w-6xl px-6 py-24 text-slate-500">
          Loading profile…
        </div>
      </main>
    )
  }

  if (!expert) {
    return (
      <main className="relative min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
        <div className="mx-auto max-w-6xl px-6 py-24 text-slate-500">
          Profile not found.
        </div>
      </main>
    )
  }

  /* ---------- Main ---------- */

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      {/* Soft Intella atmospheric glow (lighter than Home) */}
      <div className="pointer-events-none absolute -top-48 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-sky-200/25 blur-[180px]" />

      {/* Content rail */}
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Banner */}
        <HostProfileBanner expert={expert} />

        {/* Unified content surface */}
        <div className="mt-6 rounded-3xl bg-white/70 backdrop-blur border border-slate-200/60 px-6 md:px-8 pb-16">

          {/* 2-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-10 pt-8">

            {/* LEFT: narrative */}
            <div className="space-y-6">
              <HostAbout bio={expert.bio || ''} />

              {/* subtle divider */}
              <div className="h-px bg-slate-200/50" />

              <HostTopics topics={expert.topics} />

              {/* subtle divider */}
              <div className="h-px bg-slate-200/50" />

              <HostReviews />
            </div>

            {/* RIGHT: quick facts (supporting) */}
            <aside className="md:pt-2">
              <HostQuickFacts
                designation={expert.designation}
                company={expert.company}
                experience_years={expert.experience_years}
                conversations_count={expert.conversations_count}
                city={expert.city}
                country={expert.country}
              />
            </aside>
          </div>
        </div>
      </div>
    </main>
  )
}
