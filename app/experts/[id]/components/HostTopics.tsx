'use client'

import { useState } from 'react'

/* ---------- Icon ---------- */

function HeartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="#F97316"
    >
      <path d="M12 21s-6.7-4.35-9.33-7.43C-1.5 9.13 1.4 3.5 6.5 5.5c2.1.83 3.5 3 3.5 3s1.4-2.17 3.5-3c5.1-2 8 3.63 3.83 8.07C18.7 16.65 12 21 12 21z" />
    </svg>
  )
}

/* ---------- Types ---------- */

type HostTopicsProps = {
  topics?: string[]
}

/* ---------- Component ---------- */

export default function HostTopics({
  topics = [
    'Starting your first startup',
    'Scaling a small business',
    'Improving your marketing',
    'Balancing work & life',
    'Career transitions',
    'Building confidence',
    'Freelancing & side hustles',
    'Personal growth & clarity',
  ],
}: HostTopicsProps) {
  const [expanded, setExpanded] = useState(false)

  const visibleTopics = expanded ? topics : topics.slice(0, 4)

  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="rounded-2xl bg-white p-8 shadow-sm">

        {/* Header */}
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
            <HeartIcon />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Topics I can help with
          </h2>
        </div>

        <p className="mb-6 text-sm text-gray-600">
          Things I enjoy chatting about one-on-one
        </p>

        {/* Topics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleTopics.map((topic, index) => (
            <div
              key={index}
              className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-gray-800 shadow-sm"
            >
              {topic}
            </div>
          ))}
        </div>

        {/* Expand toggle */}
        {topics.length > 4 && (
          <div className="mt-6">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm font-medium text-orange-600 hover:underline"
            >
              {expanded ? 'Show less' : 'View all topics'}
            </button>
          </div>
        )}

      </div>
    </section>
  )
}
