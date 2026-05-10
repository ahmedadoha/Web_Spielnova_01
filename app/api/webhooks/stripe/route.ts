import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { sendBookingConfirmation } from '@/lib/email';
import { GAME_BY_SLUG } from '@/lib/games';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase admin client to bypass RLS for webhook operations
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
        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
        }

        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Retrieve the booking ID from the client_reference_id we set during checkout creation
        const bookingId = session.client_reference_id;

        if (bookingId) {
            console.log(`Payment successful for booking ${bookingId}`);

            // 1. Update the booking status in Supabase using the Admin client
            const { data: bookingData, error: updateError } = await supabaseAdmin
                .from('bookings')
                .update({
                    status: 'confirmed',
                    stripe_session_id: session.id,
                    payment_id: session.payment_intent as string,
                    total_amount: session.amount_total || 0,
                })
                .eq('id', bookingId)
                .select()
                .single();

            if (updateError) {
                console.error(`Failed to update booking ${bookingId} in Supabase:`, updateError);
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
            }

            // 2. Send the confirmation email
            if (bookingData) {
                // Check if the user received the Top Gamer discount by looking at the session amount vs the original
                // We'll just infer it or log it, but the email needs game details.
                // We could just pass isTopGamer as a boolean if we track it, but we can also just look at the line items.
                // For simplicity, we just use the data from the booking table.
                
                // Fetch line items from the session to see if the discount was applied
                let isTopGamer = false;
                try {
                    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
                    // Check if any line item name contains 'Top Gamer'
                    isTopGamer = lineItems.data.some(item => item.description?.includes('Top Gamer Rabatt'));
                } catch (e) {
                    console.error('Could not fetch line items for top gamer check', e);
                }

                // Format time string for email
                const startDate = new Date(bookingData.start_time);
                const endDate = new Date(bookingData.end_time);
                const durationMinutes = (endDate.getTime() - startDate.getTime()) / 60000;
                
                // Format date as DD.MM.YYYY
                const formattedDate = startDate.toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                
                // Format time as HH:mm
                const formattedTime = startDate.toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'UTC' // Since we stored local time naive in UTC
                });

                // Resolve the human-readable game title from the catalog.
                // Falls back to slug then game_mode so the email always has something.
                const gameName =
                    GAME_BY_SLUG[bookingData.game_slug]?.title ||
                    bookingData.game_slug ||
                    bookingData.game_mode

                const emailResult = await sendBookingConfirmation({
                    customerName: bookingData.customer_name,
                    customerEmail: bookingData.customer_email,
                    date: formattedDate,
                    time: formattedTime,
                    gameName,
                    duration: durationMinutes,
                    playerCount: bookingData.player_count,
                    totalAmount: session.amount_total || 0, // In cents
                    isTopGamer: isTopGamer
                });

                if (!emailResult.success) {
                    console.error(`Failed to send email to ${bookingData.customer_email}:`, emailResult.error);
                    // We don't return 500 here because the payment succeeded and DB is updated
                } else {
                    console.log(`Confirmation email sent successfully to ${bookingData.customer_email}`);
                }
            }
        }
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true });
}
