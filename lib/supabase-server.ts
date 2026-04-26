import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Called from Server Component — can be ignored
                    }
                },
            },
        }
    )
}

export async function getAdminSession() {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return { user: null, employee: null, supabase }

    const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('id', user.id)
        .eq('is_active', true)
        .single()

    return { user, employee, supabase }
}

export function isManager(employee: { role: string } | null) {
    return employee?.role === 'manager'
}
