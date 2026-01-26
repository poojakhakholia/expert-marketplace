'use client'

/* ---------- Inline Icon ---------- */

function IdeaIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#F97316" /* Intella orange */
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12c.6.6 1 1.4 1 2v1h6v-1c0-.6.4-1.4 1-2a7 7 0 0 0-4-12z" />
    </svg>
  )
}

/* ---------- Types ---------- */

type HostAboutProps = {
  bio: string
}

/* ---------- Component ---------- */

export default function HostAbout({ bio }: HostAboutProps) {
  if (!bio) return null

  return (
    <section>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <IdeaIcon />
        <h2 className="text-[15px] font-semibold text-slate-900 tracking-tight">
          About the host
        </h2>
      </div>

      {/* Content */}
      <p className="max-w-3xl text-[15px] leading-relaxed text-slate-700 whitespace-pre-line">
        {bio}
      </p>
    </section>
  )
}
