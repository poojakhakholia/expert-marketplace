'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/* ---------- Components (FROZEN) ---------- */
import HostProfileBanner from './components/HostProfileBanner'
import HostAbout from './components/HostAbout'
import HostTopics from './components/HostTopics'
import HostQuickFacts from './components/HostQuickFacts'
import HostReviews from './components/HostReviews'
import HostFAQs from './components/HostFAQs'

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

    /* 1️⃣ Canonical public view */
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

    /* 2️⃣ Profile extras */
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

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-20 text-gray-500">
        Loading profile…
      </main>
    )
  }

  if (!expert) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-20 text-gray-500">
        Profile not found.
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA]">

      {/* 1️⃣ Banner */}
      <HostProfileBanner expert={expert} />

      {/* 2️⃣ About */}
      <div className="mt-16">
        <HostAbout bio={expert.bio || ''} />
      </div>

      {/* 3️⃣ Topics */}
      <div className="mt-16">
        <HostTopics topics={expert.topics} />
      </div>

      {/* 4️⃣ Quick Facts */}
      <div className="mt-16">
        <HostQuickFacts
          designation={expert.designation}
          company={expert.company}
          experience_years={expert.experience_years}
          conversations_count={expert.conversations_count}
          city={expert.city}
          country={expert.country}
        />
      </div>

      {/* 5️⃣ Reviews */}
      <div className="mt-16">
        <HostReviews />
      </div>

      {/* 6️⃣ FAQs */}
      <div className="mt-16">
        <HostFAQs />
      </div>

    </main>
  )
}
