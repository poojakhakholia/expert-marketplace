'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ExpertProfileEdit() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expert, setExpert] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData.session

      if (!session) {
        router.replace('/login')
        return
      }

      const userId = session.user.id

      const { data, error } = await supabase
        .from('expert_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error || !data) {
        setError('Expert profile not found.')
        setLoading(false)
        return
      }

      setExpert(data)
      setLoading(false)
    }

    load()
  }, [router])

  const update = (field: string, value: any) => {
    setExpert((prev: any) => ({ ...prev, [field]: value }))
  }

  const saveProfile = async () => {
    if (!expert) return
    setSaving(true)
    setError(null)

    const { error } = await supabase
      .from('expert_profiles')
      .update({
        full_name: expert.full_name,
        mobile_number: expert.mobile_number,
        bio: expert.bio,
        experience_years: expert.experience_years,
        city: expert.city,
        country: expert.country,
        company: expert.company,
        department: expert.department,
        designation: expert.designation,
        certifications: expert.certifications,
        languages: expert.languages,
        fee_15: expert.fee_15,
        fee_30: expert.fee_30,
        fee_45: expert.fee_45,
        fee_60: expert.fee_60
        // ❌ DO NOT TOUCH approval_status
      })
      .eq('user_id', expert.user_id)

    if (error) {
      setError(error.message)
    }

    setSaving(false)
  }

  if (loading) {
    return <p className="p-6">Loading profile…</p>
  }

  if (!expert) {
    return <p className="p-6 text-red-600">{error}</p>
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Edit Profile</h1>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <textarea
        className="w-full border rounded-lg p-3"
        rows={4}
        value={expert.bio || ''}
        onChange={e => update('bio', e.target.value)}
        placeholder="Bio"
      />

      <div className="grid grid-cols-2 gap-4">
        <input
          className="border rounded-lg p-3"
          placeholder="City"
          value={expert.city || ''}
          onChange={e => update('city', e.target.value)}
        />
        <input
          className="border rounded-lg p-3"
          placeholder="Country"
          value={expert.country || ''}
          onChange={e => update('country', e.target.value)}
        />
        <input
          className="border rounded-lg p-3"
          placeholder="Company"
          value={expert.company || ''}
          onChange={e => update('company', e.target.value)}
        />
        <input
          className="border rounded-lg p-3"
          placeholder="Department"
          value={expert.department || ''}
          onChange={e => update('department', e.target.value)}
        />
        <input
          className="border rounded-lg p-3"
          placeholder="Designation"
          value={expert.designation || ''}
          onChange={e => update('designation', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="15 min price"
          value={expert.fee_15 ?? ''}
          onChange={e => update('fee_15', Number(e.target.value) || null)}
        />
        <input
          type="number"
          placeholder="30 min price"
          value={expert.fee_30 ?? ''}
          onChange={e => update('fee_30', Number(e.target.value) || null)}
        />
        <input
          type="number"
          placeholder="45 min price"
          value={expert.fee_45 ?? ''}
          onChange={e => update('fee_45', Number(e.target.value) || null)}
        />
        <input
          type="number"
          placeholder="60 min price"
          value={expert.fee_60 ?? ''}
          onChange={e => update('fee_60', Number(e.target.value) || null)}
        />
      </div>

      <button
        onClick={saveProfile}
        disabled={saving}
        className="bg-black text-white px-6 py-3 rounded-lg"
      >
        {saving ? 'Saving…' : 'Save Profile'}
      </button>
    </main>
  )
}
