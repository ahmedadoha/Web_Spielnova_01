import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateSlots, TOTAL_ARENAS } from '@/lib/availability'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') // Format: YYYY-MM-DD

    if (!date) {
        return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    const selectedDate = new Date(date)
    const dayOfWeek = selectedDate.getUTCDay()

    if (dayOfWeek === 0) {
        return NextResponse.json({
            slots: [],
            message: 'Closed on Sundays',
            debug: { date, dayOfWeek, reason: 'Sunday' }
        })
    }

    // 1. Get dynamic slots for this day
    const possibleSlots = await generateSlots(date, dayOfWeek)

    if (possibleSlots.length === 0) {
        return NextResponse.json({ slots: [], message: 'No slots generated (Closed?)' })
    }

    // 2. Fetch existing active bookings for this date
    const startOfDay = `${date}T00:00:00.000Z`
    const endOfDay = `${date}T23:59:59.999Z`

    const { data: bookings, error } = await supabase
        .from('bookings')
        .select('start_time, end_time, arenas_count, status')
        .gte('end_time', startOfDay) // Intersects with today
        .lte('start_time', endOfDay)
        .not('status', 'in', '("cancelled","deleted")') // IGNORE cancelled/deleted!

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 3. Calculate availability per slot
    const availability: Record<string, { arena1: boolean, arena2: boolean }> = {}

    possibleSlots.forEach(time => {
        // Build start/end time of this 30-min chunk
        const chunkStart = new Date(`${date}T${time}:00`).getTime()
        const chunkEnd = chunkStart + (30 * 60000)

        let arenasOccupied = 0

        if (bookings) {
            for (const booking of bookings) {
                const bStart = new Date(booking.start_time).getTime()
                const bEnd = new Date(booking.end_time).getTime()

                // Overlap logic: StartA < EndB AND StartB < EndA
                if (bStart < chunkEnd && chunkStart < bEnd) {
                    arenasOccupied += booking.arenas_count || 1
                }
            }
        }

        // Map occupied arenas to the expected format
        // If 0 occupied, both are true
        // If 1 occupied, arena1 is false, arena2 is true
        // If >=2 occupied, both are false
        availability[time] = {
            arena1: arenasOccupied < 1,
            arena2: arenasOccupied < 2
        }
    })

    return NextResponse.json({ date, availability })
}
