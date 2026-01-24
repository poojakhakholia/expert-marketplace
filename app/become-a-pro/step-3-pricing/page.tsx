'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Clock,
  IndianRupee,
  MessageCircle,
} from 'lucide-react'

/* ✅ USER-SCOPED DRAFT KEY */
const getDraftKey = (userId: string) =>
  `expert_onboarding_draft_${userId}`

type Draft = {
  fee_15?: number | null
  fee_30?: number | null
  fee_45?: number | null
  fee_60?: number | null

  conversation_note_15?: string
  conversation_note_30?: string
  conversation_note_45?: string
  conversation_note_60?: string
}

const DURATIONS = [
  { key: '15', label: '15-minute conversation', field: 'fee_15', note: 'conversation_note_15' },
  { key: '30', label: '30-minute conversation', field: 'fee_30', note: 'conversation_note_30' },
  { key: '45', label: '45-minute conversation', field: 'fee_45', note: 'conversation_note_45' },
  { key: '60', label: '60-minute conversation', field: 'fee_60', note: 'conversation_note_60' },
] as const

export default function Step3Pricing() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('mode') === 'edit'

  const [draft, setDraft] = useState<Draft>({})
  const [enabled, setEnabled] = useState<Record<string, boolean>>({})
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
          .from('expert_profiles')
          .select(
            'fee_15, fee_30, fee_45, fee_60'
          )
          .eq('user_id', userId)
          .single()

        if (error) {
          console.error(error)
          setError('Failed to load pricing.')
          return
        }

        const initialDraft: Draft = {
          fee_15: data.fee_15,
          fee_30: data.fee_30,
          fee_45: data.fee_45,
          fee_60: data.fee_60,
        }

        setDraft(initialDraft)

        const initEnabled: Record<string, boolean> = {}
        DURATIONS.forEach(d => {
          initEnabled[d.key] =
            initialDraft[d.field as keyof Draft] !== null &&
            initialDraft[d.field as keyof Draft] !== undefined
        })
        setEnabled(initEnabled)

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
      setDraft(parsed)

      const initEnabled: Record<string, boolean> = {}
      DURATIONS.forEach(d => {
        initEnabled[d.key] =
          parsed[d.field] !== null && parsed[d.field] !== undefined
      })
      setEnabled(initEnabled)
    }

    init()
  }, [router, isEditMode])

  /* ---------- Toggle ---------- */
  const toggle = (key: string) => {
    const duration = DURATIONS.find(d => d.key === key)
    if (!duration) return

    setEnabled(prev => {
      const next = !prev[key]

      setDraft(d => ({
        ...d,
        [duration.field]: next ? 0 : null,
        [duration.note]: next ? d[duration.note as keyof Draft] ?? '' : '',
      }))

      return { ...prev, [key]: next }
    })
  }

  /* ---------- Update price ---------- */
  const updateFee = (field: keyof Draft, value: string) => {
    const num =
      value === '' ? null : Math.max(0, Math.floor(Number(value)))

    setDraft(prev => ({
      ...prev,
      [field]: isNaN(num as number) ? null : num,
    }))
  }

  const validate = () => {
    const hasOneEnabled = Object.values(enabled).some(Boolean)
    if (!hasOneEnabled) {
      setError('Please enable at least one conversation.')
      return false
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
      // 👉 WRITE TO DB
      try {
        setSaving(true)

        const { error } = await supabase
          .from('expert_profiles')
          .update({
            fee_15: draft.fee_15 ?? null,
            fee_30: draft.fee_30 ?? null,
            fee_45: draft.fee_45 ?? null,
            fee_60: draft.fee_60 ?? null,
          })
          .eq('user_id', user.id)

        if (error) throw error

        router.push('/become-a-pro/step-4-availability?mode=edit')
      } catch (e) {
        console.error(e)
        setError('Failed to save pricing.')
      } finally {
        setSaving(false)
      }
      return
    }

    // 👉 NEW ONBOARDING: SAVE TO DRAFT
    const DRAFT_KEY = getDraftKey(user.id)
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}')

    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        ...saved,
        ...draft,
        last_completed_step: 3,
      })
    )

    router.push('/become-a-pro/step-4-availability')
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F7FAFC] px-6 py-12">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-sm">

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Conversation pricing
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Choose which conversations you’d like to offer.
            Free conversations are welcome.
          </p>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600">{error}</p>
        )}

        <div className="space-y-5">
          {DURATIONS.map(d => {
            const feeField = d.field as keyof Draft
            const noteField = d.note as keyof Draft
            const isOn = !!enabled[d.key]

            return (
              <div
                key={d.key}
                className={`rounded-2xl border p-5 transition ${
                  isOn ? 'border-orange-200 bg-orange-50/40' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <Clock className="mt-1 text-gray-400" size={18} />
                    <div>
                      <p className="font-medium text-sm">
                        {d.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        One-to-one focused conversation
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggle(d.key)}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium ${
                      isOn
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isOn ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {isOn && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Price (INR)
                      </label>
                      <div className="flex items-center gap-2">
                        <IndianRupee size={16} className="text-gray-400" />
                        <input
                          type="number"
                          min={0}
                          step={1}
                          placeholder="0"
                          value={draft[feeField] ?? ''}
                          onChange={e =>
                            updateFee(feeField, e.target.value)
                          }
                          className="w-32 rounded-lg border px-3 py-2 text-sm"
                        />
                        <span className="text-xs text-gray-500">
                          0 = Free
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        What is this conversation best for? (optional)
                      </label>
                      <div className="relative">
                        <MessageCircle
                          size={16}
                          className="absolute left-3 top-3 text-gray-400"
                        />
                        <textarea
                          rows={2}
                          placeholder="e.g. Career guidance, problem solving, clarity on next steps"
                          value={(draft[noteField] as string) || ''}
                          onChange={e =>
                            setDraft(prev => ({
                              ...prev,
                              [noteField]: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() =>
              router.push(
                '/become-a-pro/step-2-categories' +
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
