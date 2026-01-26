'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

import DatePicker from './DatePicker'
import TimeSlots from './TimeSlots'
import DurationSelector from './DurationSelector'
import BookingSummary from './BookingSummary'
import { generateSlots } from '@/lib/generateSlots'

import { CalendarDays, Clock, Timer } from 'lucide-react'

/* ----------------------------------------
   Helpers
---------------------------------------- */

/**
 * DB: Monday = 0 ... Sunday = 6
 * JS: Sunday = 0 ... Saturday = 6
 *
 * Convert DB day → JS day
 */
function dbDayToJsDay(dbDay: number): number {
  return (dbDay + 1) % 7
}

/* ----------------------------------------
   Page
---------------------------------------- */

export default function ExpertBookingPage() {
  const { id } = useParams()

  const [expert, setExpert] = useState<any>(null)
  const [availability, setAvailability] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  /* ----------------------------------------
     Load expert + availability
  ---------------------------------------- */

  useEffect(() => {
    async function loadExpert() {
      const { data: expert } = await supabase
        .from('expert_profiles')
        .select('*')
        .eq('user_id', id)
        .single()

      const { data: availability } = await supabase
        .from('expert_availability')
        .select('*')
        .eq('expert_id', id)

      setExpert(expert)
      setAvailability(availability || [])
      setLoading(false)

      // auto-select next available day
      if (availability && availability.length > 0) {
        const availableJsDays = new Set(
          availability.map(a => dbDayToJsDay(a.day_of_week))
        )

        const start = new Date()
        start.setDate(start.getDate() + 1)

        for (let i = 0; i < 14; i++) {
          const d = new Date(start)
          d.setDate(start.getDate() + i)

          if (availableJsDays.has(d.getDay())) {
            setSelectedDate(d)
            break
          }
        }
      }
    }

    loadExpert()
  }, [id])

  /* ----------------------------------------
     Load bookings for selected date
  ---------------------------------------- */

  useEffect(() => {
    if (!selectedDate) return

    async function loadBookings() {
      const dateStr = selectedDate.toISOString().split('T')[0]

      const { data } = await supabase
        .from('bookings')
        .select('start_time,end_time')
        .eq('expert_id', id)
        .eq('booking_date', dateStr)
        .in('status', ['pending', 'confirmed'])

      setBookings(data || [])
    }

    loadBookings()
    setSelectedTime(null)
  }, [id, selectedDate])

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16 text-gray-500">
        Loading booking page…
      </main>
    )
  }

  /* ----------------------------------------
     Availability for selected day
  ---------------------------------------- */

  const selectedDay =
    selectedDate !== null ? selectedDate.getDay() : null

  const dayAvailability =
    selectedDay === null
      ? []
      : availability.filter(a => {
          const jsDay = dbDayToJsDay(a.day_of_week)
          return jsDay === selectedDay
        })

  /* ----------------------------------------
     Slot generation (NO premature filtering)
  ---------------------------------------- */

  const slots =
    selectedDate && duration
      ? generateSlots({
          availability: dayAvailability,
          bookings,
          duration,
          selectedDate,
        })
      : []

  /* ----------------------------------------
     UI
  ---------------------------------------- */

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">

          {/* Select Date */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <CalendarDays size={18} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Select date
              </h2>
            </div>

            <DatePicker
              selectedDate={selectedDate}
              onChange={setSelectedDate}
              availability={availability}
            />
          </section>

          {/* Select Duration */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-orange-50 p-2 text-orange-600">
                <Timer size={18} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Select duration
              </h2>
            </div>

            <DurationSelector
              expert={expert}
              duration={duration}
              onSelect={setDuration}
            />
          </section>

          {/* Select Time */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-teal-50 p-2 text-teal-600">
                <Clock size={18} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Select time
              </h2>
            </div>

            <TimeSlots
              slots={slots}
              selectedTime={selectedTime}
              onSelect={setSelectedTime}
            />

            <p className="mt-3 text-xs text-gray-400">
              All times shown are in IST
            </p>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          <BookingSummary
            expert={expert}
            date={selectedDate}
            time={selectedTime}
            duration={duration}
          />
        </div>
      </div>
    </main>
  )
}
