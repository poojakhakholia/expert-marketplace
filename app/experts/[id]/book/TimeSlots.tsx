'use client'

export default function TimeSlots({
  slots,
  selectedTime,
  onSelect,
}: {
  slots: string[]
  selectedTime: string | null
  onSelect: (t: string) => void
}) {
  const showInstruction = slots.length === 0 && selectedTime === null

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      {/* Empty / Instruction state */}
      {slots.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
          <p className="text-sm text-gray-600">
            {showInstruction
              ? 'Please select a duration above to see available start times.'
              : 'No available start times for this date.'}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            All times are shown in IST.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {slots.map(t => {
            const selected = selectedTime === t

            return (
              <button
                key={t}
                onClick={() => onSelect(t)}
                className={`
                  rounded-lg border py-3 text-sm font-medium transition
                  ${
                    selected
                      ? 'border-orange-400 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {t}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
