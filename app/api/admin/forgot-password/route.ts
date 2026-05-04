import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email } = body

        if (!email) {
            return NextResponse.json({ error: 'E-Mail ist erforderlich.' }, { status: 400 })
        }

        // Use service role to bypass RLS and interact with auth admin API
        const adminClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 1. Find user by email from auth.users (listUsers works for small teams)
        const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers()
        if (usersError) {
            console.error('Error fetching users:', usersError)
            return NextResponse.json({ error: 'Interner Serverfehler.' }, { status: 500 })
        }

        const user = usersData.users.find(u => u.email === email)

        if (!user) {
            // Return success anyway to prevent email enumeration, but with a generic message
            return NextResponse.json({ 
                status: 'not_found', 
                message: 'Falls diese E-Mail existiert, haben wir weitere Anweisungen gesendet.' 
            })
        }

        // 2. Look up the employee's role
        const { data: employee, error: empError } = await adminClient
            .from('employees')
            .select('role')
            .eq('id', user.id)
            .single()

        if (empError || !employee) {
            return NextResponse.json({ error: 'Mitarbeiterprofil nicht gefunden.' }, { status: 500 })
        }

        // 3. Handle based on role
        if (employee.role === 'worker') {
            return NextResponse.json({ 
                status: 'worker', 
                message: 'Bitte kontaktiere deinen Manager, um dein Passwort zurückzusetzen.' 
            })
        }

        if (employee.role === 'manager') {
            // Trigger Supabase forgot password flow
            const { error: resetError } = await adminClient.auth.resetPasswordForEmail(email, {
                redirectTo: `${request.headers.get('origin')}/admin/reset-password`,
            })

            if (resetError) {
                console.error('Error sending reset email:', resetError)
                return NextResponse.json({ error: 'Fehler beim Senden der E-Mail.' }, { status: 500 })
            }

            return NextResponse.json({ 
                status: 'manager', 
                message: 'Ein Link zum Zurücksetzen deines Passworts wurde an deine E-Mail gesendet.' 
            })
        }

        return NextResponse.json({ error: 'Unbekannte Rolle' }, { status: 400 })

    } catch (err) {
        console.error('Forgot password error:', err)
        return NextResponse.json({ error: 'Interner Serverfehler.' }, { status: 500 })
    }
}
