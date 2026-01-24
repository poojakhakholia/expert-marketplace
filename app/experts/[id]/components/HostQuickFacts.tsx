'use client'

/* ---------- Inline Icons ---------- */

function BriefcaseIcon() {
  return <span className="text-lg">🧑‍💼</span>
}

function BuildingIcon() {
  return <span className="text-lg">🏢</span>
}

function CalendarIcon() {
  return <span className="text-lg">🗓</span>
}

function ChatIcon() {
  return <span className="text-lg">💬</span>
}

function LocationIcon() {
  return <span className="text-lg">📍</span>
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
  designation = 'Founder & Mentor',
  company = 'Startup Co.',
  experience_years = 10,
  conversations_count = 250,
  city = 'San Francisco',
  country = 'USA',
}: HostQuickFactsProps) {
  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="rounded-2xl bg-white p-8 shadow-sm">

        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Quick facts
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          <FactItem
            icon={<BriefcaseIcon />}
            label="Role"
            value={designation}
          />

          <FactItem
            icon={<BuildingIcon />}
            label="Company"
            value={company}
          />

          <FactItem
            icon={<CalendarIcon />}
            label="Experience"
            value={`${experience_years}+ years`}
          />

          <FactItem
            icon={<ChatIcon />}
            label="Conversations"
            value={`${conversations_count}+ hosted`}
          />

          <FactItem
            icon={<LocationIcon />}
            label="Location"
            value={`${city}, ${country}`}
          />

        </div>
      </div>
    </section>
  )
}

/* ---------- Sub-component ---------- */

function FactItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1">{icon}</div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-sm font-medium text-gray-900">
          {value}
        </div>
      </div>
    </div>
  )
}
