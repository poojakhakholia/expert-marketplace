'use client'

/* ---------- Inline Star Icon ---------- */

function StarIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="#FACC15"
      className="shrink-0"
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  )
}

/* ---------- Types ---------- */

type Review = {
  name: string
  rating: number
  text: string
}

type HostReviewsProps = {
  reviews?: Review[]
}

/* ---------- Component ---------- */

export default function HostReviews({
  reviews = [
    {
      name: 'John R.',
      rating: 5,
      text:
        'Talking to Sarah helped me get clarity on a few things I was stuck with. The conversation felt very natural and encouraging.',
    },
    {
      name: 'Priya M.',
      rating: 5,
      text:
        'I really appreciated how thoughtfully she listened. It felt less like advice and more like a genuine conversation.',
    },
    {
      name: 'Alex T.',
      rating: 4,
      text:
        'Great conversation overall. Walked away with practical insights and a lot more confidence.',
    },
  ],
}: HostReviewsProps) {
  if (!reviews.length) return null

  return (
    <section>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-slate-900 tracking-tight">
          Recent conversations
        </h2>
        <p className="mt-1 text-[14px] text-slate-600">
          What people felt after talking one-on-one
        </p>
      </div>

      {/* Reviews */}
      <div className="space-y-6">
        {reviews.slice(0, 3).map((review, index) => (
          <div key={index} className="max-w-3xl">
            {/* Reviewer meta */}
            <div className="mb-1 flex items-center gap-2">
              <span className="font-medium text-slate-900 text-[14px]">
                {review.name}
              </span>

              <span className="flex items-center gap-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </span>

              <span className="text-slate-400 text-[13px]">
                · Verified conversation
              </span>
            </div>

            {/* Review text */}
            <p className="text-[14px] leading-relaxed text-slate-700">
              “{review.text}”
            </p>
          </div>
        ))}
      </div>

      {/* Soft CTA */}
      <button className="mt-6 text-[14px] font-medium text-[#F97316] hover:underline">
        View all conversations →
      </button>
    </section>
  )
}
