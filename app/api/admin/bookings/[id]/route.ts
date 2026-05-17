import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession, isManager } from '@/lib/supabase-server'
import { sendRescheduleConfirmation, sendReminderEmail } from '@/lib/email'

// PATCH: update booking (reschedule, cancel, add note, send reminder)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const { employee, user, supabase } = await getAdminSession()
    if (!employee) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { action, date, time, status, staff_notes } = body

    // Fetch current booking for audit trail
    const { data: oldBooking } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single()

    if (!oldBooking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    const updates: Record<string, unknown> = {}
    let auditAction = action || 'updated'
    let auditNotes = ''

    if (action === 'reschedule' && date && time) {
        // ── Guard: no Sundays ────────────────────────────────────────────────
        // Use noon local time to avoid UTC-offset day-shift edge cases.
        const dayOfWeek = new Date(`${date}T12:00:00`).getDay()
        if (dayOfWeek === 0) {
            return NextResponse.json(
                { error: 'Sonntage sind geschlossen — Umbuchung nicht möglich.' },
                { status: 400 }
            )
        }

        // ── Guard: no public holidays ────────────────────────────────────────
        const { data: publicHolidays } = await supabase
            .from('holidays')
            .select('name')
            .eq('type', 'public')
            .lte('start_date', date)
            .gte('end_date', date)

        if (publicHolidays && publicHolidays.length > 0) {
            const holidayName = publicHolidays[0].name
            return NextResponse.json(
                { error: `„${holidayName}" ist ein gesetzlicher Feiertag — Umbuchung nicht möglich.` },
                { status: 400 }
            )
        }

        // Update both the flat date/time columns AND the legacy start_time/end_time
        const duration = (oldBooking.duration_minutes as number) || 60
        const startTime = new Date(`${date}T${time}:00`)
        const endTime = new Date(startTime.getTime() + duration * 60000)

        updates.date = date
        updates.time = time
        updates.start_time = startTime.toISOString()
        updates.end_time = endTime.toISOString()

        // Derive old date/time for audit note
        const oldDate = oldBooking.date || oldBooking.start_time?.split('T')[0] || '?'
        const oldTime = oldBooking.time || '?'
        auditAction = 'rescheduled'
        auditNotes = `Moved from ${oldDate} ${oldTime} → ${date} ${time}`

        // Auto-send reschedule email to customer
        if (oldBooking.customer_email) {
            await sendRescheduleConfirmation({
                customerName: oldBooking.customer_name,
                customerEmail: oldBooking.customer_email,
                gameName: oldBooking.game_name || oldBooking.game_slug || oldBooking.game_mode || '—',
                oldDate: oldDate,
                oldTime: oldTime,
                newDate: date,
                newTime: time,
                employeeName: employee.name,
            })
        }
    }

    if (action === 'cancel' || status === 'cancelled') {
        // Cancelling a confirmed/paid booking is a manager-only action
        const paidStatuses = ['confirmed', 'completed']
        if (paidStatuses.includes(oldBooking.status) && !isManager(employee)) {
            return NextResponse.json(
                { error: 'Nur Manager können bestätigte Buchungen stornieren.' },
                { status: 403 }
            )
        }
        updates.status = 'cancelled'
        auditAction = 'cancelled'
        auditNotes = `Cancelled by ${employee.name}`
    }

    if (action === 'note' || (staff_notes !== undefined && action !== 'reschedule' && action !== 'cancel')) {
        updates.staff_notes = staff_notes
        auditAction = 'note_added'
        auditNotes = staff_notes
    }

    if (action === 'send_reminder') {
        // Don't update the booking, just send an email
        if (!oldBooking.customer_email) {
            return NextResponse.json({ error: 'No customer email on file' }, { status: 400 })
        }

        const bookingDate = oldBooking.date || oldBooking.start_time?.split('T')[0] || '?'
        const bookingTime = oldBooking.time || '?'

        await sendReminderEmail({
            customerName: oldBooking.customer_name,
            customerEmail: oldBooking.customer_email,
            gameName: oldBooking.game_name || oldBooking.game_slug || oldBooking.game_mode || '—',
            date: bookingDate,
            time: bookingTime,
            duration: oldBooking.duration_minutes || 60,
            playerCount: oldBooking.player_count,
        })

        // Mark the booking so the nightly cron skips it
        await supabase.from('bookings').update({ reminder_sent: true }).eq('id', id)

        // Log the action
        await supabase.from('audit_log').insert({
            employee_id: user!.id,
            employee_name: employee.name,
            action: 'reminder_sent',
            booking_id: id,
            notes: `Reminder email sent to ${oldBooking.customer_email}`,
        })

        return NextResponse.json({ success: true, message: 'Reminder sent' })
    }

    // Apply updates (if any)
    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: 'No valid action or fields to update' }, { status: 400 })
    }

    const { data: updatedBooking, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Write audit log
    await supabase.from('audit_log').insert({
        employee_id: user!.id,
        employee_name: employee.name,
        action: auditAction,
        booking_id: id,
        old_value: oldBooking,
        new_value: updatedBooking,
        notes: auditNotes,
    })

    return NextResponse.json({ booking: updatedBooking })
}

// DELETE: soft-delete (manager only) — preserves audit trail
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const { employee, user, supabase } = await getAdminSession()
    if (!employee) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!isManager(employee)) {
        return NextResponse.json(
            { error: 'Nur Manager können Buchungen löschen.' },
            { status: 403 }
        )
    }

    const { data: booking } = await supabase.from('bookings').select('*').eq('id', id).single()

    const { error } = await supabase.from('bookings').update({ status: 'deleted' }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await supabase.from('audit_log').insert({
        employee_id: user!.id,
        employee_name: employee.name,
        action: 'deleted',
        booking_id: id,
        old_value: booking,
        notes: 'Soft-deleted by staff. Can be restored via audit log.',
    })

    return NextResponse.json({ success: true })
}
