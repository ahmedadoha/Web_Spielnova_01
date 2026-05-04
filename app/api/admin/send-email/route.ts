import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/supabase-server'
import { sendReminderEmail } from '@/lib/email'

// POST: manually send an email reminder to a customer
export async function POST(request: NextRequest) {
    const { employee, supabase } = await getAdminSession()
    if (!employee) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { booking_id } = await request.json()

    if (!booking_id) {
        return NextResponse.json({ error: 'booking_id is required' }, { status: 400 })
    }

    const { data: booking } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', booking_id)
        .single()

    if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (!booking.customer_email) {
        return NextResponse.json({ error: 'No customer email on file for this booking' }, { status: 400 })
    }

    const bookingDate = booking.date || booking.start_time?.split('T')[0] || '?'
    const bookingTime = booking.time || '?'

    const result = await sendReminderEmail({
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        gameName: booking.game_name || booking.game_slug || booking.game_mode || '—',
        date: bookingDate,
        time: bookingTime,
        duration: booking.duration_minutes || 60,
        playerCount: booking.player_count,
    })

    if (!result.success) {
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
