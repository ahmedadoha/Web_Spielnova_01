'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const router = useRouter()
    
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [msg, setMsg] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Setup a listener, but Supabase automatically persists the session from the URL hash
        supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                console.log('Ready for password recovery')
            }
        })
    }, [supabase.auth])

    async function handleReset(e: React.FormEvent) {
        e.preventDefault()
        
        if (password !== confirmPassword) {
            setError('Passwörter stimmen nicht überein.')
            return
        }

        setLoading(true)
        setError('')
        setMsg('')

        const { error: updateError } = await supabase.auth.updateUser({
            password: password
        })

        setLoading(false)

        if (updateError) {
            setError(updateError.message || 'Fehler beim Zurücksetzen des Passworts.')
        } else {
            setMsg('Passwort erfolgreich aktualisiert! Du wirst weitergeleitet...')
            setTimeout(() => {
                router.push('/admin/dashboard')
            }, 2000)
        }
    }

    return (
        <div className="min-h-screen bg-[#050A14] flex items-center justify-center px-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-16 h-16 mb-3">
                        <Image src="/icon.jpg" alt="Spielnova" fill className="rounded-full object-cover" />
                    </div>
                    <h1 className="text-2xl font-black tracking-widest text-white">
                        SPIEL<span className="text-primary">NOVA</span>
                    </h1>
                </div>

                <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,240,255,0.05)]">
                    <h2 className="text-xl font-bold mb-6 text-center">Neues Passwort festlegen</h2>

                    <form onSubmit={handleReset} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                                Neues Passwort
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-background/60 border border-border rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="Mindestens 6 Zeichen"
                                    minLength={6}
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

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                                Passwort bestätigen
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                className="w-full bg-background/60 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="Passwort wiederholen"
                                minLength={6}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                                {error}
                            </div>
                        )}

                        {msg && (
                            <div className="bg-green-500/10 border border-green-500/30 text-green-300 text-sm rounded-lg px-4 py-3">
                                {msg}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !!msg}
                            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                        >
                            {loading ? 'Wird gespeichert...' : 'Passwort aktualisieren'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
