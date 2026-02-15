export default function AboutPage() {
  return (
    <main className="min-h-screen intella-page">
      <div className="mx-auto max-w-3xl px-6 py-20">

        {/* Heading */}
        <h1 className="text-3xl font-semibold text-slate-900 mb-6">
          About Intella
        </h1>

        <p className="text-slate-700 leading-relaxed mb-8">
          Intella is a platform for meaningful one-to-one conversations built
          around lived experience. We believe everyone knows something worth
          sharing — whether it comes from years of work, personal journeys, or
          real-world problem solving.
        </p>

        <p className="text-slate-700 leading-relaxed mb-8">
          Intella helps people discover and book conversations with individuals
          who are willing to share their experiences, insights, and lessons.
          We focus on authenticity, respect, and practical learning — not
          credentials or titles.
        </p>

        <p className="text-slate-700 leading-relaxed mb-12">
          Intella is a facilitator. Conversations happen directly between users
          and hosts, and the platform exists to make discovery, scheduling, and
          payments simple and reliable.
        </p>

        {/* Divider */}
        <div className="h-px bg-slate-200 my-16" />

        {/* Contact */}
        <section id="contact">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Contact Us
          </h2>

          <p className="text-slate-700 mb-6">
            Have a question, feedback, or need support? We’d love to hear from you.
          </p>

          <div className="space-y-3 text-slate-700">
            <p>
              <span className="font-medium">Email:</span>{' '}
              <a
                href="mailto:support@intella.app"
                className="text-orange-600 hover:underline"
              >
                contact@intella.in
              </a>
            </p>

            <p>
              <span className="font-medium">Response time:</span> Within 24–48 hours
            </p>
          </div>
        </section>

      </div>
    </main>
  )
}
