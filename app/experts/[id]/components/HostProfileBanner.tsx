'use client'

import { useRouter, useParams } from 'next/navigation'

/* ---------- Inline Icons ---------- */

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#FACC15">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  )
}

/* ---------- Types ---------- */

type HostProfileBannerProps = {
  expert: {
    full_name: string
    headline?: string
    profile_image_url?: string
    rating?: number
    conversations_count?: number
  }
}

/* ---------- Component ---------- */

export default function HostProfileBanner({ expert }: HostProfileBannerProps) {
  const router = useRouter()
  const { id } = useParams()

  return (
    <section className="relative w-full">
      {/* Content rail is owned by page */}
      <div className="py-10 md:py-14">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

          {/* Avatar */}
          <div className="h-32 w-32 shrink-0 rounded-full overflow-hidden bg-white shadow-md ring-4 ring-white">
            <img
              src={expert.profile_image_url || '/branding/profile-placeholder.png'}
              alt={expert.full_name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Identity + Actions */}
          <div className="flex-1 text-center md:text-left">

            <h1 className="text-[30px] md:text-[34px] font-semibold text-slate-900 tracking-tight">
              {expert.full_name}
            </h1>

            {/* Intella micro-accent */}
            <div className="mt-1 h-[3px] w-10 rounded-full bg-[#F97316]/80 mx-auto md:mx-0" />

            <p className="mt-2 text-[16px] md:text-[17px] text-slate-700 italic">
              {expert.headline || 'Sharing experience through meaningful conversations'}
            </p>

            <div className="mt-5 flex flex-wrap justify-center md:justify-start items-center gap-4">

              {/* Primary CTA (unchanged) */}
              <button
                onClick={() => router.push(`/experts/${id}/book`)}
                className="rounded-full bg-[#F97316] px-7 py-3 text-white font-medium hover:bg-[#EA6A0F] transition"
              >
                Book a conversation
              </button>

              {/* Meta (softly grounded) */}
              <div className="flex items-center gap-2 rounded-full bg-orange-50/60 px-4 py-2 text-sm text-slate-600">
                <StarIcon />
                <span className="font-medium text-slate-900">
                  {expert.rating ?? '4.9'}
                </span>
                <span className="text-slate-400">·</span>
                <UsersIcon />
                <span>
                  {expert.conversations_count ?? '0'} conversations
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
