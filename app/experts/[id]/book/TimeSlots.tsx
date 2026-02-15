'use client'

type Slot = {
  time: string
  status: 'available' | 'booked' | 'too_soon'
}

export default function TimeSlots({
  slots,
  selectedTime,
  onSelect,
}: {
  slots: Slot[]
  selectedTime: string | null
  onSelect: (t: string) => void
}) {
  const showInstruction =
    slots.length === 0 && selectedTime === null

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
          {slots.map(slot => {
            const selected = selectedTime === slot.time
            const disabled = slot.status !== 'available'

            const base =
              'rounded-lg border py-3 text-sm font-medium transition'

            const styles =
              slot.status === 'available'
                ? selected
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                : slot.status === 'booked'
                ? 'border-red-200 bg-red-50 text-red-500 cursor-not-allowed'
                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'

            return (
              <button
                key={slot.time}
                disabled={disabled}
                onClick={() => onSelect(slot.time)}
                className={`${base} ${styles}`}
              >
                {slot.time}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
