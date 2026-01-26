'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Expert = {
  user_id: string
  full_name: string | null
  headline: string | null
  bio: string | null
  company: string | null
  domain: string | null
  city: string | null
  country: string | null

  category_slugs: string[] | null
  category_names: string[] | null

  average_rating: number | null
  total_reviews: number | null

  fee_15: number | null
  fee_30: number | null
  fee_45: number | null
  fee_60: number | null
  profile_image_url: string | null
}

const PAGE_SIZE = 24

const categoryEmojiMap: Record<string, string> = {
  business: '💼',
  career: '🚀',
  startup: '🚀',
  health: '❤️',
  design: '🎨',
  product: '📦',
  education: '🎓',
  lifestyle: '🌍',
  finance: '💰',
  fitness: '🏋️',
  sports: '🏅',
  cooking: '🍳',
  travel: '✈️',
  artist: '🎨',
}

export default function ExplorePage() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [availableCategories, setAvailableCategories] = useState<
    { slug: string; name: string }[]
  >([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [relaxedQuality, setRelaxedQuality] = useState(false)

  const didInit = useRef(false)

  /* ===========================
     INITIAL LOAD
  =========================== */
  useEffect(() => {
    fetchExperts(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ===========================
     REFETCH ON SEARCH / CHIP
  =========================== */
  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true
      return
    }

    setExperts([])
    setOffset(0)
    setHasMore(true)
    setRelaxedQuality(false)

    fetchExperts(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory])

  /* ===========================
     FETCH EXPERTS
  =========================== */
  async function fetchExperts(reset = false) {
    if (loading || (!hasMore && !reset)) return
    setLoading(true)

    let query = supabase
      .from('public_expert_search')
      .select('*')

    if (searchQuery.trim()) {
      const q = `%${searchQuery.trim()}%`
      query = query.or(
        [
          `full_name.ilike.${q}`,
          `headline.ilike.${q}`,
          `bio.ilike.${q}`,
          `company.ilike.${q}`,
          `domain.ilike.${q}`,
          `city.ilike.${q}`,
          `country.ilike.${q}`,
        ].join(',')
      )
    }

    if (selectedCategory) {
      query = query.contains('category_slugs', [selectedCategory])
    }

    const effectiveOffset = selectedCategory ? 0 : offset

    const { data: primary } = await query
      .or('average_rating.gte.4.5,average_rating.is.null')
      .order('average_rating', { ascending: false, nullsFirst: false })
      .order('total_reviews', { ascending: false })
      .range(effectiveOffset, effectiveOffset + PAGE_SIZE - 1)

    let results = primary ?? []

    if (!selectedCategory && results.length < PAGE_SIZE && !relaxedQuality) {
      const remaining = PAGE_SIZE - results.length

      const { data: fallback } = await query
        .order('average_rating', { ascending: false, nullsFirst: false })
        .order('total_reviews', { ascending: false })
        .range(0, remaining - 1)

      results = [
        ...results,
        ...(fallback ?? []).filter(
          e => !results.some(r => r.user_id === e.user_id)
        ),
      ]

      setRelaxedQuality(true)
    }

    if (reset && availableCategories.length === 0 && !selectedCategory) {
      const map = new Map<string, string>()

      results.forEach(e => {
        e.category_slugs?.forEach((slug, idx) => {
          const name = e.category_names?.[idx]
          if (slug && name) map.set(slug, name)
        })
      })

      setAvailableCategories(
        Array.from(map.entries()).map(([slug, name]) => ({ slug, name }))
      )
    }

    setExperts(prev => (reset ? results : [...prev, ...results]))

    if (!selectedCategory) {
      setOffset(prev => prev + PAGE_SIZE)
    }

    if (results.length < PAGE_SIZE) setHasMore(false)

    setLoading(false)
  }

  function getMinPrice(e: Expert) {
    return Math.min(
      ...[e.fee_15, e.fee_30, e.fee_45, e.fee_60].filter(
        (v): v is number => typeof v === 'number'
      )
    )
  }

  function toggleChip(slug: string) {
    setSelectedCategory(prev => (prev === slug ? null : slug))
  }

  /* ===========================
     UI
  =========================== */
  return (
    <main className="min-h-screen intella-page">
      <div className="mx-auto max-w-7xl px-6 intella-section">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-semibold text-slate-800">
            Explore conversations
          </h1>
          <p className="mt-4 text-slate-600">
            Find people to learn from and book one-to-one paid conversations.
          </p>
        </div>

        {/* Search */}
        <div className="mt-12 intella-card p-4">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2">
            <span>🔍</span>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search topics or hosts"
              className="intella-input"
            />
          </div>
        </div>

        {/* Category Chips */}
        {availableCategories.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {availableCategories.map(c => (
              <button
                key={c.slug}
                onClick={() => toggleChip(c.slug)}
                className={`intella-chip ${
                  selectedCategory === c.slug
                    ? 'intella-chip-active'
                    : 'intella-chip-inactive'
                }`}
              >
                {categoryEmojiMap[c.slug] ?? '💡'} {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Cards */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {experts.map(e => (
            <Link
              key={e.user_id}
              href={`/experts/${e.user_id}`}
              className="intella-card intella-card-float p-6"
            >
              <div className="mb-4 h-40 rounded-2xl bg-slate-100 flex items-center justify-center text-4xl overflow-hidden">
                {e.profile_image_url ? (
                  <img
                    src={e.profile_image_url}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  e.full_name?.[0]
                )}
              </div>

              <h3 className="font-semibold">{e.full_name}</h3>
              <div className="h-5 text-xs text-slate-500">{e.company}</div>
              <div className="h-10 text-sm text-slate-600">{e.headline}</div>

              <div className="mt-3 flex flex-wrap gap-2">
                {e.category_names?.map(n => (
                  <span
                    key={n}
                    className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full"
                  >
                    {n}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm">
                  {e.average_rating ? `⭐ ${e.average_rating}` : 'New'}
                </span>
                <span className="font-medium">₹{getMinPrice(e)}</span>
              </div>

              <button className="mt-4 w-full intella-btn-primary">
                View details
              </button>
            </Link>
          ))}
        </div>

      </div>
    </main>
  )
}
