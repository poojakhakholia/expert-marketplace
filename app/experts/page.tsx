'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

import HostProfileBanner from './components/HostProfileBanner'

// KEEP EXISTING IMPORTS (UNTOUCHED)
import ExpertHero from './components/ExpertHero'
import ExpertMeta from './components/ExpertMeta'
import ExpertAbout from './components/ExpertAbout'
import ExpertOfferCard from './components/ExpertOfferCard'

type Expert = {
  user_id: string
  full_name: string
  headline: string
  bio: string
}

export default function ExpertProfilePage() {
  const { id } = useParams()
  const [expert, setExpert] = useState<Expert | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (id) fetchExpert()
  }, [id])

  async function fetchExpert() {
    const { data } = await supabase
      .from('expert_profiles')
      .select(`
        *,
        users!inner(is_active)
      `)
      .eq('user_id', id)
      .eq('approval_status', 'approved')
      .eq('users.is_active', true)
      .single()

    if (!data) {
      setNotFound(true)
      return
    }

    setExpert(data)
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-800">
            404 – Expert not found
          </h1>
          <p className="mt-3 text-slate-600">
            This profile is not available.
          </p>
        </div>
      </main>
    )
  }

  if (!expert) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-100">
      <div className="mx-auto max-w-7xl px-6 pb-16">
        <HostProfileBanner expert={expert} />
      </div>
    </main>
  )
}
