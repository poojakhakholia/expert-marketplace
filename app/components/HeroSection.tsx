'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type ExpertStatus = 'approved' | 'pending' | 'rejected' | null

export default function HeroSection() {
  const [expertStatus, setExpertStatus] = useState<ExpertStatus>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadExpertStatus = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData.user

      if (!user) {
        setLoading(false)
        return
      }

      if (user.user_metadata?.role === 'admin') {
        setExpertStatus('approved')
        setLoading(false)
        return
      }

      const { data: expertProfile } = await supabase
        .from('expert_profiles')
        .select('approval_status')
        .eq('user_id', user.id)
        .single()

      setExpertStatus(expertProfile?.approval_status ?? null)
      setLoading(false)
    }

    loadExpertStatus()
  }, [])

  if (loading) return null

  const isExpertApprovedOrPending =
    expertStatus === 'approved' || expertStatus === 'pending'

  return (
    <section className="relative overflow-hidden intella-page">
      {/* Intella gradient sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-sky-50 to-white" />

      {/* Soft radial glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-sky-200/40 blur-[140px]" />

      {/* CONTENT */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-16 text-center">
        <h1 className="text-[42px] md:text-[56px] font-semibold tracking-tight text-slate-900 leading-[1.15]">
          Everyone knows something
          <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
            worth sharing
          </span>
        </h1>

        <p className="mt-5 max-w-2xl mx-auto text-base md:text-lg text-slate-600">
          Learn directly from people’s real-world experience through
          one-to-one conversations.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap justify-center gap-5">
          {!isExpertApprovedOrPending && (
            <Link
              href="/become-a-pro/step-1-basic"
              className="intella-btn-primary flex items-center gap-3"
            >
              <span className="text-lg">💬</span>
              Get Started to host conversations
            </Link>
          )}

          <Link
            href="/explore"
            className={
              isExpertApprovedOrPending
                ? 'intella-btn-primary flex items-center gap-3'
                : 'intella-btn-secondary flex items-center gap-3'
            }
          >
            <span className="text-lg">🔍</span>
            Explore conversations
          </Link>
        </div>

        {/* INFO STRIP */}
        <div className="mt-12 flex flex-wrap justify-center gap-10 text-slate-600">
          <div className="flex items-center gap-3">
            <span className="text-xl">💡</span>
            <span className="text-sm">Real experiences</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xl">🤝</span>
            <span className="text-sm">1-on-1 conversations</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xl">💸</span>
            <span className="text-sm">Get paid flexibly</span>
          </div>
        </div>
      </div>
    </section>
  )
}
