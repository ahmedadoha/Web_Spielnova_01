import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/supabase-server'
import { checkSlotAvailability } from '@/lib/availability'
import { sendBookingConfirmation } from '@/lib/email'

// Converts a raw Supabase booking row (which uses start_time/end_time timestamps)
// into the flat { date, time, duration_minutes, ... } shape the admin UI expects.
function normalizeBooking(row: Record<string, unknown>) {
    if (!row) return row

    // If the row already has `date` + `time` (walk-in bookings written with those cols), keep them.
    // Otherwise derive them from `start_time`.
    if (!row.date && row.start_time) {
        const startDate = new Date(row.start_time as string)
        // Format: YYYY-MM-DD
        const year = startDate.getUTCFullYear()
        const month = String(startDate.getUTCMonth() + 1).padStart(2, '0')
        const day = String(startDate.getUTCDate()).padStart(2, '0')
        row.date = `${year}-${month}-${day}`

        // Format: HH:mm  (stored as UTC naive local time, see availability route comment)
        const hours = String(startDate.getUTCHours()).padStart(2, '0')
        const minutes = String(startDate.getUTCMinutes()).padStart(2, '0')
        row.time = `${hours}:${minutes}`
    }

    if (!row.duration_minutes && row.start_time && row.end_time) {
        const start = new Date(row.start_time as string).getTime()
        const end = new Date(row.end_time as string).getTime()
        row.duration_minutes = (end - start) / 60000
    }

    if (!row.game_name) {
        row.game_name = (row.game_slug as string) || (row.game_mode as string) || '—'
    }

    if (!row.arenas_count) {
        row.arenas_count = 1
    }

    if (row.total_amount === undefined || row.total_amount === null) {
        row.total_amount = 0
    }

    return row
}

