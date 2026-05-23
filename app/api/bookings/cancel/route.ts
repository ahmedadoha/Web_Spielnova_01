import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { bookingId } = body

        if (!bookingId) {
            return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })
        }

        // Fetch the booking status to ensure it's still 'pending_payment'
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('status')
            .eq('id', bookingId)
            .single()

        if (fetchError || !booking) {
            console.error(`Cancel API: booking ${bookingId} not found or error:`, fetchError)
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        // Safety check: Only allow cancelling if the status is 'pending_payment'
        if (booking.status !== 'pending_payment') {
            return NextResponse.json({ error: 'Only pending bookings can be cancelled' }, { status: 400 })
        }

        // Update status to 'cancelled' to release the slot
        const { error: updateError } = await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', bookingId)

        if (updateError) {
            console.error(`Cancel API: failed to update booking ${bookingId}:`, updateError)
            return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 })
        }

        console.log(`Cancel API: successfully cancelled abandoned booking ${bookingId}`)
        return NextResponse.json({ success: true, message: 'Booking cancelled successfully' })
    } catch (err: any) {
        console.error('Cancel booking error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
