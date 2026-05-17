'use client'

import { useState } from 'react'
import { X, Lock } from 'lucide-react'

// Full range of 30-min slots (10:00-19:30). Internal blocks are not bound to
// opening-hour rules — maintenance can happen at any time.
function generate30MinSlots(): string[] {
    const slots: string[] = []
    for (let hour = 8; hour < 22; hour++) {
        slots.push(`${String(hour).padStart(2, '0')}:00`)
        slots.push(`${String(hour).padStart(2, '0')}:30`)
    }
    return slots
}

const ALL_TIMES = generate30MinSlots()

const REASONS: { value: string; label: string }[] = [
    { value: 'Wartung',                label: '🔧 Wartung' },
    { value: 'Test / Probe',           label: '🧪 Test / Probe' },
    { value: 'Reinigung',              label: '🧹 Reinigung' },
    { value: 'Mitarbeiterschulung',    label: '📋 Mitarbeiterschulung' },
    { value: 'Private Reservierung',   label: '🔒 Private Reservierung' },
    { value: 'Sonstiges',              label: '📌 Sonstiges' },
]

const inputCls = [
    'w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5',
    'text-sm text-white placeholder:text-white/30',
    'focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30',
    'transition-colors',
].join(' ')

interface Props {
    onClose: () => void
    onSuccess: () => void
}

export default function BlockSlotForm({ onClose, onSuccess }: Props) {
    const today = new Date().toISOString().split('T')[0]
    const [form, setForm] = useState({
        date:             today,
        time:             '14:00',
        duration_minutes: 60,
        arenas_count:     2,
        reason:           'Wartung',
        notes:            '',
    })
    const [loading, setLoading] = useState(false)
    const [error,   setError]   = useState('')

    function set(field: string, value: string | number) {
        setForm(f => ({ ...f, [field]: value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const res = await fetch('/api/admin/bookings', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                booking_type:     'block',
                date:             form.date,
                time:             form.time,
                duration_minutes: form.duration_minutes,
                arenas_count:     form.arenas_count,
                reason:           form.reason,
                staff_notes:      form.notes || form.reason,
            }),
        })

        const data = await res.json()
        setLoading(false)
        if (res.ok) onSuccess()
        else setError(data.error || 'Unbekannter Fehler')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-[#0A1628] border border-orange-500/30 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-orange-500/20 bg-orange-500/5">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                            <Lock className="h-4 w-4 text-orange-400" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">Zeitfenster sperren</h2>
                            <p className="text-xs text-muted-foreground">Interne Sperrung — keine Zahlung</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {/* Reason */}
                    <Field label="Grund der Sperrung" id="block-reason">
                        <select
                            id="block-reason"
                            value={form.reason}
                            onChange={e => set('reason', e.target.value)}
                            className={inputCls}
                        >
                            {REASONS.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </Field>

                    {/* Date + Time */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Datum" id="block-date">
                            <input
                                id="block-date"
                                type="date"
                                value={form.date}
                                required
                                onChange={e => set('date', e.target.value)}
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Startzeit" id="block-time">
                            <select
                                id="block-time"
                                value={form.time}
                                onChange={e => set('time', e.target.value)}
                                className={inputCls}
                            >
                                {ALL_TIMES.map(t => (
                                    <option key={t} value={t}>{t} Uhr</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    {/* Duration + Arenas */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Dauer" id="block-duration">
                            <select
                                id="block-duration"
                                value={form.duration_minutes}
                                onChange={e => set('duration_minutes', Number(e.target.value))}
                                className={inputCls}
                            >
                                {[
                                    [30,  '30 Min.'],
                                    [60,  '60 Min. (1 Std.)'],
                                    [90,  '90 Min.'],
                                    [120, '2 Stunden'],
                                    [180, '3 Stunden'],
                                    [240, '4 Stunden'],
                                    [480, 'Ganzer Tag (8 Std.)'],
                                ].map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Arenen sperren" id="block-arenas">
                            <select
                                id="block-arenas"
                                value={form.arenas_count}
                                onChange={e => set('arenas_count', Number(e.target.value))}
                                className={inputCls}
                            >
                                <option value={1}>1 Arena</option>
                                <option value={2}>Beide Arenen</option>
                            </select>
                        </Field>
                    </div>

                    {/* Notes */}
                    <Field label="Interne Notiz (optional)" id="block-notes">
                        <textarea
                            id="block-notes"
                            value={form.notes}
                            onChange={e => set('notes', e.target.value)}
                            placeholder="z. B. Techniker kommt, Software-Update, Probe für Schulung..."
                            rows={2}
                            className={`${inputCls} resize-none`}
                        />
                    </Field>

                    {/* Warning */}
                    <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg px-4 py-3 text-xs text-orange-300/80">
                        ⚠️ Kunden können diesen Zeitslot nicht buchen. Zum Aufheben die Buchung im Admin-Board stornieren.
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-border/50 py-3 rounded-xl text-sm font-medium hover:border-border transition-colors"
                        >
                            Abbrechen
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-orange-500 text-white py-3 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-orange-500/90 transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                        >
                            {loading ? 'Wird gesperrt...' : '🔒 Zeitfenster sperren'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
    return (
        <div>
            <label htmlFor={id} className="block text-xs font-medium text-muted-foreground mb-1.5">
                {label}
            </label>
            {children}
        </div>
    )
}
