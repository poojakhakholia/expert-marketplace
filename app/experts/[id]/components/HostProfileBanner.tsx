'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState } from 'react'

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

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a2.5 2.5 0 0 0 0-1.39l7.02-4.11A2.5 2.5 0 1 0 14.5 5a2.5 2.5 0 0 0 .04.45L7.5 9.56a2.5 2.5 0 1 0 0 4.88l7.04 4.11a2.5 2.5 0 1 0 1.46-2.47z" />
    </svg>
  )
}

/* ---------- Social Icons ---------- */

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="#0A66C2">
      <path d="M20.45 20.45h-3.56v-5.59c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.68H9.35V9h3.42v1.56h.05c.48-.9 1.66-1.85 3.41-1.85 3.64 0 4.31 2.4 4.31 5.52v6.22zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="#1DA1F2">
      <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04 4.28 4.28 0 0 0-7.3 3.9A12.14 12.14 0 0 1 3.15 4.9a4.28 4.28 0 0 0 1.33 5.71 4.24 4.24 0 0 1-1.94-.54v.06a4.29 4.29 0 0 0 3.44 4.2 4.3 4.3 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98A8.6 8.6 0 0 1 2 19.54a12.13 12.13 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.38-.01-.57A8.7 8.7 0 0 0 22.46 6z" />
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
    linkedin_url?: string | null
    twitter_url?: string | null
  }
  isSelfProfile?: boolean
}

/* ---------- Helpers ---------- */

function normalizeUrl(url: string) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/* ---------- Component ---------- */

export default function HostProfileBanner({
  expert,
  isSelfProfile = false,
}: HostProfileBannerProps) {
  const router = useRouter()
  const { id } = useParams()
  const [copied, setCopied] = useState(false)
  const [imageError, setImageError] = useState(false)

  const profileUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/experts/${id}`
      : ''

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: expert.full_name,
          text: `Check out ${expert.full_name} on Intella`,
          url: profileUrl,
        })
      } else {
        await navigator.clipboard.writeText(profileUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {}
  }

  const isDisabled = isSelfProfile

  return (
    <section className="relative w-full">
      <div className="py-10 md:py-14">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

          {/* Avatar */}
          <div className="h-32 w-32 shrink-0 rounded-full overflow-hidden bg-white shadow-md ring-4 ring-white flex items-center justify-center">
            {expert.profile_image_url && !imageError ? (
              <img
                src={expert.profile_image_url}
                alt={expert.full_name}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 text-3xl font-semibold text-orange-700">
                {getInitials(expert.full_name)}
              </div>
            )}
          </div>

          {/* Identity */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <h1 className="text-[30px] md:text-[34px] font-semibold text-slate-900">
                {expert.full_name}
              </h1>

              <button
                onClick={handleShare}
                className="rounded-full bg-white p-2 shadow hover:scale-105 transition text-slate-600"
                title="Share profile"
              >
                <ShareIcon />
              </button>
            </div>

            {copied && (
              <div className="mt-1 text-xs text-emerald-600">
                Profile link copied
              </div>
            )}

            <div className="mt-1 h-[3px] w-10 rounded-full bg-[#F97316]/80 mx-auto md:mx-0" />

            <p className="mt-2 text-[16px] md:text-[17px] text-slate-700 italic">
              {expert.headline || 'Sharing experience through meaningful conversations'}
            </p>

            {(expert.linkedin_url || expert.twitter_url) && (
              <div className="mt-3 flex justify-center md:justify-start gap-3">
                {expert.linkedin_url && (
                  <a
                    href={normalizeUrl(expert.linkedin_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-white p-2 shadow hover:scale-105 transition"
                  >
                    <LinkedInIcon />
                  </a>
                )}

                {expert.twitter_url && (
                  <a
                    href={normalizeUrl(expert.twitter_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-white p-2 shadow hover:scale-105 transition"
                  >
                    <TwitterIcon />
                  </a>
                )}
              </div>
            )}

            <div className="mt-5 flex flex-wrap justify-center md:justify-start items-center gap-4">
              <button
                disabled={isDisabled}
                onClick={() => !isDisabled && router.push(`/experts/${id}/book`)}
                className={[
                  'rounded-full px-7 py-3 font-medium transition',
                  isDisabled
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-[#F97316] text-white hover:bg-[#EA6A0F]',
                ].join(' ')}
              >
                Book a conversation
              </button>

              <div className="flex items-center gap-2 rounded-full bg-orange-50/60 px-4 py-2 text-sm text-slate-600">
                <StarIcon />
                <span className="font-medium text-slate-900">
                  {expert.rating ?? '—'}
                </span>
                <span className="text-slate-400">·</span>
                <UsersIcon />
                <span>{expert.conversations_count ?? '0'} conversations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
