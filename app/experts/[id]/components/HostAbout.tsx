'use client'

/* ---------- Inline Icon ---------- */

function IdeaIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#F97316"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12c.6.6 1 1.4 1 2v1h6v-1c0-.6.4-1.4 1-2a7 7 0 0 0-4-12z" />
    </svg>
  )
}

/* ---------- Component ---------- */

type HostAboutProps = {
  bio: string
}

export default function HostAbout({ bio }: HostAboutProps) {
  if (!bio) return null

  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="rounded-2xl bg-white p-8 shadow-sm">

        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
            <IdeaIcon />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            About Me
          </h2>
        </div>

        {/* Content */}
        <p className="text-[16px] leading-relaxed text-gray-700 whitespace-pre-line">
          {bio}
        </p>

      </div>
    </section>
  )
}
