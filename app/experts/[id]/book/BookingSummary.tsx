'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/* 🔹 helper: generate order code */
function generateOrderCode() {
  const num = Math.floor(100000 + Math.random() * 900000)
  return `A-${num}`
}

export default function BookingSummary({
  expert,
  date,
  time,
  duration,
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

  const handleBook = async () => {
    if (!ready || loading) return

    try {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert('You must be logged in to book')
        return
      }

      const bookingDate = date.toLocaleDateString('en-CA')
      const startTime = time

      /* 🔹 booking extras */
      const isFree = price === 0
      const orderCode = generateOrderCode()

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          expert_id: expert.user_id,
          booking_date: bookingDate,
          start_time: startTime,
          duration_minutes: Number(duration),
          amount: price,
          status: 'pending_confirmation',

          /* ✅ order code is ALWAYS present */
          order_code: orderCode,
          payment_status: isFree ? 'confirmed' : 'pending',
        })
        .select('id')
        .single()

      if (error) {
        console.error('BOOKING INSERT ERROR:', error)
        alert(error.message)
        return
      }

      /* ✅ free booking → skip payment */
      if (isFree) {
        router.push('/account/orders')
        return
      }

      /* paid flow unchanged */
      router.push(`/payments/test?booking_id=${data.id}`)
    } finally {
      setLoading(false)
    }
  }

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

      <button
        disabled={!ready || loading}
        onClick={handleBook}
        className={`
          mt-6 w-full rounded-xl py-3 text-sm font-semibold transition
          ${
            ready && !loading
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {loading
          ? 'Processing…'
          : price === 0 && ready
          ? 'Book conversation (free)'
          : 'Make payment'}
      </button>

      {ready && (
        <p className="mt-4 text-xs text-gray-500 leading-relaxed">
          After booking, this request will appear in your Orders.
          The join link will be activated a few minutes before the
          conversation starts.
        </p>
      )}
    </aside>
  )
}
