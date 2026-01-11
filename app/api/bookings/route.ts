import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            date,
            time,
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
        // Assuming 'date' is YYYY-MM-DD and 'time' is HH:mm
        const startTime = new Date(`${date}T${time}:00`) // Naive local construction
        const endTime = new Date(startTime.getTime() + 30 * 60000) // +30 minutes

        // Check if slot is still free (Double check to avoid race conditions)
        const { data: conflicts } = await supabase
            .from('bookings')
            .select('id')
            .eq('arena_id', arenaId)
            .eq('start_time', startTime.toISOString())

        if (conflicts && conflicts.length > 0) {
            return NextResponse.json({ error: 'Slot already booked' }, { status: 409 })
        }

        // Insert Booking with 'pending_payment' status
        const { data, error } = await supabase
            .from('bookings')
            .insert([
                {
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    arena_id: arenaId,
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
        // Logic: 15 EUR (Weekday) / 20 EUR (Saturday) * Players
        const dayOfWeek = startTime.getDay()
        const pricePerPerson = dayOfWeek === 6 ? 2000 : 1500 // In cents
        const totalAmount = pricePerPerson * playerCount

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'paypal'], // PayPal requires config, keeping simple
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `${gameMode === 'shooter' ? 'VR Shooter' : 'VR Escape Room'} - ${playerCount} Spieler`,
                            description: `Buchung für ${customerName} am ${date} um ${time}`,
                        },
                        unit_amount: totalAmount,
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
