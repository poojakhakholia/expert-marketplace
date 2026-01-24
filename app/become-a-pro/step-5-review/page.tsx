'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  User,
  MessageCircle,
  Clock,
  ShieldCheck,
  Send,
} from 'lucide-react'

/* ✅ USER-SCOPED DRAFT KEY */
const getDraftKey = (userId: string) =>
  `expert_onboarding_draft_${userId}`

const DAY_TO_INDEX: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
}

export default function Step5Review() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('mode') === 'edit'

  const [draft, setDraft] = useState<any>(null)
  const [agree, setAgree] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* ---------- INIT (ONBOARDING ONLY) ---------- */
  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      // ❌ Step 5 is NOT used in edit mode
      if (isEditMode) {
        router.replace('/account/expert')
        return
      }

      // remove legacy global draft once
      localStorage.removeItem('expert_onboarding_draft')

      const DRAFT_KEY = getDraftKey(user.id)
      const saved = localStorage.getItem(DRAFT_KEY)

      if (!saved) {
        router.push('/become-a-pro/step-1-basic')
        return
      }

      setDraft(JSON.parse(saved))
    }

    init()
  }, [router, isEditMode])

  /* ---------- FINAL SUBMIT ---------- */
  const handleSubmit = async () => {
    if (!agree) {
      setError('Please accept the Terms & Conditions to continue.')
      return
    }

    setSaving(true)
    setError(null)

    const {
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
      profile_image_url,

      topics,
      skills,
      languages,
      category_ids,

      fee_15,
      fee_30,
      fee_45,
      fee_60,

      availability,
    } = draft

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Authentication error. Please log in again.')
      setSaving(false)
      return
    }

    try {
      /* ---------- 1️⃣ Profile ---------- */
      const { error: profileError } = await supabase
        .from('expert_profiles')
        .upsert({
          user_id: user.id,
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
          profile_image_url,

          sub_category_tags: topics ?? [],
          skills: skills ?? [],
          languages: languages ?? [],

          fee_15,
          fee_30,
          fee_45,
          fee_60,

          approval_status: 'pending',
        })

      if (profileError) throw profileError

      /* ---------- 2️⃣ Categories ---------- */
      await supabase
        .from('expert_categories')
        .delete()
        .eq('expert_id', user.id)

      if (category_ids?.length > 0) {
        const rows = category_ids.map((cid: string) => ({
          expert_id: user.id,
          category_id: cid,
        }))

        const { error } = await supabase
          .from('expert_categories')
          .insert(rows)

        if (error) throw error
      }

      /* ---------- 3️⃣ Availability ---------- */
      await supabase
        .from('expert_availability')
        .delete()
        .eq('expert_id', user.id)

      const availabilityRows: any[] = []

      Object.entries(availability || {}).forEach(([day, slots]: any) => {
        slots.forEach((slot: any) => {
          if (!slot.start || !slot.end) return
          availabilityRows.push({
            expert_id: user.id,
            day_of_week: DAY_TO_INDEX[day],
            start_time: slot.start,
            end_time: slot.end,
          })
        })
      })

      if (availabilityRows.length > 0) {
        const { error } = await supabase
          .from('expert_availability')
          .insert(availabilityRows)

        if (error) throw error
      }

      /* ---------- 4️⃣ Cleanup ---------- */
      const DRAFT_KEY = getDraftKey(user.id)
      localStorage.removeItem(DRAFT_KEY)

      router.push('/become-a-pro/submitted')
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  if (!draft) return null

  return (
    <div className="bg-[#F7FAFC] px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-6">

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Review your profile
          </h1>
          <p className="text-sm text-gray-500">
            You can update everything later from your dashboard.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Section icon={<User size={18} />} title="Profile">
          <Item label="Name" value={draft.full_name} />
          <Item label="Headline" value={draft.headline} />
          <Item label="Bio" value={draft.bio} />
          <Item label="Experience" value={`${draft.experience_years} years`} />
          <Item label="Location" value={`${draft.city}, ${draft.country}`} />
          <Item label="Company" value={draft.company} />
          <Item label="Designation" value={draft.designation} />
        </Section>

        <Section icon={<MessageCircle size={18} />} title="Conversations">
          <Price label="15 min" value={draft.fee_15} />
          <Price label="30 min" value={draft.fee_30} />
          <Price label="45 min" value={draft.fee_45} />
          <Price label="60 min" value={draft.fee_60} />
        </Section>

        <Section icon={<Clock size={18} />} title="Availability">
          <p className="text-sm text-gray-600">
            Availability is shown in IST. Requests always require your approval.
          </p>
        </Section>

        <Section icon={<ShieldCheck size={18} />} title="Confirmation">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={agree}
              onChange={e => setAgree(e.target.checked)}
              className="mt-1"
            />
            <span>
              I agree to Intella’s{' '}
              <Link
                href="/terms"
                target="_blank"
                className="text-orange-600 underline"
              >
                Terms & Conditions
              </Link>
              , Refund Policy, and Community Guidelines.
            </span>
          </label>
        </Section>

        <div className="flex justify-between pt-4">
          <button
            onClick={() => router.push('/become-a-pro/step-4-availability')}
            className="text-sm text-gray-600 hover:underline"
          >
            ← Back
          </button>

          <button
            disabled={saving}
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-full bg-[#FF7A18] px-8 py-3 text-sm font-medium text-white hover:bg-[#F26D00] disabled:opacity-60"
          >
            <Send size={16} />
            {saving ? 'Submitting…' : 'Submit for approval'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- Helpers ---------- */

function Section({ icon, title, children }: any) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2 font-medium">
        {icon}
        {title}
      </div>
      {children}
    </div>
  )
}

function Item({ label, value }: any) {
  if (!value) return null
  return (
    <p className="text-sm mb-1">
      <span className="text-gray-500">{label}:</span>{' '}
      <span className="text-gray-800">{value}</span>
    </p>
  )
}

function Price({ label, value }: any) {
  if (value === undefined || value === null) return null
  return (
    <p className="text-sm mb-1">
      💬 {label} —{' '}
      <span className="font-medium">
        {value === 0 ? 'Free' : `₹${value}`}
      </span>
    </p>
  )
}
