import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, getAdminSession } from '@/lib/supabase-server'

// GET: list bookings (with optional date filter)
export async function GET(request: NextRequest) {
    const { employee, supabase } = await getAdminSession()
    if (!employee) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let query = supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true })

    if (date) {
        query = query.eq('date', date)
    } else if (from && to) {
        query = query.gte('date', from).lte('date', to)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ bookings: data })
}

// POST: create a walk-in booking
export async function POST(request: NextRequest) {
    const { employee, user, supabase } = await getAdminSession()
    if (!employee) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
        customer_name, customer_email, customer_phone,
        game_name, date, time, duration_minutes,
        player_count, arenas_count, payment_method, staff_notes
    } = body

    const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
            customer_name,
            customer_email: customer_email || null,
            customer_phone: customer_phone || null,
            game_name,
            date,
            time,
            duration_minutes: duration_minutes || 60,
            player_count,
            arenas_count: arenas_count || 1,
            status: 'confirmed',
            payment_method: payment_method || 'cash',
            walk_in: true,
            staff_notes: staff_notes || null,
            total_amount: 0, // walk-ins: cash handled in store
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Write audit log
    await supabase.from('audit_log').insert({
        employee_id: user!.id,
        employee_name: employee.name,
        action: 'walk_in_created',
        booking_id: booking.id,
        new_value: booking,
        notes: `Walk-in: ${customer_name}, ${game_name}, ${player_count} Spieler, ${payment_method}`,
    })

    return NextResponse.json({ booking })
}
