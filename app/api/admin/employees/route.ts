import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession, isManager } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

// GET: list all employees (manager only)
export async function GET() {
    const { employee, supabase } = await getAdminSession()
    if (!employee) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!isManager(employee)) return NextResponse.json({ error: 'Manager only' }, { status: 403 })

    const { data, error } = await supabase
        .from('employees')
        .select('id, name, role, is_active, created_at, last_login')
        .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ employees: data })
}

// POST: add new employee or update/disable (manager only)
export async function POST(request: NextRequest) {
    const { employee, supabase } = await getAdminSession()
    if (!employee) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!isManager(employee)) return NextResponse.json({ error: 'Manager only' }, { status: 403 })

    const { action, employee_id, name, email, role, temp_password, is_active } = await request.json()

    // Use service role client for auth operations (needs SUPABASE_SERVICE_ROLE_KEY)
    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (action === 'create') {
        const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
            email,
            password: temp_password,
            email_confirm: true,
        })
        if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

        const { error: profileError } = await adminClient.from('employees').insert({
            id: authUser.user.id,
            name,
            role: role || 'worker',
            is_active: true,
        })
        if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

        return NextResponse.json({ success: true, message: `Employee ${name} created.` })
    }

    if (action === 'toggle_active' && employee_id) {
        const { error } = await adminClient
            .from('employees')
            .update({ is_active: is_active })
            .eq('id', employee_id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ success: true })
    }

    if (action === 'reset_password' && employee_id && temp_password) {
        const { error } = await adminClient.auth.admin.updateUserById(employee_id, {
            password: temp_password,
        })
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ success: true })
    }

    if (action === 'delete' && employee_id) {
        await adminClient.auth.admin.deleteUser(employee_id)
        return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
