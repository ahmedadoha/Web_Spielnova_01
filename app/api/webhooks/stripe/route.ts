import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { sendBookingConfirmation, sendSlotTakenEmail } from '@/lib/email';
import { GAME_BY_SLUG } from '@/lib/games';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'No stripe-signature header' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId       = session.client_reference_id;
        const paymentIntentId = session.payment_intent as string;

        if (!bookingId || !paymentIntentId) {
            console.error('Webhook: missing bookingId or paymentIntentId', { bookingId, paymentIntentId });
            return NextResponse.json({ received: true });
        }

        // Load the booking so we know its time slot.
        const { data: booking, error: fetchError } = await supabaseAdmin
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (fetchError || !booking) {
            console.error(`Webhook: booking ${bookingId} not found — voiding payment`);
            await stripe.paymentIntents.cancel(paymentIntentId).catch(console.error);
            return NextResponse.json({ received: true });
        }

        // ── Slot conflict check ───────────────────────────────────────────────
        // Verify no other confirmed booking already occupies the same slot.
        // This is the safety net for the edge case where the Stripe session was
        // still alive (within 32 min) while a second customer also completed
        // checkout for the same time window.
        const { data: conflict } = await supabaseAdmin
            .from('bookings')
            .select('id')
            .eq('status', 'confirmed')
            .neq('id', bookingId)
            .lt('start_time', booking.end_time)
            .gt('end_time', booking.start_time)
            .limit(1);

        if (conflict && conflict.length > 0) {
            // Slot taken — void the card authorisation. Nothing is charged.
            console.log(`Webhook: slot conflict for booking ${bookingId} — voiding PaymentIntent ${paymentIntentId}`);
            await stripe.paymentIntents.cancel(paymentIntentId).catch(console.error);
            await supabaseAdmin.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);

            if (booking.customer_email) {
                const startDate = new Date(booking.start_time);
                sendSlotTakenEmail({
                    customerName:  booking.customer_name,
                    customerEmail: booking.customer_email,
                    date: startDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                    time: startDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
                }).catch(console.error);
            }
            return NextResponse.json({ received: true });
        }

        // ── Capture ───────────────────────────────────────────────────────────
        // Slot is free — charge the card now.
        try {
            await stripe.paymentIntents.capture(paymentIntentId);
        } catch (captureErr: any) {
            console.error(`Webhook: capture failed for ${paymentIntentId}:`, captureErr.message);
            return NextResponse.json({ error: 'Capture failed' }, { status: 500 });
        }

        // Mark booking confirmed.
        const { data: bookingData, error: updateError } = await supabaseAdmin
            .from('bookings')
            .update({
                status:           'confirmed',
                stripe_session_id: session.id,
                payment_id:        paymentIntentId,
                total_amount:      session.amount_total || 0,
            })
            .eq('id', bookingId)
            .select()
            .single();

        if (updateError) {
            console.error(`Webhook: failed to confirm booking ${bookingId}:`, updateError);
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        // Send confirmation email.
        if (bookingData?.customer_email) {
            let isTopGamer = false;
            try {
                const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
                isTopGamer = lineItems.data.some(item => item.description?.includes('Top Gamer Rabatt'));
            } catch (e) {
                console.error('Could not fetch line items for top gamer check', e);
            }

            const startDate = new Date(bookingData.start_time);
            const endDate   = new Date(bookingData.end_time);
            const gameName  =
                GAME_BY_SLUG[bookingData.game_slug]?.title ||
                bookingData.game_slug ||
                bookingData.game_mode;

            const emailResult = await sendBookingConfirmation({
                customerName:  bookingData.customer_name,
                customerEmail: bookingData.customer_email,
                date:          startDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                time:          startDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
                gameName,
                duration:      (endDate.getTime() - startDate.getTime()) / 60000,
                playerCount:   bookingData.player_count,
                totalAmount:   session.amount_total || 0,
                isTopGamer,
            });

            if (!emailResult.success) {
                console.error(`Webhook: confirmation email failed for ${bookingData.customer_email}:`, emailResult.error);
            } else {
                console.log(`Webhook: confirmation email sent to ${bookingData.customer_email}`);
            }
        }
    }

    return NextResponse.json({ received: true });
}
