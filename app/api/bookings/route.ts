import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { TOP_GAMER_DISCOUNT_PERCENT } from '@/lib/constants'
import { checkSlotAvailability } from '@/lib/availability'

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

        // Check if slot is strictly valid and free
        const isAvailable = await checkSlotAvailability(date, time, bookingDuration, arenasCount)
        
        if (!isAvailable) {
            return NextResponse.json({ error: 'This time slot is no longer available.' }, { status: 409 })
        }

        // Insert Booking with 'pending_payment' status
        const { data, error } = await supabase
            .from('bookings')
            .insert([
                {
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    arena_id: arenaId, // keeping for legacy reasons, but arenas_count handles logic now
                    arenas_count: arenasCount, // Add explicit arenas_count
                    game_mode: gameMode,
                    game_slug: gameSlug,
                    player_count: playerCount,
                    customer_name: customerName,
                    customer_email: customerEmail,
                    status: 'pending_payment',
                }
            ])
            .select()

        if (error) {
            console.error('Supabase Error:', error)
            return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
        }

        const bookingId = data[0].id

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
            success_url: `${request.headers.get('origin')}/buchen/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.headers.get('origin')}/buchen?error=cancelled`,
            client_reference_id: bookingId,
            customer_email: customerEmail,
        })

        // Return the checkout URL
        return NextResponse.json({ success: true, url: session.url })

    } catch (err) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
