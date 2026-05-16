import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { GAME_BY_SLUG } from '@/lib/games'

export const dynamic = 'force-dynamic'

// Enrich the raw DB booking row with derived display fields that the
// success page expects but that are not stored as separate columns.
function formatBooking(booking: Record<string, unknown>) {
    const startDate = new Date(booking.start_time as string)
    const endDate   = new Date(booking.end_time   as string)
    return {
        ...booking,
        // "YYYY-MM-DD" — success page feeds this into new Date() with timeZone:'UTC'
        date:             startDate.toISOString().split('T')[0],
        // "HH:MM" — stored as local time naive-UTC
        time:             startDate.toISOString().slice(11, 16),
        duration_minutes: Math.round((endDate.getTime() - startDate.getTime()) / 60000),
        game_name:        GAME_BY_SLUG[booking.game_slug as string]?.title
                            || booking.game_slug
                            || booking.game_mode,
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
        return NextResponse.json({ error: 'Session ID missing' }, { status: 400 })
    }

    try {
        const { stripe } = await import('@/lib/stripe')

        // Retrieve the session and expand the payment_intent so we can inspect
        // its status when capture_method is 'manual'.
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent'],
        })

        const bookingId = session.client_reference_id
        if (!bookingId) {
            return NextResponse.json({ error: 'No Booking ID on session' }, { status: 400 })
        }

        const pi = session.payment_intent as { status: string } | null

        // PaymentIntent voided by our webhook — the slot was taken by someone
        // else and the card was never charged.
        if (pi?.status === 'canceled') {
            return NextResponse.json({ success: false, slotTaken: true })
        }

        // Session not authorised (customer didn't complete checkout).
        const isAuthorised =
            session.payment_status === 'paid' ||
            pi?.status === 'requires_capture'

        if (!isAuthorised) {
            return NextResponse.json({ success: false, status: session.payment_status })
        }

        // Session is authorised — read the current booking status from the DB.
        // The webhook updates it asynchronously, so we may need to poll.
        const { data: booking, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single()

        if (error) {
            console.error('Confirm route DB error', error)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        // Webhook already ran and confirmed the booking.
        if (booking?.status === 'confirmed') {
            return NextResponse.json({ success: true, booking: formatBooking(booking) })
        }

        // Webhook already ran and cancelled it (slot conflict — belt-and-braces).
        if (booking?.status === 'cancelled') {
            return NextResponse.json({ success: false, slotTaken: true })
        }

        // Booking is still pending_payment — webhook hasn't processed yet.
        // Tell the client to retry in a moment.
        return NextResponse.json({ success: true, booking: formatBooking(booking), processing: true })

    } catch (err: any) {
        console.error('Verification Error', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
