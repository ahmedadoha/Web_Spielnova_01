import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SEVEN_HOURS_MS = 7 * 60 * 60 * 1000  // 7 hours in milliseconds
const ACTIVITY_COOKIE = 'sn_admin_activity' // httpOnly — not readable by client JS

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const isDashboard = pathname.startsWith('/admin/dashboard')
    const isLoginPage = pathname === '/admin'

    let response = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Verify the session server-side — not just a local cookie check
    const { data: { user } } = await supabase.auth.getUser()

    // -------------------------------------------------------------------------
    // Protect /admin/dashboard and all sub-paths
    // -------------------------------------------------------------------------
    if (isDashboard) {
        // 1. No active session → go to login
        if (!user) {
            return NextResponse.redirect(new URL('/admin', request.url))
        }

        // 2. Check 7-hour inactivity timeout
        const now = Date.now()
        const lastActivityRaw = request.cookies.get(ACTIVITY_COOKIE)?.value

        // Belt-and-braces: if the user just signed in (within the last 5 min),
        // skip the inactivity check entirely — they're definitely not idle.
        // This also handles the edge case where cookie deletion is delayed.
        const FIVE_MIN_MS = 5 * 60 * 1000
        const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : 0
        const justLoggedIn = now - lastSignIn < FIVE_MIN_MS

        if (!justLoggedIn && lastActivityRaw) {
            const lastActivity = parseInt(lastActivityRaw, 10)

            if (!isNaN(lastActivity) && now - lastActivity > SEVEN_HOURS_MS) {
                // More than 7 hours since last activity — force logout
                const redirect = NextResponse.redirect(
                    new URL('/admin?timeout=1', request.url)
                )
                // Delete the activity cookie using the SAME path it was set with.
                // cookies.delete() defaults to path:'/' which would leave the
                // path:'/admin' cookie intact, causing the timeout loop on the
                // next login attempt.
                redirect.cookies.set(ACTIVITY_COOKIE, '', {
                    path:     '/admin',
                    maxAge:   0,
                    httpOnly: true,
                    secure:   process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                })
                // Clear Supabase session cookies (set at path '/')
                request.cookies.getAll().forEach(cookie => {
                    if (cookie.name.startsWith('sb-')) {
                        redirect.cookies.set(cookie.name, '', { maxAge: 0, path: '/' })
                    }
                })
                return redirect
            }
        }

        // 3. Session is valid — refresh the activity timestamp on every request
        response.cookies.set(ACTIVITY_COOKIE, String(now), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/admin',
            maxAge: 60 * 60 * 24, // Keep cookie for 24 h; the 7-hour check above enforces timeout
        })

        return response
    }

    // -------------------------------------------------------------------------
    // /admin login page — skip it when the user is already logged in and fresh
    // -------------------------------------------------------------------------
    if (isLoginPage && user) {
        const lastActivityRaw = request.cookies.get(ACTIVITY_COOKIE)?.value
        if (lastActivityRaw) {
            const lastActivity = parseInt(lastActivityRaw, 10)
            if (!isNaN(lastActivity) && Date.now() - lastActivity <= SEVEN_HOURS_MS) {
                // Active session, not timed out → go straight to dashboard
                return NextResponse.redirect(new URL('/admin/dashboard', request.url))
            }
        }
        // No activity cookie or timed out → show the login form
    }

    return response
}

export const config = {
    matcher: ['/admin', '/admin/dashboard', '/admin/dashboard/:path*'],
}
