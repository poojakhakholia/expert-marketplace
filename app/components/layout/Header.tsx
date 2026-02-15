'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setMounted(true)

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setUser(null)
        return
      }

      // 🔹 If on login page, allow login flow to handle reactivation
      if (pathname === '/login') {
        setUser(user)
        return
      }

      // ✅ Check activation status
      const { data: dbUser } = await supabase
        .from('users')
        .select('is_active')
        .eq('id', user.id)
        .single()

      if (dbUser && dbUser.is_active === false) {
        await supabase.auth.signOut()
        router.replace('/login')
        return
      }

      setUser(user)
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })

    return () => subscription.unsubscribe()
  }, [router, pathname])

  if (!mounted) return null

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">

          <Link href="/" className="flex items-center gap-3">
            <img
              src="/branding/intella-logo.png"
              alt="Intella"
              className="h-9 w-auto"
            />
             <span className="hidden sm:inline-block rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-600">
              Early Access
             </span>
          </Link>

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
