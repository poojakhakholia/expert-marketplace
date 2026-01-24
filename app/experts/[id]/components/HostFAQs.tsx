'use client'

import { useState } from 'react'

/* ---------- Icon ---------- */

function QuestionIcon() {
  return <span className="text-lg">❓</span>
}

/* ---------- Types ---------- */

type FAQ = {
  question: string
  answer: string
}

type HostFAQsProps = {
  faqs?: FAQ[]
}

/* ---------- Component ---------- */

export default function HostFAQs({
  faqs = [
    {
      question: 'What happens in a conversation?',
      answer:
        'It’s a one-on-one conversation where you can ask questions, share context, and talk openly. There’s no fixed agenda — we go where the conversation feels most helpful.',
    },
    {
      question: 'Is this mentoring or advice?',
      answer:
        'Think of it as a conversation, not formal advice. I share experiences and perspectives — you decide what’s useful for you.',
    },
    {
      question: 'What can I ask about?',
      answer:
        'Anything related to the topics listed above. You can also bring your own context or questions.',
    },
    {
      question: 'What if I need to reschedule?',
      answer:
        'You can reschedule or cancel from your booking page as per Intella’s policy.',
    },
    {
      question: 'Do I need to prepare anything?',
      answer:
        'Not really. Having a rough idea helps, but many conversations start organically.',
    },
  ],
}: HostFAQsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="rounded-2xl bg-white p-8 shadow-sm">

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
            <QuestionIcon />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            FAQs
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <div key={index} className="py-4">
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {faq.question}
                  </span>
                  <span className="text-gray-500">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <p className="mt-3 text-sm leading-relaxed text-gray-700">
                    {faq.answer}
                  </p>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
