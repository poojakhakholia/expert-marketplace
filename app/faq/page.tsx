export default function FAQPage() {
  return (
    <main className="relative min-h-screen py-32">
      <div className="mx-auto max-w-4xl px-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-800">
            Frequently asked questions
          </h1>

          <p className="mt-4 text-slate-600">
            Everything you need to know about hosting and joining conversations on Intella.
          </p>
        </div>

        {/* FAQ List */}
        <div className="mt-16 space-y-6">

          <details className="group rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <summary className="cursor-pointer font-medium text-slate-800">
              What is Intella?
            </summary>
            <p className="mt-3 text-sm text-slate-600">
              Intella is a platform where people host paid one-on-one conversations
              to share real-life experiences, skills, and knowledge. Everyone knows
              something worth sharing.
            </p>
          </details>

          <details className="group rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <summary className="cursor-pointer font-medium text-slate-800">
              Who can host a conversation on Intella?
            </summary>
            <p className="mt-3 text-sm text-slate-600">
              Anyone. If you’ve learned something through your journey — studies,
              career, projects, hobbies, or life experiences — you can host
              conversations and help others.
            </p>
          </details>

          <details className="group rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <summary className="cursor-pointer font-medium text-slate-800">
              Do I need credentials or certifications to host?
            </summary>
            <p className="mt-3 text-sm text-slate-600">
              No. Intella is experience-first, not credential-first. What matters
              is what you’ve been through and what you can help others understand.
            </p>
          </details>

          <details className="group rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <summary className="cursor-pointer font-medium text-slate-800">
              How do conversations work?
            </summary>
            <p className="mt-3 text-sm text-slate-600">
              Hosts list topics and availability. Participants book a one-on-one
              conversation, connect at the scheduled time, and have a focused,
              personal discussion.
            </p>
          </details>

          <details className="group rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <summary className="cursor-pointer font-medium text-slate-800">
              How much does a conversation cost?
            </summary>
            <p className="mt-3 text-sm text-slate-600">
              Each host sets their own price. Pricing and duration are always shown
              clearly before booking.
            </p>
          </details>

          <details className="group rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <summary className="cursor-pointer font-medium text-slate-800">
              How do hosts get paid?
            </summary>
            <p className="mt-3 text-sm text-slate-600">
              Hosts earn for every completed conversation, with payouts sent
              directly to their linked account.
            </p>
          </details>

          <details className="group rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <summary className="cursor-pointer font-medium text-slate-800">
              Do I need to sign up to explore Intella?
            </summary>
            <p className="mt-3 text-sm text-slate-600">
              No. You can explore hosts and topics freely. Sign-up is required only
              when you want to host or book a conversation.
            </p>
          </details>

        </div>
      </div>
    </main>
  )
}
