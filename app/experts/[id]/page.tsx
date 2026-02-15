'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

import HostProfileBanner from './components/HostProfileBanner'
import HostAbout from './components/HostAbout'
import HostTopics from './components/HostTopics'
import HostQuickFacts from './components/HostQuickFacts'
import HostReviews, { Review } from './components/HostReviews'

/* 🔹 SAME ICON MAP AS EXPLORE (UPDATED, NOT TRUNCATED) */
const CATEGORY_ICON: Record<string, string> = {
  cooking: '🍳',
  fitness: '🏋️',
  sports: '🏅',
  travel: '✈️',

  finance: '💰',
  investments: '📈',

  startups: '🚀',
  startup: '🚀',
  business: '💼',
  career: '🚀',

  technology: '💻',
  leadership: '🧭',
  education: '🎓',
  'industry-experts': '🏭',

  'mental-health': '🧠',
  health: '❤️',
  design: '🎨',
}

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
  department?: string
  experience_years?: number

  category_slugs?: string[]
  category_names?: string[]

  topics?: string[]
  rating?: number
  conversations_count?: number

  linkedin_url?: string | null
  twitter_url?: string | null
}

export default function ExpertProfilePage() {
  const { id } = useParams()

  const [expert, setExpert] = useState<Expert | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null)
    })
  }, [])

  useEffect(() => {
    if (id) fetchExpert()
  }, [id])

  async function fetchExpert() {
    setLoading(true)

    const { data: publicRow } = await supabase
      .from('public_expert_search')
      .select('*')
      .eq('user_id', id)
      .single()

    if (!publicRow) {
      setExpert(null)
      setLoading(false)
      return
    }

    /* ✅ FETCH PROFILE DETAILS */
    const { data: profile } = await supabase
      .from('expert_profiles')
      .select(`
        profile_image_url,
        designation,
        department,
        experience_years,
        sub_category_tags,
        linkedin_url,
        twitter_url
      `)
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
      designation: profile?.designation || undefined, // ✅ NO fake "Advisor"
      department: profile?.department,
      experience_years: profile?.experience_years,

      category_slugs: publicRow.category_slugs || [],
      category_names: publicRow.category_names || [],

      topics: profile?.sub_category_tags || [],
      rating: publicRow.average_rating ?? 0,
      conversations_count: publicRow.total_reviews ?? 0,

      linkedin_url: profile?.linkedin_url ?? null,
      twitter_url: profile?.twitter_url ?? null,
    })

    const { data: reviewsData } = await supabase
      .from('reviews')
      .select(`
        rating,
        comment,
        created_at,
        users ( full_name )
      `)
      .eq('expert_id', id)
      .order('created_at', { ascending: false })

    setReviews(
      (reviewsData || []).map(r => ({
        reviewer_name:
        Array.isArray(r.users) && r.users.length > 0
        ? r.users[0].full_name
        : 'Anonymous',
        rating: r.rating,
        comment: r.comment || '',
      }))
    )

    setLoading(false)
  }

  if (loading || !expert) return null

  const isSelfProfile = currentUserId === expert.user_id

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      <div className="relative z-10 mx-auto max-w-6xl px-6">

        <HostProfileBanner
          expert={expert}
          isSelfProfile={isSelfProfile}
        />

        <div className="mt-6 rounded-3xl bg-white/70 backdrop-blur border border-slate-200/60 px-6 md:px-8 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-10 pt-8">
            <div className="space-y-6">
              <HostAbout bio={expert.bio || ''} />

              {expert.category_names && expert.category_names.length > 0 && (
                <>
                  <div className="h-px bg-slate-200/50" />

                  <section>
                    <h3 className="text-[15px] font-semibold text-slate-900">
                      Categories
                    </h3>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {expert.category_names.map((name, idx) => {
                        const slug = expert.category_slugs?.[idx]
                        return (
                          <span
                            key={name}
                            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[13px] text-slate-700"
                          >
                            <span>
                              {CATEGORY_ICON[slug ?? ''] ?? '💡'}
                            </span>
                            {name}
                          </span>
                        )
                      })}
                    </div>
                  </section>
                </>
              )}

              <div className="h-px bg-slate-200/50" />

              <HostTopics topics={expert.topics} />

              <div className="h-px bg-slate-200/50" />

              <HostReviews reviews={reviews} />
            </div>

            <aside className="md:pt-2">
              <HostQuickFacts
                department={expert.department}
                company={expert.company}
                designation={expert.designation}
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
