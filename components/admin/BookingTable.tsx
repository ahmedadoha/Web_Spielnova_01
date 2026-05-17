'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'

const STATUS_STYLES: Record<string, string> = {
    confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    refunded: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    deleted: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const STATUS_LABELS: Record<string, string> = {
    confirmed: 'Bestätigt', pending: 'Ausstehend',
    cancelled: 'Storniert', refunded: 'Erstattet', deleted: 'Gelöscht',
}

interface Props {
    bookings: Record<string, unknown>[]
    onSelect: (booking: Record<string, unknown>) => void
    onRefresh: () => void
}

export default function BookingTable({ bookings, onSelect, onRefresh }: Props) {
    const [search, setSearch] = useState('')

    const filtered = bookings.filter(b => {
        if (b.status === 'deleted') return false
        if (b.status === 'pending_payment') return false
        if (!search) return true
        const q = search.toLowerCase()
        return (
            (b.customer_name as string)?.toLowerCase().includes(q) ||
            (b.customer_email as string)?.toLowerCase().includes(q) ||
            (b.game_name as string)?.toLowerCase().includes(q)
        )
    })

    return (
        <div className="bg-card/40 border border-border/30 rounded-xl overflow-hidden">
            {/* Search & refresh */}
            <div className="px-4 py-3 border-b border-border/30 flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        id="admin-search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Suche nach Name, E-Mail oder Spiel..."
                        className="w-full bg-background/60 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                </div>
                <button onClick={onRefresh} className="text-xs text-muted-foreground hover:text-white border border-border/40 rounded-lg px-3 py-2 transition-colors">
                    ↻ Aktualisieren
                </button>
                <span className="text-xs text-muted-foreground">{filtered.length} Buchungen</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border/30 text-muted-foreground text-xs uppercase tracking-wide">
                            {['Datum', 'Zeit', 'Kunde', 'E-Mail', 'Spiel', 'Spieler', 'Status', 'Zahlung'].map(h => (
                                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={8} className="text-center py-12 text-muted-foreground">
                                    Keine Buchungen gefunden.
                                </td>
                            </tr>
                        )}
                        {filtered.map((booking) => (
                            <tr
                                key={booking.id as string}
                                onClick={() => onSelect(booking)}
                                className="hover:bg-white/[0.03] cursor-pointer transition-colors group"
                            >
                                <td className="px-4 py-3 font-medium">{booking.date as string}</td>
                                <td className="px-4 py-3 text-primary font-bold">{booking.time as string}</td>
                                <td className="px-4 py-3 font-medium group-hover:text-primary transition-colors">{booking.customer_name as string}</td>
                                <td className="px-4 py-3 text-muted-foreground text-xs">{(booking.customer_email as string) || '—'}</td>
                                <td className="px-4 py-3">{booking.game_name as string}</td>
                                <td className="px-4 py-3 text-center">{booking.player_count as number}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs font-medium border px-2 py-0.5 rounded-full ${STATUS_STYLES[booking.status as string] || ''}`}>
                                        {STATUS_LABELS[booking.status as string] || booking.status as string}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-muted-foreground capitalize">
                                    {booking.payment_method === 'free_test'
                                        ? '🧪 Free Test'
                                        : (booking.walk_in ? (booking.payment_method as string) : 'Online') || 'Online'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
