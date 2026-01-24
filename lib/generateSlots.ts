// lib/generateSlots.ts

type Availability = {
  day_of_week: number | string
  start_time: string // "10:00:00"
  end_time: string   // "18:00:00"
}

type Booking = {
  start_time?: string | null
  end_time?: string | null
}

function toMinutes(t?: string | null) {
  if (!t) return null
  const parts = t.split(':').map(Number)
  if (parts.length < 2) return null
  return parts[0] * 60 + parts[1]
}

function toTime(m: number) {
  const h = String(Math.floor(m / 60)).padStart(2, '0')
  const min = String(m % 60).padStart(2, '0')
  return `${h}:${min}`
}

export function generateSlots({
  availability,
  bookings,
  duration,
  selectedDate,
}: {
  availability: Availability[]
  bookings: Booking[]
  duration: number
  selectedDate: Date
}) {
  const now = new Date()
  const isToday = selectedDate.toDateString() === now.toDateString()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const slots: string[] = []

  availability.forEach(a => {
    let start = toMinutes(a.start_time)
    const end = toMinutes(a.end_time)

    if (start === null || end === null) return

    // 🔁 STEP = 15 minutes (NOT duration)
    while (start + duration <= end) {
      const slotStart = start
      const slotEnd = start + duration

      // ❌ Past time today
      if (isToday && slotStart <= nowMinutes) {
        start += 15
        continue
      }

      // ❌ Overlaps with existing bookings
      const overlaps = bookings.some(b => {
        const bStart = toMinutes(b.start_time)
        const bEnd = toMinutes(b.end_time)

        if (bStart === null || bEnd === null) return false
        return bStart < slotEnd && bEnd > slotStart
      })

      if (!overlaps) {
        slots.push(toTime(slotStart))
      }

      // ⏭️ Move by 15 minutes
      start += 15
    }
  })

  return slots
}
