'use client'

import { useState, Suspense } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'

// useSearchParams must live in its own component wrapped by <Suspense>
function TimeoutBanner() {
    const searchParams = useSearchParams()
    if (searchParams.get('timeout') !== '1') return null
    return (
        <div className="mb-5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm rounded-lg px-4 py-3 text-center">
            🔒 Deine Sitzung ist nach 7 Stunden Inaktivität abgelaufen.<br />
            Bitte melde dich erneut an.
        </div>
    )
}

export default function AdminLoginPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [view, setView] = useState<'login' | 'forgot'>('login')
    const [error, setError] = useState('')
    const [msg, setMsg] = useState('')
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

        // Securely update last_login bypassing RLS
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await fetch('/api/admin/me', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ update_last_login: true })
            })
        }

        router.push('/admin/dashboard')
        router.refresh()
    }

    async function handleForgotPassword(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMsg('')

        try {
            const res = await fetch('/api/admin/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Ein Fehler ist aufgetreten.')
            } else {
                setMsg(data.message)
            }
        } catch (err) {
            setError('Netzwerkfehler. Bitte versuche es später erneut.')
        } finally {
            setLoading(false)
        }
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
                    <h2 className="text-xl font-bold mb-6 text-center">
                        {view === 'login' ? 'Anmelden' : 'Passwort vergessen'}
                    </h2>

                    <Suspense fallback={null}>
                        <TimeoutBanner />
                    </Suspense>

                    {view === 'login' ? (
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
                                <div className="flex justify-between mb-1.5">
                                    <label className="block text-sm font-medium text-muted-foreground">
                                        Passwort
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => { setView('forgot'); setError(''); setMsg(''); }}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Vergessen?
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        id="admin-password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                        className="w-full bg-background/60 border border-border rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
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
                    ) : (
                        <form onSubmit={handleForgotPassword} className="space-y-5">
                            <p className="text-sm text-muted-foreground mb-4">
                                Gib deine E-Mail-Adresse ein. Wenn du ein Manager bist, senden wir dir einen Link zum Zurücksetzen.
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                                    E-Mail-Adresse
                                </label>
                                <input
                                    id="forgot-email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    className="w-full bg-background/60 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="mitarbeiter@spielnova.de"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                                    {error}
                                </div>
                            )}

                            {msg && (
                                <div className={`border text-sm rounded-lg px-4 py-3 ${msg.includes('Manager') ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' : 'bg-green-500/10 border-green-500/30 text-green-300'}`}>
                                    {msg}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                            >
                                {loading ? 'Wird gesendet...' : 'Senden'}
                            </button>

                            <button
                                type="button"
                                onClick={() => { setView('login'); setError(''); setMsg(''); }}
                                className="w-full text-sm text-muted-foreground hover:text-white transition-colors"
                            >
                                Zurück zur Anmeldung
                            </button>
                        </form>
                    )}

                    {view === 'login' && (
                        <p className="text-xs text-muted-foreground text-center mt-6">
                            Zugang wird von der Geschäftsleitung verwaltet.<br />
                            Bei Problemen bitte den Manager kontaktieren.
                        </p>
                    )}
                </div>

                <p className="text-center text-xs text-muted-foreground/40 mt-6">
                    Spielnova GmbH · Interner Bereich · Nicht öffentlich
                </p>
            </div>
        </div>
    )
}
