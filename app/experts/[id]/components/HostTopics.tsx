'use client'

import { useState } from 'react'

/* ---------- Topic Icon Resolver ---------- */

function TopicIcon({ topic }: { topic: string }) {
  const t = topic.toLowerCase()

  if (t.includes('weight') || t.includes('fitness')) {
    return <span className="text-[#F97316] text-[16px]">🏋️</span>
  }

  if (t.includes('strength')) {
    return <span className="text-[#F97316] text-[16px]">💪</span>
  }

  if (t.includes('diet') || t.includes('nutrition')) {
    return <span className="text-[#F97316] text-[16px]">🥗</span>
  }

  if (t.includes('career') || t.includes('work')) {
    return <span className="text-[#F97316] text-[16px]">💼</span>
  }

  if (t.includes('startup') || t.includes('business')) {
    return <span className="text-[#F97316] text-[16px]">🚀</span>
  }

  if (t.includes('confidence') || t.includes('mindset')) {
    return <span className="text-[#F97316] text-[16px]">🧠</span>
  }

  // neutral fallback
  return <span className="text-[#F97316] text-[16px]">✨</span>
}

/* ---------- Types ---------- */

type HostTopicsProps = {
  topics?: string[]
}

/* ---------- Component ---------- */

export default function HostTopics({ topics = [] }: HostTopicsProps) {
  if (!topics.length) return null

  const [expanded, setExpanded] = useState(false)
  const visibleTopics = expanded ? topics : topics.slice(0, 6)

  return (
    <section>
      {/* Header */}
      <div className="mb-1">
        <h2 className="text-[15px] font-semibold text-slate-900 tracking-tight">
          Topics I can help with
        </h2>
        <p className="mt-1 text-[14px] text-slate-600">
          Things I enjoy chatting about one-on-one
        </p>
      </div>

      {/* Chips */}
      <div className="mt-4 flex flex-wrap gap-2 max-w-4xl">
        {visibleTopics.map((topic, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[14px] text-slate-800 shadow-sm"
          >
            <TopicIcon topic={topic} />
            <span className="leading-none">{topic}</span>
          </span>
        ))}
      </div>

      {/* Expand toggle */}
      {topics.length > 6 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-[14px] font-medium text-[#F97316] hover:underline"
        >
          {expanded ? 'Show less' : 'View all topics'}
        </button>
      )}
    </section>
  )
}
