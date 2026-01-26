'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  CalendarDays,
  Clock,
  Plus,
  XCircle,
  Info,
} from 'lucide-react'

/* ✅ USER-SCOPED DRAFT KEY */
const getDraftKey = (userId: string) =>
  `expert_onboarding_draft_${userId}`

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

const DAY_TO_INDEX: Record<(typeof DAYS)[number], number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
}

const INDEX_TO_DAY: Record<number, (typeof DAYS)[number]> = {
  0: 'Monday',
  1: 'Tuesday',
  2: 'Wednesday',
  3: 'Thursday',
  4: 'Friday',
  5: 'Saturday',
  6: 'Sunday',
}

const TIME_OPTIONS = Array.from({ length: 24 * 2 }).map((_, i) => {
  const hours = Math.floor(i / 2)
  const minutes = i % 2 === 0 ? '00' : '30'
  return `${hours.toString().padStart(2, '0')}:${minutes}`
})

type TimeSlot = {
  start: string
  end: string
}

type Availability = {
  [day: string]: TimeSlot[]
}

export default function Step4Availability() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('mode') === 'edit'

  const [availability, setAvailability] = useState<Availability>({})
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  /* ---------- Load (DB for edit mode, draft for new onboarding) ---------- */
  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/login')
        return
      }

      const userId = session.user.id

      // remove legacy global draft once
      localStorage.removeItem('expert_onboarding_draft')

      if (isEditMode) {
        // 👉 READ FROM DB
        const { data, error } = await supabase
          .from('expert_availability')
          .select('day_of_week, start_time, end_time')
          .eq('expert_id', userId)
          .order('day_of_week', { ascending: true })
          .order('start_time', { ascending: true })

        if (error) {
          console.error(error)
          setError('Failed to load availability.')
          return
        }

        const hydrated: Availability = {}
        for (const row of data || []) {
          const day = INDEX_TO_DAY[row.day_of_week]
          if (!hydrated[day]) hydrated[day] = []
          hydrated[day].push({
            start: row.start_time?.slice(0, 5) || '',
            end: row.end_time?.slice(0, 5) || '',
          })
        }

        setAvailability(hydrated)
        return
      }

      // 👉 NEW ONBOARDING: READ FROM DRAFT
      const DRAFT_KEY = getDraftKey(userId)
      const saved = localStorage.getItem(DRAFT_KEY)
      if (!saved) {
        router.push('/become-a-pro/step-1-basic')
        return
      }
      const parsed = JSON.parse(saved)
      setAvailability(parsed.availability || {})
    }

    init()
  }, [router, isEditMode])

  /* ---------- Helpers ---------- */

  const toggleDay = (day: string) => {
    setAvailability(prev => {
      if (prev[day]) {
        const copy = { ...prev }
        delete copy[day]
        return copy
      }
      return { ...prev, [day]: [{ start: '', end: '' }] }
    })
  }

  const updateSlot = (
    day: string,
    index: number,
    field: 'start' | 'end',
    value: string
  ) => {
    setAvailability(prev => {
      const slots = [...(prev[day] || [])]
      slots[index] = { ...slots[index], [field]: value }
      return { ...prev, [day]: slots }
    })
  }

  const addSlot = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), { start: '', end: '' }],
    }))
  }

  const removeSlot = (day: string, index: number) => {
    setAvailability(prev => {
      const slots = [...(prev[day] || [])]
      slots.splice(index, 1)
      return { ...prev, [day]: slots }
    })
  }

  const validate = () => {
    if (Object.keys(availability).length === 0) {
      setError('Please add availability for at least one day.')
      return false
    }
    for (const day of Object.keys(availability)) {
      for (const slot of availability[day]) {
        if (!slot.start || !slot.end || slot.start >= slot.end) {
          setError('Please ensure all time windows are valid.')
          return false
        }
      }
    }
    setError(null)
    return true
  }

  /* ---------- Save & Continue ---------- */
  const handleNext = async () => {
    if (!validate()) return

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    if (isEditMode) {
      try {
        setSaving(true)

        /* 🔹 FETCH PRICING (SOURCE OF TRUTH) */
        const { data: pricing, error: pricingError } = await supabase
          .from('expert_profiles')
          .select('fee_15, fee_30, fee_45, fee_60')
          .eq('user_id', user.id)
          .single()

        if (pricingError) throw pricingError

        const del = await supabase
          .from('expert_availability')
          .delete()
          .eq('expert_id', user.id)

        if (del.error) throw del.error

        const rows = Object.entries(availability).flatMap(
          ([day, slots]) =>
            slots.map(s => ({
              expert_id: user.id,
              day_of_week: DAY_TO_INDEX[day as (typeof DAYS)[number]],
              start_time: s.start,
              end_time: s.end,

              allows_15: !!pricing.fee_15 !== null,
              allows_30: !!pricing.fee_30 !== null,
              allows_45: !!pricing.fee_45 !== null,
              allows_60: !!pricing.fee_60 !== null,

              price_15: pricing.fee_15,
              price_30: pricing.fee_30,
              price_45: pricing.fee_45,
              price_60: pricing.fee_60,
            }))
        )

        if (rows.length > 0) {
          const ins = await supabase
            .from('expert_availability')
            .insert(rows)
          if (ins.error) throw ins.error
        }

        router.push('/')
      } catch (e) {
        console.error(e)
        setError('Failed to save availability.')
      } finally {
        setSaving(false)
      }
      return
    }

    // 👉 NEW ONBOARDING: SAVE TO DRAFT ONLY
    const DRAFT_KEY = getDraftKey(user.id)
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}')

    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        ...saved,
        availability,
        last_completed_step: 4,
      })
    )

    router.push('/become-a-pro/step-5-review')
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F7FAFC] px-6 py-12">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-sm">

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="text-gray-500" size={20} />
            <h2 className="text-2xl font-semibold text-gray-900">
              Availability for conversations
            </h2>
          </div>

          <p className="text-sm text-gray-500">
            Set when you’re usually available. All times are in{' '}
            <span className="font-medium text-gray-700">
              IST (India Standard Time)
            </span>.
          </p>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600">{error}</p>
        )}

        <div className="space-y-4">
          {DAYS.map(day => {
            const enabled = Boolean(availability[day])

            return (
              <div
                key={day}
                className={`rounded-2xl border p-5 transition ${
                  enabled ? 'border-orange-200 bg-orange-50/40' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => toggleDay(day)}
                    />
                    <span className="font-medium">{day}</span>
                  </label>
                </div>

                {enabled && (
                  <div className="mt-4 space-y-3">
                    {availability[day].map((slot, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <Clock size={16} className="text-gray-400" />

                        <select
                          value={slot.start}
                          onChange={e =>
                            updateSlot(day, idx, 'start', e.target.value)
                          }
                          className="flex-1 rounded-lg border px-3 py-2 text-sm"
                        >
                          <option value="">Start</option>
                          {TIME_OPTIONS.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>

                        <span className="text-gray-400 text-sm">to</span>

                        <select
                          value={slot.end}
                          onChange={e =>
                            updateSlot(day, idx, 'end', e.target.value)
                          }
                          className="flex-1 rounded-lg border px-3 py-2 text-sm"
                        >
                          <option value="">End</option>
                          {TIME_OPTIONS.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>

                        {availability[day].length > 1 && (
                          <button
                            onClick={() => removeSlot(day, idx)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                      </div>
                    ))}

                    {availability[day].length < 2 && (
                      <button
                        onClick={() => addSlot(day)}
                        className="flex items-center gap-2 text-sm text-orange-600 hover:underline"
                      >
                        <Plus size={14} />
                        Add another time window
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex items-start gap-2 rounded-xl bg-blue-50 p-4 text-xs text-blue-700">
          <Info size={14} className="mt-0.5" />
          <p>
            Each conversation request will come to you for approval.
            You’re always in control.
          </p>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() =>
              router.push(
                '/become-a-pro/step-3-pricing' +
                  (isEditMode ? '?mode=edit' : '')
              )
            }
            className="text-sm text-gray-600 hover:underline"
          >
            ← Previous
          </button>

          <button
            onClick={handleNext}
            disabled={saving}
            className="rounded-full bg-[#FF7A18] px-8 py-3 text-sm font-medium text-white hover:bg-[#F26D00] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}
