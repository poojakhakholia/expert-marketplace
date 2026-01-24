'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase' // ✅ FIXED IMPORT
import ExpertCard from './ExpertCard'

type Category = {
  id: string
  name: string
}

type Expert = {
  user_id: string
  full_name: string | null
  headline: string | null
  bio: string | null
  categories: string[]
  average_rating: number | null
  total_reviews: number | null
  fee_15: number | null
  fee_30: number | null
  fee_60: number | null
}

export default function CategoryExpertsSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [experts, setExperts] = useState<Expert[]>([])
  const [loading, setLoading] = useState(false)

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name')

      if (data) {
        setCategories(data)
      }
    }

    loadCategories()
  }, [])

  // Load experts when category changes
  useEffect(() => {
    if (!selectedCategory) return

    const loadExperts = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('public_expert_search')
        .select('*')
        .contains('categories', [selectedCategory])

      if (!error && data) {
        setExperts(data)
      } else {
        setExperts([])
      }

      setLoading(false)
    }

    loadExperts()
  }, [selectedCategory])

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-semibold text-center mb-6">
        Browse by Category
      </h2>

      {/* Category pills */}
      <div className="flex flex-wrap gap-3 justify-center mb-10">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-4 py-2 rounded-full border text-sm ${
              selectedCategory === cat.name
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-gray-300 text-gray-700 hover:border-indigo-400'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Experts */}
      {loading && (
        <p className="text-center text-gray-500">Loading experts…</p>
      )}

      {!loading && experts.length === 0 && selectedCategory && (
        <p className="text-center text-gray-500">
          No experts available for this category.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {experts.map(expert => (
          <ExpertCard key={expert.user_id} expert={expert} />
        ))}
      </div>
    </section>
  )
}
