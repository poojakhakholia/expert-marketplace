'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function BookingSummary({
  expert,
  date,
  time,
  duration,
  isSelfBooking = false, // 🔒 existing safeguard
}: any) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const price =
    duration === 15
      ? expert.fee_15
      : duration === 30
      ? expert.fee_30
      : duration === 45
      ? expert.fee_45
      : duration === 60
      ? expert.fee_60
      : 0

  const ready = Boolean(date && time && duration)

  const handleProceed = async () => {
    if (isSelfBooking) return
    if (!ready || loading) return

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert('You must be logged in to book')
        return
      }

      // 🔑 IMPORTANT:
      // No booking, no order_code, no DB write here.
      // This is only an INTENT handoff to payment page.

      const bookingDate = date.toLocaleDateString('en-CA')

      const params = new URLSearchParams({
        expert_id: expert.user_id,
        date: bookingDate,
        time,
        duration: String(duration),
      })

      router.push(`/payments/test?${params.toString()}`)
    } finally {
      setLoading(false)
    }
  }

  const isDisabled =
    isSelfBooking || !ready || loading

  return (
    <aside className="bg-white rounded-2xl p-6 shadow-sm sticky top-10 h-fit">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Booking summary
      </h2>

      <p className="text-sm text-gray-600 mb-4">
        You’re booking a conversation with{' '}
        <span className="font-medium text-gray-900">
          {expert.full_name}
        </span>.
      </p>

      <div className="space-y-1.5 text-sm text-gray-600">
        {date && (
          <div>
            <span className="text-gray-500">Date:</span>{' '}
            {date.toDateString()}
          </div>
        )}
        {time && (
          <div>
            <span className="text-gray-500">Time:</span>{' '}
            {time} (IST)
          </div>
        )}
        {duration && (
          <div>
            <span className="text-gray-500">Duration:</span>{' '}
            {duration} minutes
          </div>
        )}
      </div>

      {ready && (
        <div className="mt-6 pt-4 border-t flex justify-between text-base font-semibold">
          <span>Total</span>
          <span>{price === 0 ? 'Free' : `₹${price}`}</span>
        </div>
      )}

      {/* CTA */}
      <button
        disabled={isDisabled}
        onClick={handleProceed}
        title={
          isSelfBooking
            ? 'You cannot book yourself'
            : undefined
        }
        className={`
          mt-6 w-full rounded-xl py-3 text-sm font-semibold transition
          ${
            !isDisabled
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {isSelfBooking
          ? 'Booking unavailable'
          : loading
          ? 'Processing…'
          : price === 0
          ? 'Proceed (Free session)'
          : 'Proceed to payment'}
      </button>

      {isSelfBooking && (
        <p className="mt-3 text-xs text-gray-500 text-center">
          You cannot book a conversation with yourself.
        </p>
      )}

      {ready && !isSelfBooking && (
        <p className="mt-4 text-xs text-gray-500 leading-relaxed">
          You’ll review and confirm this booking on the next step.
        </p>
      )}
    </aside>
  )
}
