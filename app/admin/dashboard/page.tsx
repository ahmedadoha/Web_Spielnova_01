'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import BookingTable from '@/components/admin/BookingTable'
import BookingDetailPanel from '@/components/admin/BookingDetailPanel'
import WalkInForm from '@/components/admin/WalkInForm'
import TeamManagement from '@/components/admin/TeamManagement'
import HolidaySettings from '@/components/admin/HolidaySettings'
import { LogOut, Plus, Calendar, Users, Activity, RefreshCw, Key, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminDashboard() {
    type Tab = 'today' | 'all' | 'team' | 'holidays' | 'log'
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const router = useRouter()
    const [employee, setEmployee] = useState<{ name: string; role: string; requires_password_change?: boolean } | null>(null)
    const [bookings, setBookings] = useState<Record<string, unknown>[]>([])
    const [selectedBooking, setSelectedBooking] = useState<Record<string, unknown> | null>(null)
    const [showWalkIn, setShowWalkIn] = useState(false)
    const [showChangePassword, setShowChangePassword] = useState(false)
    const [activeTab, setActiveTab] = useState<Tab>('today')
    const [loading, setLoading] = useState(true)
    const [lastRefresh, setLastRefresh] = useState(new Date())

    const isManager = employee?.role === 'manager'

    const fetchBookings = useCallback(async () => {
        const today = new Date().toISOString().split('T')[0]
        const url = activeTab === 'today'
            ? `/api/admin/bookings?date=${today}`
            : `/api/admin/bookings?from=${today}&to=2030-12-31`

        const res = await fetch(url)
        const data = await res.json()
        if (data.bookings) setBookings(data.bookings)
        setLastRefresh(new Date())
    }, [activeTab])

    useEffect(() => {
        async function init() {
            try {
                console.log('Fetching user...');
                const { data: { user }, error: userError } = await supabase.auth.getUser()
                console.log('User result:', user, userError);
                if (!user) { 
                    setLoadingText('Nicht angemeldet, leite weiter...')
                    console.log('No user, redirecting to /admin');
                    router.push('/admin'); 
                    return;
                }

                console.log('Fetching employee profile for user:', user.id);
                setLoadingText('Lade Mitarbeiterprofil...')
                const { data: emp, error: empError } = await supabase
                    .from('employees')
                    .select('name, role, requires_password_change')
                    .eq('id', user.id)
                    .single()
                
                console.log('Employee result:', emp, empError);

                if (!emp) { 
                    setLoadingText('Kein Profil gefunden, leite weiter...')
                    console.log('No employee profile, redirecting to /admin');
                    router.push('/admin'); 
                    return;
                }
                setEmployee(emp)
                if (emp.requires_password_change) {
                    setShowChangePassword(true)
                }
                setLoading(false)
            } catch (err) {
                console.error('Init error:', err);
                router.push('/admin');
            }
        }
        init()
    }, [router])

    useEffect(() => { if (!loading) fetchBookings() }, [activeTab, loading, fetchBookings])

    // Real-time subscription
    useEffect(() => {
        const channel = supabase
            .channel('bookings-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
                fetchBookings()
            })
            .subscribe()
        return () => { supabase.removeChannel(channel) }
    }, [fetchBookings])

    // 1-hour inactivity auto-logout
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>

        const resetTimer = () => {
            clearTimeout(timer)
            timer = setTimeout(async () => {
                await supabase.auth.signOut()
                router.push('/admin')
            }, 60 * 60 * 1000) // 1 hour
        }

        // Initialize timer
        resetTimer()

        // Setup activity listeners
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
        events.forEach(event => {
            window.addEventListener(event, resetTimer)
        })

        return () => {
            clearTimeout(timer)
            events.forEach(event => {
                window.removeEventListener(event, resetTimer)
            })
        }
    }, [router, supabase])

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/admin')
    }

    const [loadingText, setLoadingText] = useState('Lade Dashboard...')

    const todayCount = bookings.filter(b => b.status !== 'deleted').length
    const confirmedCount = bookings.filter(b => b.status === 'confirmed').length

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050A14] flex flex-col items-center justify-center text-white">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-4" />
                <p className="text-muted-foreground">{loadingText}</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050A14] text-white">
            {/* Header */}
            <header className="border-b border-border/30 bg-card/30 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image src="/icon.jpg" alt="Spielnova" width={32} height={32} className="rounded-full" />
                        <span className="font-black tracking-widest text-sm">
                            SPIEL<span className="text-primary">NOVA</span>
                        </span>
                        <span className="text-muted-foreground text-xs ml-2 hidden sm:block">Admin</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground hidden sm:block">
                            👤 {employee?.name} {isManager && <span className="text-primary text-xs">(Manager)</span>}
                        </span>
                        <button
                            id="admin-walkin-btn"
                            onClick={() => setShowWalkIn(true)}
                            className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary/80 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:block">Walk-in</span>
                        </button>
                        <button onClick={() => setShowChangePassword(true)} title="Passwort ändern" className="text-muted-foreground hover:text-white transition-colors">
                            <Key className="h-5 w-5" />
                        </button>
                        <button onClick={handleLogout} title="Abmelden" className="text-muted-foreground hover:text-white transition-colors">
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Heute / Angezeigt', value: todayCount, icon: Calendar, color: 'text-primary' },
                        { label: 'Bestätigt', value: confirmedCount, icon: Users, color: 'text-green-400' },
                        { label: 'Datum', value: new Date().toLocaleDateString('de-DE'), icon: Calendar, color: 'text-blue-400' },
                        { label: 'Zuletzt aktualisiert', value: lastRefresh.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }), icon: RefreshCw, color: 'text-yellow-400' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-card/40 border border-border/30 rounded-xl p-4">
                            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-card/30 border border-border/30 rounded-xl p-1 mb-6 w-fit">
                    {([
                        { id: 'today', label: 'Heute', icon: Calendar },
                        { id: 'all', label: 'Alle', icon: Users },
                        ...(isManager ? [
                            { id: 'team', label: 'Team', icon: Users }, 
                            { id: 'holidays', label: 'Einstellungen', icon: Calendar },
                            { id: 'log', label: 'Aktivitäten', icon: Activity }
                        ] : []),
                    ] as { id: Tab; label: string; icon: React.ElementType }[]).map(tab => (
                        <button
                            key={tab.id}
                            id={`admin-tab-${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-primary text-primary-foreground shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                                : 'text-muted-foreground hover:text-white'}`}
                        >
                            <tab.icon className="h-3.5 w-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {(activeTab === 'today' || activeTab === 'all') && (
                    <BookingTable
                        bookings={bookings}
                        onSelect={setSelectedBooking}
                        onRefresh={fetchBookings}
                    />
                )}
                {activeTab === 'team' && isManager && <TeamManagement />}
                {activeTab === 'holidays' && isManager && <HolidaySettings />}
                {activeTab === 'log' && isManager && <AuditLog />}
            </main>

            {/* Booking detail panel */}
            {selectedBooking && (
                <BookingDetailPanel
                    booking={selectedBooking}
                    isManager={isManager}
                    onClose={() => setSelectedBooking(null)}
                    onRefresh={() => { fetchBookings(); setSelectedBooking(null) }}
                />
            )}

            {/* Walk-in form */}
            {showWalkIn && (
                <WalkInForm
                    onClose={() => setShowWalkIn(false)}
                    onSuccess={() => { setShowWalkIn(false); fetchBookings() }}
                />
            )}

            {/* Change Password modal */}
            {showChangePassword && (
                <ChangePasswordModal 
                    onClose={() => setShowChangePassword(false)} 
                    force={employee?.requires_password_change}
                />
            )}
        </div>
    )
}

