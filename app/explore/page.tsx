'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
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

const CATEGORY_ICON: Record<string, string> = {
  investments: '📈',
  finance: '💰',
  technology: '💻',
  leadership: '🧭',
  travel: '✈️',
  startups: '🚀',
  startup: '🚀',
  cooking: '🍳',
  artist: '🎨',
  education: '🎓',
  'career-coaching': '🚀',
  'industry-experts': '🏭',
  'mental-health': '🧠',
  sports: '🏅',
  fitness: '🏋️',
}

export default function ExplorePage() {
  useEffect(() => {
  document.documentElement.classList.add('explore-scale')
  return () => {
    document.documentElement.classList.remove('explore-scale')
  }
}, [])

  const [experts, setExperts] = useState<Expert[]>([])
  const [availableCategories, setAvailableCategories] = useState<
    { slug: string; name: string }[]
  >([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const [imageErrorIds, setImageErrorIds] = useState<Set<string>>(new Set())

  /* ===========================
     AUTOCOMPLETE
  =========================== */
  const suggestions = useMemo(() => {
    if (!searchQuery) return []

    const q = searchQuery.toLowerCase()
    const set = new Set<string>()

    experts.forEach(e => {
      if (e.full_name?.toLowerCase().includes(q)) set.add(e.full_name)
      if (e.company?.toLowerCase().includes(q)) set.add(e.company)
      e.category_names?.forEach(c => {
        if (c.toLowerCase().includes(q)) set.add(c)
      })
    })

    return Array.from(set).slice(0, 6)
  }, [searchQuery, experts])

  /* ===========================
     INITIAL LOAD
  =========================== */
  useEffect(() => {
    fetchExperts(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ===========================
     DEBOUNCE SEARCH
  =========================== */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim())
    }, 350)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  /* ===========================
     RESET + FETCH
  =========================== */
  useEffect(() => {
    setExperts([])
    setOffset(0)
    setHasMore(true)
    fetchExperts(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, selectedCategory])

  async function fetchExperts(reset = false) {
    if (loading || (!hasMore && !reset)) return
    setLoading(true)

    const isSearchMode = Boolean(debouncedQuery)
    let query = supabase.from('public_expert_search').select('*')

    const orConditions = isSearchMode
      ? [
          `full_name.ilike.%${debouncedQuery}%`,
          `headline.ilike.%${debouncedQuery}%`,
          `bio.ilike.%${debouncedQuery}%`,
          `company.ilike.%${debouncedQuery}%`,
          `domain.ilike.%${debouncedQuery}%`,
          `city.ilike.%${debouncedQuery}%`,
          `country.ilike.%${debouncedQuery}%`,
        ].join(',')
      : 'average_rating.gte.1.0,average_rating.is.null'

    query = query.or(orConditions)

    if (selectedCategory) {
      query = query.contains('category_slugs', [selectedCategory])
    }

    const effectiveOffset = reset ? 0 : offset

    const { data } = await query
      .order('average_rating', { ascending: false, nullsFirst: false })
      .order('total_reviews', { ascending: false })
      .range(effectiveOffset, effectiveOffset + PAGE_SIZE - 1)

    const results = data ?? []

    if (reset && availableCategories.length === 0) {
      const map = new Map<string, string>()
      results.forEach(e =>
        e.category_slugs?.forEach((slug, idx) => {
          const name = e.category_names?.[idx]
          if (slug && name) map.set(slug, name)
        })
      )
      setAvailableCategories(
        Array.from(map.entries()).map(([slug, name]) => ({ slug, name }))
      )
    }

    setExperts(prev => (reset ? results : [...prev, ...results]))
    if (!isSearchMode && !selectedCategory) {
      setOffset(prev => prev + PAGE_SIZE)
    }
    if (results.length < PAGE_SIZE) setHasMore(false)

    setLoading(false)
  }

  function getMinPrice(e: Expert) {
    const feeMap: { price: number; duration: number }[] = []

    if (typeof e.fee_15 === 'number') feeMap.push({ price: e.fee_15, duration: 15 })
    if (typeof e.fee_30 === 'number') feeMap.push({ price: e.fee_30, duration: 30 })
    if (typeof e.fee_30 === 'number') feeMap.push({ price: e.fee_45, duration: 45 })
    if (typeof e.fee_30 === 'number') feeMap.push({ price: e.fee_60, duration: 60 })

    if (feeMap.length === 0) return null

    return feeMap.reduce((min, curr) =>
      curr.price < min.price ? curr : min
  )
}

  function resetSearch() {
    setSearchQuery('')
    setDebouncedQuery('')
    setSelectedCategory(null)
  }

  function toggleChip(slug: string) {
    setSelectedCategory(prev => (prev === slug ? null : slug))
  }

  return (
    <main className="min-h-screen intella-page explore-scale">
      <div className="mx-auto max-w-7xl px-6 intella-section">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-semibold text-slate-800">
            Explore conversations
          </h1>
          <p className="mt-3 text-slate-600">
            Find people to learn from and book one-to-one conversations.
          </p>
        </div>

        {/* Search */}
        <div className="mt-8 intella-card p-4 relative">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2">
            <span>🔍</span>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search topics, experts, companies"
              className="intella-input"
            />
            {searchQuery && (
              <button onClick={resetSearch} className="text-slate-400">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Chips */}
        {availableCategories.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {availableCategories.map(c => (
              <button
                key={c.slug}
                onClick={() => toggleChip(c.slug)}
                className={`intella-chip flex items-center gap-1 ${
                  selectedCategory === c.slug
                    ? 'intella-chip-active'
                    : 'intella-chip-inactive'
                }`}
              >
                {CATEGORY_ICON[c.slug] ?? '💡'} {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Cards */}
        <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {experts.map(e => (
            <Link
              key={e.user_id}
              href={`/experts/${e.user_id}`}
              className="intella-card intella-card-float p-6 flex flex-col gap-4"
            >
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-orange-50 overflow-hidden flex-shrink-0">
                  {e.profile_image_url &&
                  e.profile_image_url.trim() !== '' &&
                  !imageErrorIds.has(e.user_id) ? (
                    <img
                      src={e.profile_image_url}
                      className="h-full w-full object-cover"
                      onError={() =>
                        setImageErrorIds(prev => {
                          const updated = new Set(prev)
                          updated.add(e.user_id)
                          return updated
                        })
                      }
                    />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-slate-500">
                        {e.full_name
                        ? e.full_name
                        .split(' ')
                        .map(n => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                        : '?'}
                      </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {e.full_name}
                  </h3>
                  <div className="text-xs text-slate-500">
                    {e.company}
                  </div>
                </div>
              </div>
              
              {/* Headline */}
              <div className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                {e.headline}
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {e.category_names?.map((n, i) => (
                  <span
                    key={n}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                  >
                    {CATEGORY_ICON[e.category_slugs?.[i] ?? ''] ?? '💡'} {n}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-auto flex items-center justify-between text-sm">
                <span>
                  {e.average_rating ? `⭐ ${e.average_rating}` : 'New'}
                </span>
                {(() => {
                  const min = getMinPrice(e)
                  if (!min) return <span className="font-medium">—</span>

                  return (
                    <span className="text-right">
                      <span className="text-xs text-slate-500 block">
                        Starting from
                        </span>
                        <span className="font-semibold text-slate-900">
                          ₹{min.price}/{min.duration}m
                          </span>
                          </span>
                  )
                  })()}
                      
              </div>

              <button className="mt-3 w-full intella-btn-primary">
                View details
              </button>
            </Link>
          ))}
        </div>

      </div>
    </main>
  )
}
