import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
        return NextResponse.json({ error: 'Session ID missing' }, { status: 400 })
    }

    try {
        // Import stripe dynamically
        const { stripe } = await import('@/lib/stripe')

        // 1. Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // 2. Check payment status
        if (session.payment_status === 'paid') {
            const bookingId = session.client_reference_id;

            if (!bookingId) {
                return NextResponse.json({ error: 'No Booking ID on session' }, { status: 400 })
            }

            // 3. Update Supabase Booking to 'confirmed'
            // Ideally we check if it is already confirmed to avoid redundant writes

            const { data, error } = await supabase
                .from('bookings')
                .update({ status: 'confirmed', payment_id: session.payment_intent as string })
                .eq('id', bookingId)
                .select()

            if (error) {
                console.error("Db Error", error)
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
            }

            return NextResponse.json({ success: true, booking: data[0] })
        } else {
            return NextResponse.json({ success: false, status: session.payment_status })
        }

    } catch (err: any) {
        console.error("Verification Error", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