function ChangePasswordModal({ onClose, force = false }: { onClose: () => void, force?: boolean }) {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [msg, setMsg] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError('Passwörter stimmen nicht überein.')
            return
        }
        setLoading(true)
        setError('')
        setMsg('')

        const { error: updateError } = await supabase.auth.updateUser({ password })
        setLoading(false)

        if (updateError) {
            setError(updateError.message || 'Ein Fehler ist aufgetreten.')
        } else {
            setMsg('Passwort erfolgreich geändert!')
            if (force) {
                // Clear the flag securely
                await fetch('/api/admin/me', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clear_requires_password_change: true })
                })
                // Reload the window to fetch fresh employee data
                setTimeout(() => window.location.reload(), 1500)
            } else {
                setTimeout(onClose, 2000)
            }
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-[#050A14] border border-border/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
                <div className="px-6 py-4 border-b border-border/30 flex items-center justify-between">
                    <h3 className="font-bold text-lg">Passwort ändern</h3>
                    {!force && <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">✕</button>}
                </div>
                <div className="p-6">
                    {force && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm rounded-lg px-4 py-3 mb-5">
                            Du verwendest ein temporäres Passwort. Bitte wähle jetzt ein neues, sicheres Passwort, um fortzufahren.
                        </div>
                    )}
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Neues Passwort</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-background/60 border border-border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="Mindestens 6 Zeichen"
                                    minLength={6}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Passwort bestätigen</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                className="w-full bg-background/60 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="Passwort wiederholen"
                                minLength={6}
                            />
                        </div>
                        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-3 py-2">{error}</div>}
                        {msg && <div className="bg-green-500/10 border border-green-500/30 text-green-300 text-sm rounded-lg px-3 py-2">{msg}</div>}
                        
                        <div className="flex justify-end gap-3 pt-4">
                            {!force && (
                                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm border border-border/50 hover:border-border text-muted-foreground hover:text-white transition-colors">
                                    Abbrechen
                                </button>
                            )}
                            <button type="submit" disabled={loading || !!msg} className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                                {loading ? 'Wird gespeichert...' : 'Speichern'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

function AuditLog() {
    const [logs, setLogs] = useState<Record<string, unknown>[]>([])
    useEffect(() => {
        const client = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        client.from('audit_log').select('*').order('created_at', { ascending: false }).limit(100)
            .then(({ data }) => { if (data) setLogs(data) })
    }, [])

    const actionLabels: Record<string, string> = {
        rescheduled: '📅 Umgebucht', cancelled: '❌ Storniert', walk_in_created: '🚶 Walk-in',
        note_added: '📝 Notiz', deleted: '🗑️ Gelöscht', refund_issued: '💰 Rückerstattung',
    }

    return (
        <div className="bg-card/40 border border-border/30 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border/30">
                <h3 className="font-bold">Aktivitätsprotokoll</h3>
                <p className="text-sm text-muted-foreground">Alle Aktionen der letzten 100 Einträge</p>
            </div>
            <div className="divide-y divide-border/20">
                {logs.length === 0 && (
                    <p className="text-muted-foreground text-sm px-6 py-8 text-center">Noch keine Aktivitäten.</p>
                )}
                {logs.map((log) => (
                    <div key={log.id as string} className="px-6 py-3 flex items-start gap-4 hover:bg-white/[0.02] transition-colors">
                        <span className="text-sm font-medium min-w-[160px]">
                            {actionLabels[log.action as string] || log.action as string}
                        </span>
                        <span className="text-sm text-muted-foreground flex-1">{log.notes as string}</span>
                        <div className="text-right text-xs text-muted-foreground">
                            <div className="font-medium text-white/80">{log.employee_name as string}</div>
                            <div>{new Date(log.created_at as string).toLocaleString('de-DE')}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
