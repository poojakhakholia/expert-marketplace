'use client'

type Props = {
  selectedDate: Date | null
  onChange: (d: Date) => void
  availability?: any[]
}

export default function DatePicker({
  selectedDate,
  onChange,
  availability = [],
}: Props) {
  // availability may be undefined on first render
  const availableDays = new Set(
    availability.map((a: any) => Number(a.day_of_week))
  )

  const dates = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
        {dates.map(d => {
          const day = d.getDay()
          const disabled = !availableDays.has(day)

          const selected =
            selectedDate !== null &&
            d.toDateString() === selectedDate.toDateString()

          return (
            <button
              key={d.toDateString()}
              disabled={disabled}
              onClick={() => onChange(d)}
              className={`
                flex-shrink-0 rounded-xl px-4 py-2 text-sm border transition
                ${
                  selected
                    ? 'border-[#FF7A18] bg-[#FF7A18]/10 text-[#FF7A18]'
                    : 'border-gray-200 bg-white text-gray-700'
                }
                ${
                  disabled
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="text-xs text-gray-500">
                {d.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="font-medium">
                {d.toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                })}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
