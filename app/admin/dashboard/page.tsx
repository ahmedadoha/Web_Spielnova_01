'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import BookingTable from '@/components/admin/BookingTable'
import BookingDetailPanel from '@/components/admin/BookingDetailPanel'
import WalkInForm from '@/components/admin/WalkInForm'
import TeamManagement from '@/components/admin/TeamManagement'
import { LogOut, Plus, Calendar, Users, Activity, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Tab = 'today' | 'all' | 'team' | 'log'

export default function AdminDashboard() {
    const router = useRouter()
    const [employee, setEmployee] = useState<{ name: string; role: string } | null>(null)
    const [bookings, setBookings] = useState<Record<string, unknown>[]>([])
    const [selectedBooking, setSelectedBooking] = useState<Record<string, unknown> | null>(null)
    const [showWalkIn, setShowWalkIn] = useState(false)
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
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/admin'); return }

            const { data: emp } = await supabase
                .from('employees')
                .select('name, role')
                .eq('id', user.id)
                .single()

            if (!emp) { router.push('/admin'); return }
            setEmployee(emp)
            setLoading(false)
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

    // 7-hour auto-logout
    useEffect(() => {
        const timer = setTimeout(async () => {
            await supabase.auth.signOut()
            router.push('/admin')
        }, 7 * 60 * 60 * 1000)
        return () => clearTimeout(timer)
    }, [router])

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/admin')
    }

    const todayCount = bookings.filter(b => b.status !== 'deleted').length
    const confirmedCount = bookings.filter(b => b.status === 'confirmed').length

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050A14] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
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
                        <button onClick={handleLogout} className="text-muted-foreground hover:text-white transition-colors">
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
                        ...(isManager ? [{ id: 'team', label: 'Team', icon: Users }, { id: 'log', label: 'Aktivitäten', icon: Activity }] : []),
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
        </div>
    )
}

function AuditLog() {
    const [logs, setLogs] = useState<Record<string, unknown>[]>([])
    useEffect(() => {
        const client = createClient(
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
