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

function MapPinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
    </svg>
  )
}

/* ---------- Component ---------- */

type HostProfileBannerProps = {
  expert: {
    full_name: string
    headline?: string
    city?: string
    country?: string
    profile_image_url?: string
    linkedin_url?: string
    twitter_url?: string
    rating?: number
    conversations_count?: number
  }
}

export default function HostProfileBanner({ expert }: HostProfileBannerProps) {
  const router = useRouter()
  const { id } = useParams()

  return (
    <section className="relative w-full overflow-hidden">

      {/* Banner background */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: "url('/branding/clouds-bg.png')" }}
      />
      <div className="absolute inset-0 bg-white/25 pointer-events-none" />

      <div className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-6xl">

          <div className="relative overflow-hidden rounded-[32px] shadow-md">
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none"
              style={{ backgroundImage: "url('/branding/profile-card-bg.png')" }}
            />
            <div className="absolute inset-0 bg-white/80 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 px-8 py-10">

              {/* Avatar */}
              <div className="h-40 w-40 rounded-full border-[5px] border-white shadow-lg overflow-hidden bg-gray-200">
                <img
                  src={expert.profile_image_url || '/branding/profile-placeholder.png'}
                  alt={expert.full_name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4 text-center md:text-left">

                <h1 className="text-[32px] md:text-[36px] font-semibold text-gray-900">
                  {expert.full_name}
                </h1>

                <p className="text-[18px] md:text-[20px] text-gray-700 italic">
                  {expert.headline || 'Sharing experience through meaningful conversations'}
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">

                  {/* ✅ WORKING CTA */}
                  <button
                    onClick={() => router.push(`/experts/${id}/book`)}
                    className="rounded-full bg-[#F97316] px-7 py-3 text-white font-medium hover:bg-[#EA6A0F] transition"
                  >
                    Book a conversation
                  </button>

                  <div className="flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm shadow-sm">
                    <StarIcon />
                    <span className="font-medium">{expert.rating ?? '4.9'}</span>
                    <span className="text-gray-400">·</span>
                    <UsersIcon />
                    <span className="text-gray-600">
                      {expert.conversations_count ?? '128'} conversations
                    </span>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
