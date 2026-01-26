'use client'

/* ---------- Inline Icons (Intella orange) ---------- */

function BriefcaseIcon() {
  return <span className="text-[16px] text-[#F97316]">🧑‍💼</span>
}

function BuildingIcon() {
  return <span className="text-[16px] text-[#F97316]">🏢</span>
}

function CalendarIcon() {
  return <span className="text-[16px] text-[#F97316]">📆</span>
}

function ChatIcon() {
  return <span className="text-[16px] text-[#F97316]">💬</span>
}

function LocationIcon() {
  return <span className="text-[16px] text-[#F97316]">📍</span>
}

/* ---------- Types ---------- */

type HostQuickFactsProps = {
  designation?: string
  company?: string
  experience_years?: number
  conversations_count?: number
  city?: string
  country?: string
}

/* ---------- Component ---------- */

export default function HostQuickFacts({
  designation,
  company,
  experience_years,
  conversations_count,
  city,
  country,
}: HostQuickFactsProps) {
  return (
    <section>
      {/* Header */}
      <h2 className="mb-4 text-[15px] font-semibold text-slate-900 tracking-tight">
        At a glance
      </h2>

      {/* Facts */}
      <ul className="space-y-3 text-[14px]">
        {designation && (
          <Fact
            icon={<BriefcaseIcon />}
            label="Role"
            value={designation}
          />
        )}

        {company && (
          <Fact
            icon={<BuildingIcon />}
            label="Company"
            value={company}
          />
        )}

        {experience_years !== undefined && (
          <Fact
            icon={<CalendarIcon />}
            label="Experience"
            value={`${experience_years}+ years`}
          />
        )}

        {conversations_count !== undefined && (
          <Fact
            icon={<ChatIcon />}
            label="Conversations"
            value={`${conversations_count}`}
          />
        )}

        {(city || country) && (
          <Fact
            icon={<LocationIcon />}
            label="Location"
            value={[city, country].filter(Boolean).join(', ')}
          />
        )}
      </ul>
    </section>
  )
}

/* ---------- Sub-component ---------- */

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-[2px]">{icon}</span>
      <span className="min-w-[92px] text-slate-500">
        {label}
      </span>
      <span className="text-slate-900 leading-snug">
        {value}
      </span>
    </li>
  )
}
