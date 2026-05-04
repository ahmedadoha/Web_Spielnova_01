'use client'

import { useState } from 'react'
import { X, Clock, XCircle, Mail, StickyNote, Trash2, RefreshCw } from 'lucide-react'

interface Props {
    booking: Record<string, unknown>
    isManager: boolean
    onClose: () => void
    onRefresh: () => void
}

export default function BookingDetailPanel({ booking, isManager, onClose, onRefresh }: Props) {
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')
    const [showReschedule, setShowReschedule] = useState(false)
    const [showRefund, setShowRefund] = useState(false)
    const [newDate, setNewDate] = useState(booking.date as string)
    const [newTime, setNewTime] = useState(booking.time as string)
    const [note, setNote] = useState((booking.staff_notes as string) || '')
    const [refundType, setRefundType] = useState<'full' | 'partial'>('full')
    const [refundAmount, setRefundAmount] = useState('')
    const [refundReason, setRefundReason] = useState('')

    async function doAction(action: string, extra?: Record<string, unknown>) {
        setLoading(true); setMsg('')
        const res = await fetch(`/api/admin/bookings/${booking.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...extra }),
        })
        const data = await res.json()
        setLoading(false)
        if (res.ok) { setMsg('✓ Gespeichert'); setTimeout(onRefresh, 800) }
        else setMsg('❌ ' + data.error)
    }

    async function handleRefund() {
        setLoading(true); setMsg('')
        const res = await fetch('/api/admin/refund', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                booking_id: booking.id,
                refund_type: refundType,
                amount_cents: refundType === 'partial' ? Math.round(parseFloat(refundAmount) * 100) : undefined,
                reason: refundReason,
            }),
        })
        const data = await res.json()
        setLoading(false)
        if (res.ok) { setMsg('✓ Rückerstattung eingeleitet'); setTimeout(onRefresh, 800) }
        else setMsg('❌ ' + data.error)
    }

    async function handleDelete() {
        if (!confirm('Buchung wirklich löschen? Nur der Manager kann dies rückgängig machen.')) return
        setLoading(true)
        const res = await fetch(`/api/admin/bookings/${booking.id}`, { method: 'DELETE' })
        setLoading(false)
        if (res.ok) onRefresh()
        else setMsg('❌ Fehler beim Löschen')
    }

    const totalEur = ((booking.total_amount as number) / 100).toFixed(2)
    const isOnline = !booking.walk_in

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="w-full max-w-md bg-[#0A1628] border-l border-border/30 overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-[#0A1628] border-b border-border/30 px-6 py-4 flex items-center justify-between">
                    <h2 className="font-bold text-lg">Buchungsdetails</h2>
                    <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground hover:text-white" /></button>
                </div>

                <div className="px-6 py-5 space-y-6">
                    {/* Info */}
                    <div className="space-y-3">
                        {[
                            ['Kunde', booking.customer_name],
                            ['E-Mail', booking.customer_email || '—'],
                            ['Spiel', booking.game_name],
                            ['Datum', booking.date],
                            ['Uhrzeit', `${booking.time} Uhr`],
                            ['Dauer', `${booking.duration_minutes} Min.`],
                            ['Spieler', booking.player_count],
                            ['Arenen', booking.arenas_count],
                            ['Betrag', isOnline ? `${totalEur} €` : `${booking.payment_method} (vor Ort)`],
                            ['Status', booking.status],
                        ].map(([label, value]) => (
                            <div key={label as string} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{label as string}</span>
                                <span className="font-medium text-right max-w-[60%]">{value as string}</span>
                            </div>
                        ))}
                        {(booking.staff_notes as string) && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 text-sm text-yellow-300">
                                📝 {booking.staff_notes as string}
                            </div>
                        )}
                    </div>

                    {msg && <div className={`text-sm rounded-lg px-4 py-2 ${msg.startsWith('✓') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{msg}</div>}

                    {/* Actions */}
                    <div className="space-y-3">
                        {/* Reschedule */}
                        <button
                            id="admin-reschedule-btn"
                            onClick={() => setShowReschedule(!showReschedule)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all text-sm font-medium"
                        >
                            <Clock className="h-4 w-4 text-primary" /> Umbuchung
                        </button>
                        {showReschedule && (
                            <div className="space-y-2 pl-2">
                                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                                    className="w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm" />
                                <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
                                    className="w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm" />
                                <button disabled={loading} onClick={() => doAction('reschedule', { date: newDate, time: newTime })}
                                    className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-sm font-bold disabled:opacity-50">
                                    Bestätigen & E-Mail senden
                                </button>
                            </div>
                        )}

                        {/* Cancel */}
                        <button
                            id="admin-cancel-btn"
                            onClick={() => { if (confirm('Buchung stornieren?')) doAction('cancel') }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border/40 hover:border-red-400/40 hover:bg-red-500/5 transition-all text-sm font-medium"
                        >
                            <XCircle className="h-4 w-4 text-red-400" /> Stornieren
                        </button>

                        {/* Note */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <StickyNote className="h-4 w-4 text-yellow-400" /> Notiz
                            </div>
                            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                                placeholder="Interne Notiz (nur für Mitarbeiter sichtbar)..."
                                className="w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm resize-none" />
                            <button disabled={loading} onClick={() => doAction('note', { staff_notes: note })}
                                className="text-xs px-3 py-1.5 border border-border/40 rounded-lg hover:border-primary/40 transition-colors disabled:opacity-50">
                                Notiz speichern
                            </button>
                        </div>

                        {/* Send email */}
                        <button
                            id="admin-email-btn"
                            onClick={() => doAction('send_reminder')}
                            disabled={!booking.customer_email || loading}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border/40 hover:border-blue-400/40 hover:bg-blue-500/5 transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Mail className="h-4 w-4 text-blue-400" /> Erinnerung senden
                        </button>

                        {/* Refund */}
                        {isOnline && (
                            <div className="space-y-2">
                                <button
                                    id="admin-refund-btn"
                                    onClick={() => setShowRefund(!showRefund)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/30 hover:bg-red-500/10 transition-all text-sm font-medium text-red-400"
                                >
                                    <RefreshCw className="h-4 w-4" /> Rückerstattung
                                </button>
                                {showRefund && (
                                    <div className="space-y-2 pl-2">
                                        <select value={refundType} onChange={e => setRefundType(e.target.value as 'full' | 'partial')}
                                            className="w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm">
                                            <option value="full">Vollständige Rückerstattung ({totalEur} €)</option>
                                            <option value="partial">Teilrückerstattung</option>
                                        </select>
                                        {refundType === 'partial' && (
                                            <input type="number" step="0.01" value={refundAmount} onChange={e => setRefundAmount(e.target.value)}
                                                placeholder="Betrag in € (z.B. 12.50)"
                                                className="w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm" />
                                        )}
                                        <input type="text" value={refundReason} onChange={e => setRefundReason(e.target.value)}
                                            placeholder="Grund (optional)"
                                            className="w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm" />
                                        <button disabled={loading} onClick={handleRefund}
                                            className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-red-700">
                                            Rückerstattung bestätigen
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Delete */}
                        <button
                            id="admin-delete-btn"
                            onClick={handleDelete}
                            disabled={loading}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-900/40 hover:bg-red-950/30 transition-all text-sm text-red-600"
                        >
                            <Trash2 className="h-4 w-4" /> Buchung löschen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
