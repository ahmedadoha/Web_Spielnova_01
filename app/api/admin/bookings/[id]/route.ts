import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession, isManager } from '@/lib/supabase-server'
import { sendRescheduleConfirmation } from '@/lib/email'

// PATCH: update booking (reschedule, cancel, add note)
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
        updates.date = date
        updates.time = time
        auditAction = 'rescheduled'
        auditNotes = `Moved from ${oldBooking.date} ${oldBooking.time} → ${date} ${time}`

        // Auto-send reschedule email to customer
        if (oldBooking.customer_email) {
            await sendRescheduleConfirmation({
                customerName: oldBooking.customer_name,
                customerEmail: oldBooking.customer_email,
                gameName: oldBooking.game_name,
                oldDate: oldBooking.date,
                oldTime: oldBooking.time,
                newDate: date,
                newTime: time,
                employeeName: employee.name,
            })
        }
    }

    if (action === 'cancel' || status === 'cancelled') {
        updates.status = 'cancelled'
        auditAction = 'cancelled'
        auditNotes = `Cancelled by ${employee.name}`
    }

    if (staff_notes !== undefined) {
        updates.staff_notes = staff_notes
        auditAction = 'note_added'
        auditNotes = staff_notes
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
    if (!isManager(employee)) return NextResponse.json({ error: 'Manager only' }, { status: 403 })

    const { data: booking } = await supabase.from('bookings').select('*').eq('id', id).single()

    const { error } = await supabase.from('bookings').update({ status: 'deleted' }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await supabase.from('audit_log').insert({
        employee_id: user!.id,
        employee_name: employee.name,
        action: 'deleted',
        booking_id: id,
        old_value: booking,
        notes: 'Soft-deleted by manager. Can be restored via audit log.',
    })

    return NextResponse.json({ success: true })
}
