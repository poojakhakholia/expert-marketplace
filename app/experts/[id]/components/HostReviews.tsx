'use client'

/* ---------- Inline Star Icon ---------- */

function StarIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="#FACC15"
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
    <section className="mx-auto max-w-6xl px-6">
      <div className="rounded-2xl bg-white p-8 shadow-sm">

        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          What people say
        </h2>

        <div className="space-y-6">
          {reviews.slice(0, 3).map((review, index) => (
            <div
              key={index}
              className="rounded-xl bg-slate-50 p-5"
            >
              <div className="mb-2 flex items-center gap-2">
                <div className="font-medium text-gray-900">
                  {review.name}
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
              </div>

              <p className="text-sm leading-relaxed text-gray-700">
                {review.text}
              </p>
            </div>
          ))}
        </div>

        {/* Future extension */}
        <div className="mt-6 text-sm text-orange-600 cursor-pointer">
          View all reviews →
        </div>

      </div>
    </section>
  )
}
