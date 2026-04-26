'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

        if (authError) {
            setError('Falsche E-Mail oder Passwort. Bitte erneut versuchen.')
            setLoading(false)
            return
        }

        // Update last_login
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase.from('employees').update({ last_login: new Date().toISOString() }).eq('id', user.id)
        }

        router.push('/admin/dashboard')
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-[#050A14] flex items-center justify-center px-4">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-16 h-16 mb-3">
                        <Image src="/icon.jpg" alt="Spielnova" fill className="rounded-full object-cover" />
                    </div>
                    <h1 className="text-2xl font-black tracking-widest text-white">
                        SPIEL<span className="text-primary">NOVA</span>
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Mitarbeiter-Login</p>
                </div>

                {/* Card */}
                <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,240,255,0.05)]">
                    <h2 className="text-xl font-bold mb-6 text-center">Anmelden</h2>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                                E-Mail-Adresse
                            </label>
                            <input
                                id="admin-email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                className="w-full bg-background/60 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="mitarbeiter@spielnova.de"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                                Passwort
                            </label>
                            <input
                                id="admin-password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                className="w-full bg-background/60 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                                {error}
                            </div>
                        )}

                        <button
                            id="admin-login-btn"
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                        >
                            {loading ? 'Wird angemeldet...' : 'Anmelden'}
                        </button>
                    </form>

                    <p className="text-xs text-muted-foreground text-center mt-6">
                        Zugang wird von der Geschäftsleitung verwaltet.<br />
                        Bei Problemen bitte den Manager kontaktieren.
                    </p>
                </div>

                <p className="text-center text-xs text-muted-foreground/40 mt-6">
                    Spielnova GmbH · Interner Bereich · Nicht öffentlich
                </p>
            </div>
        </div>
    )
}
