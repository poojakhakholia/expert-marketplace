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

  useEffect(() => {
    if (id) fetchExpert()
  }, [id])

  async function fetchExpert() {
    const { data } = await supabase
      .from('expert_profiles')
      .select('*')
      .eq('user_id', id)
      .single()

    setExpert(data)
  }

  if (!expert) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-100">
      {/* subtle side padding only */}
      <div className="mx-auto max-w-7xl px-6 pb-16">
        <HostProfileBanner expert={expert} />
      </div>
    </main>
  )
}
