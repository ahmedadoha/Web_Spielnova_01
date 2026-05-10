import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendReminderEmail } from '@/lib/email'

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate tomorrow's date in Europe/Berlin timezone.
    // 'sv-SE' locale produces YYYY-MM-DD which matches the date column format.
    // Intl.DateTimeFormat handles CET/CEST switchover automatically.
    const tomorrowStr = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Europe/Berlin',
    }).format(new Date(Date.now() + 24 * 60 * 60 * 1000))

    // Fetch confirmed bookings for tomorrow that have not yet received a reminder
    const { data: bookings, error: fetchError } = await supabaseAdmin
        .from('bookings')
        .select('id, customer_name, customer_email, game_name, game_slug, date, time, duration_minutes, player_count')
        .eq('date', tomorrowStr)
        .eq('status', 'confirmed')
        .eq('reminder_sent', false)
        .not('customer_email', 'is', null)

    if (fetchError) {
        console.error('Cron send-reminders: fetch error:', fetchError)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!bookings || bookings.length === 0) {
        console.log(`Cron send-reminders: no bookings to remind for ${tomorrowStr}`)
        return NextResponse.json({ sent: 0, failed: 0, date: tomorrowStr })
    }

    let sent = 0
    let failed = 0

    for (const booking of bookings) {
        const result = await sendReminderEmail({
            customerName: booking.customer_name,
            customerEmail: booking.customer_email,
            gameName: booking.game_name || booking.game_slug || '—',
            date: booking.date,
            time: booking.time,
            duration: booking.duration_minutes || 60,
            playerCount: booking.player_count,
        })

        if (result.success) {
            await supabaseAdmin
                .from('bookings')
                .update({ reminder_sent: true })
                .eq('id', booking.id)
            sent++
        } else {
            console.error(`Cron send-reminders: failed for booking ${booking.id}`, result.error)
            failed++
        }
    }

    console.log(`Cron send-reminders: sent=${sent} failed=${failed} date=${tomorrowStr}`)
    return NextResponse.json({ sent, failed, date: tomorrowStr })
}
