import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const EXPIRY_MINUTES = 30 // matches Stripe Checkout Session lifetime

export async function GET(request: Request) {
    // Verify the request comes from Vercel Cron (or an authorised caller)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate the cutoff: anything older than EXPIRY_MINUTES is stale
    const cutoff = new Date(Date.now() - EXPIRY_MINUTES * 60 * 1000).toISOString()

    // Find all pending_payment bookings created before the cutoff
    const { data: expired, error: fetchError } = await supabaseAdmin
        .from('bookings')
        .select('id')
        .eq('status', 'pending_payment')
        .lt('created_at', cutoff)

    if (fetchError) {
        console.error('Cron: failed to fetch expired bookings:', fetchError)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!expired || expired.length === 0) {
        return NextResponse.json({ cancelled: 0, message: 'No expired bookings found.' })
    }

    const ids = expired.map(b => b.id)

    const { error: updateError } = await supabaseAdmin
        .from('bookings')
        .update({ status: 'cancelled' })
        .in('id', ids)

    if (updateError) {
        console.error('Cron: failed to cancel expired bookings:', updateError)
        return NextResponse.json({ error: 'Failed to cancel bookings' }, { status: 500 })
    }

    console.log(`Cron: cancelled ${ids.length} expired pending_payment booking(s).`)
    return NextResponse.json({ cancelled: ids.length })
}
