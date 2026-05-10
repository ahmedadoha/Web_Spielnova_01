import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { TOP_GAMER_DISCOUNT_PERCENT } from '@/lib/constants'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            date,
            time,
            duration,
            arenaId,
            gameMode,
            gameSlug,
            playerCount,
            customerName,
            customerEmail
        } = body

        // Basic Validation
        if (!date || !time || !arenaId || !customerName || !customerEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Construct timestamp
        const startTime = new Date(`${date}T${time}:00`)
        const bookingDuration = duration || 60
        const endTime = new Date(startTime.getTime() + bookingDuration * 60000)

        // Calculate arenas needed
        const arenasCount = playerCount > 4 ? 2 : 1

        // Atomically check availability and insert in a single DB transaction.
        // pg_advisory_xact_lock inside the function serialises concurrent requests
        // for the same time slot — prevents double-booking race conditions.
        const { data: rpcResult, error: rpcError } = await supabase.rpc(
            'create_booking_if_available',
            {
                p_start_time:     startTime.toISOString(),
                p_end_time:       endTime.toISOString(),
                p_arena_id:       arenaId,
                p_arenas_count:   arenasCount,
                p_game_mode:      gameMode,
                p_game_slug:      gameSlug,
                p_player_count:   playerCount,
                p_customer_name:  customerName,
                p_customer_email: customerEmail,
            }
        )

        if (rpcError) {
            console.error('Booking RPC error:', rpcError)
            return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
        }

        if (rpcResult?.error === 'slot_unavailable') {
            return NextResponse.json({ error: 'This time slot is no longer available.' }, { status: 409 })
        }

        const bookingId = rpcResult?.booking_id
        if (!bookingId) {
            return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
        }


        // Import stripe dynamically to avoid issues if init fails
        const { stripe } = await import('@/lib/stripe')

        // Calculate Price
        const dayOfWeek = startTime.getDay()
        const isWeekend = [0, 5, 6].includes(dayOfWeek) // Sun, Fri, Sat
        
        let singlePrice = 0
        let teamPrice = 0
        if (bookingDuration === 30) {
            singlePrice = isWeekend ? 1990 : 1490
            teamPrice = isWeekend ? 7400 : 5500
        } else {
            singlePrice = isWeekend ? 3490 : 2490
            teamPrice = isWeekend ? 12400 : 9000
        }

        const teamCount = Math.floor(playerCount / 4)
        const singleCount = playerCount % 4
        
        const totalAmount = (teamCount * teamPrice) + (singleCount * singlePrice)

        // Loyalty Logic: Top Gamer Rabatt
        let finalAmount = totalAmount;
        let isTopGamer = false;

        if (gameMode === 'shooter' || gameMode === 'escape') {
            const thirtyDaysAgo = new Date(startTime.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const startOfBookingDay = new Date(`${date}T00:00:00`).toISOString(); // Must not be the same day

            const { data: pastBookings } = await supabase
                .from('bookings')
                .select('id')
                .eq('customer_email', customerEmail)
                .eq('status', 'confirmed')
                .gte('start_time', thirtyDaysAgo)
                .lt('start_time', startOfBookingDay)
                .limit(1);

            if (pastBookings && pastBookings.length > 0) {
                isTopGamer = true;
                finalAmount = Math.round(totalAmount * (1 - TOP_GAMER_DISCOUNT_PERCENT));
            }
        }

        // Create Stripe Checkout Session
        // expires_at: 15 minutes from now — after this Stripe refuses payment and
        // redirects the customer to cancel_url so our cron job can free the slot cleanly.
        const sessionExpiresAt = Math.floor(Date.now() / 1000) + 15 * 60

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'paypal'], // PayPal requires config, keeping simple
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `${gameMode === 'shooter' ? 'VR Shooter' : 'VR Escape Room'} (${bookingDuration} Min) - ${playerCount} Spieler ${isTopGamer ? `(Inkl. ${TOP_GAMER_DISCOUNT_PERCENT * 100}% Top Gamer Rabatt)` : ''}`,
                            description: `Buchung für ${customerName} am ${date} um ${time}`,
                        },
                        unit_amount: finalAmount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            expires_at: sessionExpiresAt,
            success_url: `${request.headers.get('origin')}/buchen/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.headers.get('origin')}/buchen?session_expired=1`,
            client_reference_id: bookingId,
            customer_email: customerEmail,
        })

        // Return the checkout URL
        return NextResponse.json({ success: true, url: session.url })

    } catch (err) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
