export default function HowItWorksSection() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-6xl px-6">

        {/* ===================== */}
        {/* HOW IT WORKS */}
        {/* ===================== */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
            <span className="text-2xl">💡</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-semibold text-slate-800">
            How it works
          </h2>

          <p className="mt-4 text-slate-600">
            Create a profile and list topics you’d like to help others with.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-20 grid gap-10 sm:grid-cols-3">
          {/* Step 1 */}
          <div className="group rounded-3xl bg-white p-10 text-center shadow-sm transition hover:-translate-y-2 hover:shadow-md">
            <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-orange-50">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-200">
                <span className="text-3xl">👤</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-slate-800">
              Step 1 · Share your experience
            </h3>

            <p className="mt-4 text-sm text-slate-600">
              Create a profile and list topics you’ve learned through real
              experiences.
            </p>
          </div>

          {/* Step 2 */}
          <div className="group rounded-3xl bg-white p-10 text-center shadow-sm transition hover:-translate-y-2 hover:shadow-md">
            <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-blue-50">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-200">
                <span className="text-3xl">💬</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-slate-800">
              Step 2 · Host conversations
            </h3>

            <p className="mt-4 text-sm text-slate-600">
              Connect one-on-one with people who want to learn from you.
            </p>
          </div>

          {/* Step 3 */}
          <div className="group rounded-3xl bg-white p-10 text-center shadow-sm transition hover:-translate-y-2 hover:shadow-md">
            <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-emerald-50">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-200">
                <span className="text-3xl">💰</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-slate-800">
              Step 3 · Get paid flexibly
            </h3>

            <p className="mt-4 text-sm text-slate-600">
              Earn for every conversation, with payouts directly to your account.
            </p>
          </div>
        </div>

        {/* ===================== */}
        {/* WHO SHOULD HOST */}
        {/* ===================== */}
        <div className="mt-36 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-800">
            Who should host on Intella?
          </h2>

          <p className="mt-4 text-slate-600">
            If you’ve been through it, you can help someone with it.
          </p>
        </div>

        {/* Host types */}
        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Students */}
          <div className="group rounded-3xl bg-white p-8 text-center shadow-sm transition hover:-translate-y-2 hover:shadow-md">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50">
              <span className="text-3xl">🎓</span>
            </div>

            <h3 className="font-semibold text-slate-800">
              Students & grads
            </h3>

            <p className="mt-3 text-sm text-slate-600">
              Guide others with your academic journey and recent experiences.
            </p>
          </div>

          {/* Professionals */}
          <div className="group rounded-3xl bg-white p-8 text-center shadow-sm transition hover:-translate-y-2 hover:shadow-md">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50">
              <span className="text-3xl">💼</span>
            </div>

            <h3 className="font-semibold text-slate-800">
              Professionals
            </h3>

            <p className="mt-3 text-sm text-slate-600">
              Share career skills, growth stories, and transitions.
            </p>
          </div>

          {/* Side hustlers */}
          <div className="group rounded-3xl bg-white p-8 text-center shadow-sm transition hover:-translate-y-2 hover:shadow-md">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-50">
              <span className="text-3xl">🚀</span>
            </div>

            <h3 className="font-semibold text-slate-800">
              Side hustlers
            </h3>

            <p className="mt-3 text-sm text-slate-600">
              Offer insights from your project, startup, or small business.
            </p>
          </div>

          {/* Passionate people */}
          <div className="group rounded-3xl bg-white p-8 text-center shadow-sm transition hover:-translate-y-2 hover:shadow-md">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-pink-50">
              <span className="text-3xl">❤️</span>
            </div>

            <h3 className="font-semibold text-slate-800">
              Passionate people
            </h3>

            <p className="mt-3 text-sm text-slate-600">
              Talk about hobbies, wellness, lifestyle, or life experiences.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
