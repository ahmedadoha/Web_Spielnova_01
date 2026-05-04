import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
    const { employee, user } = await getAdminSession()
    if (!employee || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const body = await request.json()
        const updates: Record<string, any> = {}

        if (body.update_last_login) {
            updates.last_login = new Date().toISOString()
        }

        if (body.clear_requires_password_change) {
            updates.requires_password_change = false
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ success: true, message: 'No updates provided' })
        }

        // Use service role to bypass RLS constraints for self-updates
        const adminClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { error } = await adminClient
            .from('employees')
            .update(updates)
            .eq('id', user.id)

        if (error) {
            console.error('Error updating self profile:', error)
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('Error in /api/admin/me:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
