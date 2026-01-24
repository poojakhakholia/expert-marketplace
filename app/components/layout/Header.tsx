'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function Header() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setMounted(true)

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })

    return () => subscription.unsubscribe()
  }, [])

  // Prevent hydration mismatch
  if (!mounted) return null

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">

          {/* Brand */}
          <Link href="/" className="flex items-center">
            <img
              src="/branding/intella-logo.png"
              alt="Intella"
              className="h-9 w-auto"
            />
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={() => router.push('/account')}
                title="Account"
                className="focus:outline-none"
              >
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="h-9 w-9 rounded-full border hover:ring-2 hover:ring-indigo-500 transition"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-700">
                    {user.email?.[0]?.toUpperCase()}
                  </div>
                )}
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                Login
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}
