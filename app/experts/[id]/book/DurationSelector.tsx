'use client'

export default function DurationSelector({
  expert,
  duration,
  onSelect,
}: any) {
  const options = [
    {
      min: 15,
      price: expert.fee_15,
      note: expert.conversation_note_15,
    },
    {
      min: 30,
      price: expert.fee_30,
      note: expert.conversation_note_30,
    },
    {
      min: 45,
      price: expert.fee_45,
      note: expert.conversation_note_45,
    },
    {
      min: 60,
      price: expert.fee_60,
      note: expert.conversation_note_60,
    },
  ].filter(o => o.price !== null && o.price !== undefined)

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <div className="grid grid-cols-2 gap-4">
        {options.map(o => {
          const selected = duration === o.min

          return (
            <button
              key={o.min}
              onClick={() => onSelect(o.min)}
              className={`
                rounded-xl px-4 py-5 text-center transition-all border text-left
                ${
                  selected
                    ? `
                      border-[#FF7A18]
                      bg-gradient-to-br from-[#FF7A18]/10 via-[#FF9A4D]/10 to-[#FF7A18]/5
                      shadow-[0_6px_18px_rgba(255,122,24,0.25)]
                    `
                    : `
                      border-gray-200
                      bg-white
                      hover:bg-gray-50
                    `
                }
              `}
            >
              <div
                className={`text-sm ${
                  selected
                    ? 'text-[#FF7A18] font-medium'
                    : 'text-gray-600'
                }`}
              >
                {o.min} minutes
              </div>

              <div
                className={`mt-1 text-lg font-semibold ${
                  selected ? 'text-gray-900' : 'text-gray-800'
                }`}
              >
                ₹{o.price}
              </div>

              {/* 🔹 Best-for hint (only when selected & available) */}
              {selected && o.note && (
                <div className="mt-2 text-xs text-gray-600 leading-relaxed">
                  <span className="font-medium text-gray-700">
                    Best for:
                  </span>{' '}
                  {o.note}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
