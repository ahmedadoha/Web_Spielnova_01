import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

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

        // Accept the session as valid if the card was either already charged
        // ('paid') or authorised and waiting for capture ('requires_capture').
        // In both cases the webhook handles the DB update; we just return the
        // booking data for the success page to display.
        const pi = session.payment_intent as { status: string } | null
        const isAuthorised =
            session.payment_status === 'paid' ||
            pi?.status === 'requires_capture'

        if (!isAuthorised) {
            return NextResponse.json({ success: false, status: session.payment_status })
        }

        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single()

        if (error) {
            console.error('Confirm route DB error', error)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        return NextResponse.json({ success: true, booking: data })

    } catch (err: any) {
        console.error('Verification Error', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
