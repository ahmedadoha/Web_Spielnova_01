import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession, isManager } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
    const { employee, supabase } = await getAdminSession()
    if (!employee) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: holidays, error } = await supabase
        .from('holidays')
        .select('*')
        .order('start_date', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ holidays })
}

export async function POST(request: NextRequest) {
    const { employee, user, supabase } = await getAdminSession()
    if (!employee) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!isManager(employee)) return NextResponse.json({ error: 'Manager only' }, { status: 403 })

    const { action, id, name, type, start_date, end_date } = await request.json()

    if (action === 'create') {
        const { error } = await supabase
            .from('holidays')
            .insert({ name, type: type || 'school', start_date, end_date })

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        
        // Log it
        await supabase.from('audit_log').insert({
            employee_id: user!.id,
            employee_name: employee.name,
            action: 'holiday_created',
            notes: `Added holiday: ${name} (${start_date} to ${end_date})`
        })

        return NextResponse.json({ success: true, message: 'Ferien hinzugefügt' })
    }

    if (action === 'delete') {
        const { error } = await supabase
            .from('holidays')
            .delete()
            .eq('id', id)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        // Log it
        await supabase.from('audit_log').insert({
            employee_id: user!.id,
            employee_name: employee.name,
            action: 'holiday_deleted',
            notes: `Deleted holiday ID: ${id}`
        })

        return NextResponse.json({ success: true, message: 'Ferien gelöscht' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
