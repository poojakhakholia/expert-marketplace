'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Layers, Tag, Globe } from 'lucide-react'

type Category = {
  id: string
  name: string
}

type Draft = {
  category_ids?: string[]
  topics?: string[]
  skills?: string[]
  languages?: string[]
}

/* ✅ USER-SCOPED DRAFT KEY */
const getDraftKey = (userId: string) =>
  `expert_onboarding_draft_${userId}`

export default function Step2Categories() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('mode') === 'edit'

  const [categories, setCategories] = useState<Category[]>([])
  const [draft, setDraft] = useState<Draft>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [topicInput, setTopicInput] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [langInput, setLangInput] = useState('')

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

      /* Load categories */
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)

      if (catData) setCategories(catData)

      /* 👉 EDIT MODE → LOAD FROM DB */
      if (isEditMode) {
        const { data, error } = await supabase
          .from('expert_profiles')
          .select('skills, languages, sub_category_tags')
          .eq('user_id', userId)
          .single()

        const { data: expertCats } = await supabase
          .from('expert_categories')
          .select('category_id')
          .eq('expert_id', userId)

        if (error) {
          setError('Unable to load expert categories.')
          setLoading(false)
          return
        }

        setDraft({
          category_ids: expertCats?.map(c => c.category_id) ?? [],
          topics: data?.sub_category_tags ?? [],
          skills: data?.skills ?? [],
          languages: data?.languages ?? [],
        })

        setLoading(false)
        return
      }

      /* 👉 NEW ONBOARDING → LOAD USER-SCOPED DRAFT */
      const DRAFT_KEY = getDraftKey(userId)
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) setDraft(JSON.parse(saved))

      setLoading(false)
    }

    init()
  }, [isEditMode, router])

  /* ---------- Helpers ---------- */

  const toggleCategory = (id: string) => {
    setDraft(prev => {
      const existing = prev.category_ids || []
      return {
        ...prev,
        category_ids: existing.includes(id)
          ? existing.filter(cid => cid !== id)
          : [...existing, id],
      }
    })
  }

  const addTag = (field: keyof Draft, value: string) => {
    if (!value.trim()) return
    setDraft(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()],
    }))
  }

  const removeTag = (field: keyof Draft, value: string) => {
    setDraft(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter(v => v !== value),
    }))
  }

  const validate = () => {
    if (!draft.category_ids || draft.category_ids.length === 0) {
      setError('Please select at least one category.')
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

        // 1️⃣ Update profile arrays
        const upd = await supabase
          .from('expert_profiles')
          .update({
            sub_category_tags: draft.topics ?? [],
            skills: draft.skills ?? [],
            languages: draft.languages ?? [],
          })
          .eq('user_id', user.id)

        if (upd.error) throw upd.error

        // 2️⃣ Replace categories (delete + insert)
        const del = await supabase
          .from('expert_categories')
          .delete()
          .eq('expert_id', user.id)

        if (del.error) throw del.error

        if (draft.category_ids.length > 0) {
          const rows = draft.category_ids.map(cid => ({
            expert_id: user.id,
            category_id: cid,
          }))

          const ins = await supabase
            .from('expert_categories')
            .insert(rows)

          if (ins.error) throw ins.error
        }

        router.push('/become-a-pro/step-3-pricing?mode=edit')
      } catch (e) {
        console.error(e)
        setError('Failed to save categories.')
      } finally {
        setSaving(false)
      }
      return
    }

    /* 👉 NEW ONBOARDING → SAVE TO DRAFT */
    const DRAFT_KEY = getDraftKey(user.id)
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ ...draft, last_completed_step: 2 })
    )

    router.push('/become-a-pro/step-3-pricing')
  }

  if (loading) {
    return <div className="p-10 text-sm text-gray-500">Loading…</div>
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F7FAFC] px-6 py-12">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-sm">

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            What do you help people with?
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            This helps people discover you on Intella. You can edit this anytime.
          </p>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600">{error}</p>
        )}

        {/* Categories */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Layers size={16} />
            Categories <span className="text-red-500">*</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(cat => {
              const selected = draft.category_ids?.includes(cat.id)
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition ${
                    selected
                      ? 'bg-[#FF7A18] text-white border-[#FF7A18]'
                      : 'bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {cat.name}
                </button>
              )
            })}
          </div>
        </div>

        <TagBlock
          icon={<Tag size={14} />}
          label="Topics I can help with"
          helper="Shown on your public profile."
          placeholder="e.g. First-time startup fundraising"
          value={topicInput}
          tags={draft.topics || []}
          onChange={setTopicInput}
          onAdd={() => {
            addTag('topics', topicInput)
            setTopicInput('')
          }}
          onRemove={v => removeTag('topics', v)}
        />

        <TagBlock
          icon={<Tag size={14} />}
          label="Skills (optional)"
          placeholder="e.g. Growth strategy"
          value={skillInput}
          tags={draft.skills || []}
          onChange={setSkillInput}
          onAdd={() => {
            addTag('skills', skillInput)
            setSkillInput('')
          }}
          onRemove={v => removeTag('skills', v)}
        />

        <TagBlock
          icon={<Globe size={14} />}
          label="Languages (optional)"
          placeholder="e.g. English"
          value={langInput}
          tags={draft.languages || []}
          onChange={setLangInput}
          onAdd={() => {
            addTag('languages', langInput)
            setLangInput('')
          }}
          onRemove={v => removeTag('languages', v)}
        />

        <div className="mt-8 flex justify-between">
          <button
            onClick={() =>
              router.push(
                '/become-a-pro/step-1-basic' +
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

/* ---------- Tag Block ---------- */

function TagBlock({
  icon,
  label,
  helper,
  placeholder,
  value,
  tags,
  onChange,
  onAdd,
  onRemove,
}: {
  icon?: React.ReactNode
  label: string
  helper?: string
  placeholder: string
  value: string
  tags: string[]
  onChange: (v: string) => void
  onAdd: () => void
  onRemove: (v: string) => void
}) {
  return (
    <div className="mb-6">
      <div className="mb-1 flex items-center gap-2 text-sm font-medium">
        {icon}
        {label}
      </div>

      {helper && (
        <p className="mb-2 text-xs text-gray-500">{helper}</p>
      )}

      <div className="flex gap-2">
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
        >
          Add
        </button>
      </div>

      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map(tag => (
            <span
              key={tag}
              onClick={() => onRemove(tag)}
              className="cursor-pointer rounded-full bg-orange-50 px-3 py-1 text-xs text-orange-700 hover:bg-orange-100"
            >
              {tag} ✕
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
