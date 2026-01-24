'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User, Camera } from 'lucide-react'

type Draft = {
  full_name?: string
  headline?: string
  bio?: string
  experience_years?: number
  city?: string
  country?: string
  company?: string
  designation?: string
  department?: string
  mobile_number?: string
  profile_image_url?: string | null
}

/* ✅ USER-SCOPED DRAFT KEY */
const getDraftKey = (userId: string) =>
  `expert_onboarding_draft_${userId}`

export default function Step1BasicInfo() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('mode') === 'edit'

  const [draft, setDraft] = useState<Draft>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  /* ---------- INIT ---------- */
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

      /* 👉 EDIT MODE → LOAD FROM DB */
      if (isEditMode) {
        const { data, error } = await supabase
          .from('expert_profiles')
          .select(
            `
            full_name,
            headline,
            bio,
            experience_years,
            city,
            country,
            company,
            designation,
            department,
            mobile_number,
            profile_image_url
          `
          )
          .eq('user_id', userId)
          .single()

        if (error || !data) {
          setError('Unable to load expert profile.')
          setLoading(false)
          return
        }

        setDraft(data)
        setLoading(false)
        return
      }

      /* 👉 NEW ONBOARDING → LOAD USER-SCOPED DRAFT */
      const DRAFT_KEY = getDraftKey(userId)
      const saved = localStorage.getItem(DRAFT_KEY)
      let draftData: Draft = saved ? JSON.parse(saved) : {}

      if (!draftData.full_name) {
        draftData.full_name =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          ''
      }

      if (!draftData.profile_image_url) {
        draftData.profile_image_url =
          session.user.user_metadata?.avatar_url || null
      }

      setDraft(draftData)
      setLoading(false)
    }

    init()
  }, [isEditMode, router])

  const update = (field: keyof Draft, value: any) => {
    setDraft(prev => ({ ...prev, [field]: value }))
  }

  const validate = () => {
    if (
      !draft.bio ||
      !draft.experience_years ||
      !draft.city ||
      !draft.country
    ) {
      setError('Please fill all required fields.')
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
      try {
        setSaving(true)

        const { error } = await supabase
          .from('expert_profiles')
          .update({
            full_name: draft.full_name,
            headline: draft.headline,
            bio: draft.bio,
            experience_years: draft.experience_years,
            city: draft.city,
            country: draft.country,
            company: draft.company,
            designation: draft.designation,
            department: draft.department,
            mobile_number: draft.mobile_number,
            profile_image_url: draft.profile_image_url,
          })
          .eq('user_id', user.id)

        if (error) throw error

        router.push('/become-a-pro/step-2-categories?mode=edit')
      } catch (e) {
        console.error(e)
        setError('Failed to save profile.')
      } finally {
        setSaving(false)
      }
      return
    }

    /* 👉 NEW ONBOARDING → SAVE TO DRAFT */
    const DRAFT_KEY = getDraftKey(user.id)
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ ...draft, last_completed_step: 1 })
    )

    router.push('/become-a-pro/step-2-categories')
  }

  if (loading) {
    return <div className="p-10 text-sm text-gray-500">Loading…</div>
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F7FAFC] px-6 py-12">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-sm">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Tell us about yourself
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            This helps people understand who you are and what they can talk to you about.
          </p>
        </div>

        {/* Avatar */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gray-100">
            {draft.profile_image_url ? (
              <img
                src={draft.profile_image_url}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <User size={36} />
              </div>
            )}
          </div>

          <button className="mt-3 flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
            <Camera size={14} />
            Upload profile photo
          </button>

          <p className="mt-2 text-xs text-gray-400">
            A friendly photo helps people feel comfortable starting a conversation.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <input
            value={draft.full_name || ''}
            onChange={e => update('full_name', e.target.value)}
            placeholder="Full name"
            className="w-full rounded-lg border px-4 py-3 text-sm"
          />

          <input
            value={draft.headline || ''}
            onChange={e => update('headline', e.target.value)}
            placeholder="Headline"
            className="w-full rounded-lg border px-4 py-3 text-sm italic"
          />

          <textarea
            rows={4}
            value={draft.bio || ''}
            onChange={e => update('bio', e.target.value)}
            placeholder="About you *"
            className="w-full rounded-lg border px-4 py-3 text-sm"
          />

          <select
            value={draft.experience_years ?? ''}
            onChange={e => update('experience_years', Number(e.target.value))}
            className="w-full rounded-lg border px-4 py-3 text-sm"
          >
            <option value="">Years of experience *</option>
            <option value={1}>0–1 years</option>
            <option value={3}>2–5 years</option>
            <option value={7}>5–10 years</option>
            <option value={12}>10+ years</option>
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input
              value={draft.city || ''}
              onChange={e => update('city', e.target.value)}
              placeholder="City *"
              className="rounded-lg border px-4 py-3 text-sm"
            />
            <input
              value={draft.country || ''}
              onChange={e => update('country', e.target.value)}
              placeholder="Country *"
              className="rounded-lg border px-4 py-3 text-sm"
            />
          </div>

          <input
            value={draft.company || ''}
            onChange={e => update('company', e.target.value)}
            placeholder="Company (optional)"
            className="w-full rounded-lg border px-4 py-3 text-sm"
          />

          <input
            value={draft.designation || ''}
            onChange={e => update('designation', e.target.value)}
            placeholder="Designation (optional)"
            className="w-full rounded-lg border px-4 py-3 text-sm"
          />

          <input
            value={draft.department || ''}
            onChange={e => update('department', e.target.value)}
            placeholder="Department (optional)"
            className="w-full rounded-lg border px-4 py-3 text-sm"
          />

          <input
            value={draft.mobile_number || ''}
            onChange={e => update('mobile_number', e.target.value)}
            placeholder="Mobile number (optional)"
            className="w-full rounded-lg border px-4 py-3 text-sm"
          />
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-8 flex justify-end">
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
