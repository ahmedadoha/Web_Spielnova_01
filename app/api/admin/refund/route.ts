import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession, isManager } from '@/lib/supabase-server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
    const { employee, user, supabase } = await getAdminSession()
    if (!employee) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!isManager(employee)) {
        return NextResponse.json(
            { error: 'Nur Manager können Rückerstattungen ausstellen.' },
            { status: 403 }
        )
    }

    const { booking_id, refund_type, amount_cents, reason } = await request.json()

    // Get booking to find Stripe payment intent
    const { data: booking } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', booking_id)
        .single()

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    if (booking.status === 'refunded') {
        return NextResponse.json({ error: 'Diese Buchung wurde bereits erstattet.' }, { status: 400 })
    }
    if (!booking.stripe_session_id) {
        return NextResponse.json({ error: 'No Stripe payment found for this booking. Walk-in cash bookings cannot be refunded here.' }, { status: 400 })
    }

    // Retrieve the Stripe session to get the payment intent
    const session = await stripe.checkout.sessions.retrieve(booking.stripe_session_id)
    if (!session.payment_intent) {
        return NextResponse.json({ error: 'No payment intent found' }, { status: 400 })
    }

    const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent.id

    // Issue refund via Stripe
    const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
        reason: 'requested_by_customer',
    }

    if (refund_type === 'partial' && amount_cents) {
        refundParams.amount = amount_cents
    }

    const refund = await stripe.refunds.create(refundParams)

    // Update booking status
    await supabase.from('bookings').update({ status: 'refunded' }).eq('id', booking_id)

    // Log it
    await supabase.from('audit_log').insert({
        employee_id: user!.id,
        employee_name: employee.name,
        action: 'refund_issued',
        booking_id,
        new_value: { refund_id: refund.id, amount: refund.amount, type: refund_type },
        notes: reason || `${refund_type === 'partial' ? 'Partial' : 'Full'} refund issued`,
    })

    return NextResponse.json({ success: true, refund_id: refund.id, amount: refund.amount })
}
