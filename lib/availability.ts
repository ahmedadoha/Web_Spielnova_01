import { supabaseAdmin as supabase } from './supabase-admin'

export const TOTAL_ARENAS = 2

/**
 * Checks if a date falls within a configured holiday and returns its type
 */
export async function getHolidayType(dateStr: string): Promise<'school' | 'public' | null> {
    const { data: holidays } = await supabase
        .from('holidays')
        .select('*')
        .lte('start_date', dateStr)
        .gte('end_date', dateStr)
    
    if (!holidays || holidays.length === 0) return null

    // If there's a public holiday overlapping with a school holiday, 'public' takes precedence
    const isPublic = holidays.some(h => h.type === 'public')
    return isPublic ? 'public' : 'school'
}

/**
 * Generates available 30-minute time slots for a given day based on business hours.
 */
export async function generateSlots(dateStr: string, dayOfWeek: number): Promise<string[]> {
    // Sunday (0) is closed
    if (dayOfWeek === 0) return []

    const holidayType = await getHolidayType(dateStr)

    // Public holidays are closed
    if (holidayType === 'public') return []

    let startHour = 14
    let startMinute = 30
    const endHour = 20

    // Check if Saturday (6) or School Holiday
    if (dayOfWeek === 6 || holidayType === 'school') {
        startHour = 10
        startMinute = 0
    }

    const slots: string[] = []
    let currentHour = startHour
    let currentMinute = startMinute

    while (currentHour < endHour) {
        slots.push(`${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`)
        
        currentMinute += 30
        if (currentMinute >= 60) {
            currentMinute = 0
            currentHour += 1
        }
    }

    return slots
}

/**
 * Validates that a time string is exactly on a :00 or :30 mark.
 */
export function isValidSlotTime(timeStr: string): boolean {
    return timeStr.endsWith(':00') || timeStr.endsWith(':30')
}

/**
 * Checks if a requested time slot has enough free arenas.
 * Returns true if available, false if double booked.
 */
export async function checkSlotAvailability(
    dateStr: string, // YYYY-MM-DD
    startTimeStr: string, // HH:mm
    durationMinutes: number,
    requiredArenas: number
): Promise<boolean> {
    if (!isValidSlotTime(startTimeStr)) return false

    // Parse requested window
    const requestedStart = new Date(`${dateStr}T${startTimeStr}:00`).getTime()
    const requestedEnd = requestedStart + (durationMinutes * 60000)

    // Query all bookings for this day that are NOT cancelled/deleted
    const startOfDay = `${dateStr}T00:00:00.000Z`
    const endOfDay = `${dateStr}T23:59:59.999Z`

    const { data: raw, error } = await supabase
        .from('bookings')
        .select('start_time, end_time, arenas_count, status, created_at')
        .gte('end_time', startOfDay) // Overlaps with today
        .lte('start_time', endOfDay)
        .not('status', 'in', '("cancelled","deleted")')

    if (error) {
        console.error('Error fetching bookings for availability check:', error)
        return false // Safe default on error
    }

    if (!raw || raw.length === 0) return true

    // Lazy expiry: treat pending_payment bookings older than 15 min as gone.
    // This frees slots immediately without requiring a cron job.
    const PENDING_EXPIRY_MS = 15 * 60 * 1000
    const now = Date.now()
    const bookings = raw.filter(b =>
        b.status !== 'pending_payment' ||
        now - new Date(b.created_at).getTime() < PENDING_EXPIRY_MS
    )

    if (bookings.length === 0) return true

    // Check exactly the requested interval for overlaps
    let maxOverlappingArenas = 0

    // Since a booking might span multiple 30-min slots, we check each 30-min chunk 
    // of the requested duration to see the maximum arenas used at any point.
    let currentChunkStart = requestedStart
    while (currentChunkStart < requestedEnd) {
        let currentChunkEnd = currentChunkStart + (30 * 60000)
        let arenasOccupiedInThisChunk = 0

        for (const booking of bookings) {
            const bStart = new Date(booking.start_time).getTime()
            const bEnd = new Date(booking.end_time).getTime()

            // Overlap logic: StartA < EndB AND StartB < EndA
            if (bStart < currentChunkEnd && currentChunkStart < bEnd) {
                // arenas_count might be missing in older records, default to 1
                arenasOccupiedInThisChunk += booking.arenas_count || 1
            }
        }

        if (arenasOccupiedInThisChunk > maxOverlappingArenas) {
            maxOverlappingArenas = arenasOccupiedInThisChunk
        }

        currentChunkStart = currentChunkEnd
    }

    return (maxOverlappingArenas + requiredArenas) <= TOTAL_ARENAS
}
