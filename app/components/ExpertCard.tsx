'use client'

import Link from 'next/link'

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

export default function ExpertCard({ expert }: { expert: Expert }) {
  const startingFee =
    expert.fee_15 ?? expert.fee_30 ?? expert.fee_60 ?? null

  return (
    <Link
      href={`/experts/${expert.user_id}`}
      className="block"
    >
      <div className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition cursor-pointer">

        {/* Name */}
        <h3 className="text-lg font-semibold">
          {expert.full_name || 'Expert'}
        </h3>

        {/* Headline */}
        {expert.headline && (
          <p className="text-sm text-gray-700 mt-1">
            {expert.headline}
          </p>
        )}

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mt-3">
          {expert.categories.map(cat => (
            <span
              key={cat}
              className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            {expert.average_rating
              ? `${expert.average_rating} ⭐ (${expert.total_reviews})`
              : 'New'}
          </div>

          {startingFee && (
            <div className="text-sm font-semibold text-indigo-600">
              ₹{startingFee} / 15 min
            </div>
          )}
        </div>

      </div>
    </Link>
  )
}