// GET: list bookings (with optional date filter)
export async function GET(request: NextRequest) {
    const { employee, supabase } = await getAdminSession()
    if (!employee) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    // Query using start_time since that's what the original schema uses.
    // Exclude pending_payment bookings: they have no confirmed payment yet and
    // should not appear in the admin board until payment is completed.
    let query = supabase
        .from('bookings')
        .select('*')
        .neq('status', 'pending_payment')
        .order('start_time', { ascending: true })

    if (date) {
        // Match the full day range in UTC (bookings stored as UTC naive local time)
        const startOfDay = `${date}T00:00:00.000Z`
        const endOfDay = `${date}T23:59:59.999Z`
        query = query.gte('start_time', startOfDay).lte('start_time', endOfDay)
    } else if (from && to) {
        const startOfFrom = `${from}T00:00:00.000Z`
        const endOfTo = `${to}T23:59:59.999Z`
        query = query.gte('start_time', startOfFrom).lte('start_time', endOfTo)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const bookings = (data || []).map(normalizeBooking)
    return NextResponse.json({ bookings })
}

// POST: create a walk-in booking OR an internal slot block
export async function POST(request: NextRequest) {
    const { employee, user, supabase } = await getAdminSession()
    if (!employee) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { booking_type } = body

    // ── Internal slot block ────────────────────────────────────────────────────
    if (booking_type === 'block') {
        const { date, time, duration_minutes, arenas_count, reason, staff_notes } = body

        if (!date || !time) {
            return NextResponse.json({ error: 'date und time sind erforderlich' }, { status: 400 })
        }

        const dur    = duration_minutes || 60
        const arenas = arenas_count    || 2
        const label  = reason || 'Intern'

        // Check for conflicts with existing bookings (skip opening-hours check —
        // maintenance can happen on any day or time).
        const startTime = new Date(`${date}T${time}:00`)
        const endTime   = new Date(startTime.getTime() + dur * 60000)

        const { data: conflicts } = await supabase
            .from('bookings')
            .select('id, arenas_count')
            .neq('status', 'cancelled')
            .neq('status', 'deleted')
            .lt('start_time', endTime.toISOString())
            .gt('end_time', startTime.toISOString())

        const occupiedArenas = (conflicts ?? []).reduce(
            (sum, b) => sum + ((b.arenas_count as number) || 1), 0
        )
        if (occupiedArenas + arenas > 2) {
            return NextResponse.json(
                { error: 'Dieser Zeitslot ist bereits (teilweise) belegt — Sperrung nicht möglich.' },
                { status: 409 }
            )
        }

        const { data: booking, error } = await supabase
            .from('bookings')
            .insert({
                customer_name:    `[Gesperrt] ${label}`,
                start_time:       startTime.toISOString(),
                end_time:         endTime.toISOString(),
                arena_id:         'arena-1',
                game_mode:        'internal',
                game_slug:        'internal',
                game_name:        label,
                date,
                time,
                duration_minutes: dur,
                player_count:     arenas * 4,
                arenas_count:     arenas,
                status:           'confirmed',
                walk_in:          false,
                staff_notes:      staff_notes || label,
                total_amount:     0,
            })
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        await supabase.from('audit_log').insert({
            employee_id:   user!.id,
            employee_name: employee.name,
            action:        'slot_blocked',
            booking_id:    booking.id,
            new_value:     booking,
            notes:         `Slot gesperrt: ${label}, ${date} ${time}, ${dur} Min., ${arenas} Arena(en)`,
        })

        return NextResponse.json({ booking: normalizeBooking(booking) })
    }

    // ── Walk-in booking ───────────────────────────────────────────────────────
    const {
        customer_name, customer_email, customer_phone,
        game_name, game_slug, date, time, duration_minutes,
        player_count, arenas_count, payment_method, staff_notes
    } = body

    if (!customer_name || !date || !time) {
        return NextResponse.json({ error: 'customer_name, date, and time are required' }, { status: 400 })
    }

    const dur    = duration_minutes || 60
    const arenas = arenas_count || (player_count > 4 ? 2 : 1)

    // Verify slot is valid and free
    const isAvailable = await checkSlotAvailability(date, time, dur, arenas)
    if (!isAvailable) {
        return NextResponse.json({ error: 'This time slot is no longer available or is not a valid 30-minute block.' }, { status: 409 })
    }

    // Build start_time / end_time for availability compatibility
    const startTime = new Date(`${date}T${time}:00`)
    const endTime   = new Date(startTime.getTime() + dur * 60000)

    const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
            customer_name,
            customer_email: customer_email || null,
            customer_phone: customer_phone || null,
            start_time:     startTime.toISOString(),
            end_time:       endTime.toISOString(),
            arena_id:       'arena-1',
            game_mode:      'walk-in',
            game_slug:      game_slug || game_name,
            game_name,
            date,
            time,
            duration_minutes: dur,
            player_count,
            arenas_count:  arenas,
            status:        'confirmed',
            payment_method: payment_method || 'cash',
            walk_in:       true,
            staff_notes:   staff_notes || null,
            total_amount:  0,
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Write audit log
    await supabase.from('audit_log').insert({
        employee_id:   user!.id,
        employee_name: employee.name,
        action:        'walk_in_created',
        booking_id:    booking.id,
        new_value:     booking,
        notes:         `Walk-in: ${customer_name}, ${game_name}, ${player_count} Spieler, ${payment_method}`,
    })

    // Send confirmation email if the customer provided an address.
    if (customer_email) {
        const paymentLabel =
            payment_method === 'card' ? 'Kartenzahlung (vor Ort)' : 'Barzahlung (vor Ort)'

        sendBookingConfirmation({
            customerName:  customer_name,
            customerEmail: customer_email,
            date,
            time,
            gameName:    game_name,
            duration:    dur,
            playerCount: player_count,
            totalAmount: 0,
            paymentNote: paymentLabel,
        }).catch(err => console.error('Walk-in confirmation email failed:', err))
    }

    return NextResponse.json({ booking: normalizeBooking(booking) })
}
