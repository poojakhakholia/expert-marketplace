'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

import DatePicker from './DatePicker'
import TimeSlots from './TimeSlots'
import DurationSelector from './DurationSelector'
import BookingSummary from './BookingSummary'

import { CalendarDays, Clock, Timer } from 'lucide-react'

/* ----------------------------------------
   Helpers
---------------------------------------- */

/**
 * DB: Monday = 0 ... Sunday = 6
 * JS: Sunday = 0 ... Saturday = 6
 */
function dbDayToJsDay(dbDay: number): number {
  return (dbDay + 1) % 7
}

/**
 * Convert JS Date → IST YYYY-MM-DD
 */
function formatDateIST(d: Date): string {
  return d.toLocaleDateString('en-CA', {
    timeZone: 'Asia/Kolkata',
  })
}

/* ----------------------------------------
   Types
---------------------------------------- */

type Slot = {
  time: string
  status: 'available' | 'booked' | 'too_soon'
}

/* ----------------------------------------
   Page
---------------------------------------- */

export default function ExpertBookingPage() {
  const { id } = useParams()

  const [expert, setExpert] = useState<any>(null)
  const [availability, setAvailability] = useState<any[]>([])

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const [slots, setSlots] = useState<Slot[]>([])

  const [loading, setLoading] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)

  /* 🔒 NEW: self-booking guard */
  const [isSelfBooking, setIsSelfBooking] = useState(false)

  /* ----------------------------------------
     Load expert + availability + auth check
  ---------------------------------------- */

  useEffect(() => {
    async function loadExpert() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user && user.id === id) {
        setIsSelfBooking(true)
      }

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
     Load available slots
  ---------------------------------------- */

  useEffect(() => {
    async function loadSlots() {
      if (!selectedDate || !duration) {
        setSlots([])
        return
      }

      setLoadingSlots(true)
      setSelectedTime(null)

      const bookingDate = formatDateIST(selectedDate)

      const { data, error } = await supabase.rpc(
        'get_available_slots',
        {
          p_expert_id: id,
          p_booking_date: bookingDate,
          p_duration: duration,
        }
      )

      if (error) {
        console.error('Failed to load available slots', error)
        setSlots([])
        setLoadingSlots(false)
        return
      }

      const formatted: Slot[] = (data || []).map(
        (r: { start_time: string; status: string }) => ({
          time: r.start_time.slice(0, 5),
          status: r.status,
        })
      )

      setSlots(formatted)
      setLoadingSlots(false)
    }

    loadSlots()
  }, [id, selectedDate, duration])

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16 text-gray-500">
        Loading booking page…
      </main>
    )
  }

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

            {loadingSlots && (
              <p className="mt-3 text-xs text-gray-400">
                Loading available times…
              </p>
            )}

            <p className="mt-2 text-xs text-gray-400">
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
            /* 🔒 NEW */
            isSelfBooking={isSelfBooking}
          />
        </div>
      </div>
    </main>
  )
}
