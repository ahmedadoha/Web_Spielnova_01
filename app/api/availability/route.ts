import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Helper to generate time slots
const generateSlots = (dateStr: string, dayOfWeek: number) => {
    const slots = []
    let startHour = 14 // Default Mon-Fri
    let endHour = 20

    if (dayOfWeek === 6) { // Saturday
        startHour = 10
        endHour = 20
    } else if (dayOfWeek === 0) { // Sunday (Closed)
        return []
    }

    // Generate 30 min intervals
    for (let hour = startHour; hour < endHour; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`)
        slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') // Format: YYYY-MM-DD

    if (!date) {
        return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    const selectedDate = new Date(date)
    // Use getUTCDay() because 'YYYY-MM-DD' parses as UTC midnight. 
    // This ensures consistent day calculation regardless of server timezone.
    const dayOfWeek = selectedDate.getUTCDay()

    console.log(`[Availability API] Date: ${date}, Day: ${dayOfWeek}, Server Timezone Offset: ${selectedDate.getTimezoneOffset()}`)

    if (dayOfWeek === 0) {
        return NextResponse.json({
            slots: [],
            message: 'Closed on Sundays',
            debug: { date, dayOfWeek, reason: 'Sunday' }
        })
    }

    // 1. Get all possible slots for this day
    const possibleSlots = generateSlots(date, dayOfWeek)
    console.log(`[Availability API] Generated ${possibleSlots.length} slots for day ${dayOfWeek}`)

    if (possibleSlots.length === 0) {
        // Should usually be covered by Sunday check, but just in case
        return NextResponse.json({ slots: [], message: 'No slots generated (Closed?)' })
    }

    // 2. Fetch existing bookings for this date
    // We assume the strict date string YYYY-MM-DD refers to a "Day" in the timeframe of the venue (Germany)
    // For simplicity, we query the whole UT day range that covers the potential business hours.

    const startOfDay = new Date(`${date}T00:00:00`).toISOString() // Local Midnight -> UTC
    const endOfDay = new Date(`${date}T23:59:59`).toISOString()

    console.log(`[Availability API] Querying bookings between ${startOfDay} and ${endOfDay}`)

    const { data: bookings, error } = await supabase
        .from('bookings')
        .select('start_time, arena_id')
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)

    if (error) {
        console.error('[Availability API] Supabase Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[Availability API] Found ${bookings?.length || 0} existing bookings`)

    // 3. Calculate availability per slot
    // structure: { "14:00": { arena1: true, arena2: true }, "14:30": ... }

    const availability: Record<string, { arena1: boolean, arena2: boolean }> = {}

    // Initialize with all true
    possibleSlots.forEach(time => {
        availability[time] = { arena1: true, arena2: true }
    })

    // Mark occupied arenas
    bookings?.forEach((booking: any) => {
        // Extract time from ISO string "2023-10-25T14:30:00+00:00" -> "14:30"
        // Note: We need to handle Timezones carefully. For MVP assuming local time matches stored time or handling UTC consistently.
        // Let's assume booking.start_time is stored as ISO UTC. We need to convert to 'Time' string relative to the requested day.

        // Simplification: We will store bookings as local time text or handle full dates. 
        // Ideally we rely on the specific timestamp. 

        const bookingDate = new Date(booking.start_time)
        // Get hours/minutes in Germany time (CET/CEST) or just naive local time if we stick to one timezone.
        // Let's use getHours/getMinutes assuming the server date matches or we adjust.
        // Better: parse the HH:mm from the string directly if we trust the date part matches.

        const hours = bookingDate.getHours().toString().padStart(2, '0');
        const minutes = bookingDate.getMinutes().toString().padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;

        if (availability[timeStr]) {
            if (booking.arena_id === 'arena-1') availability[timeStr].arena1 = false;
            if (booking.arena_id === 'arena-2') availability[timeStr].arena2 = false;
        }
    })

    return NextResponse.json({ date, availability })
}
