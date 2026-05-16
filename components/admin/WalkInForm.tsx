'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { GAMES } from '@/lib/games'

// 30-min slots matching real opening hours: Mon-Thu 14:00-20:00, Fri-Sat 10:00-20:00
function generate30MinSlots(): string[] {
    const slots: string[] = []
    for (let hour = 10; hour < 20; hour++) {
        slots.push(`${String(hour).padStart(2, '0')}:00`)
        slots.push(`${String(hour).padStart(2, '0')}:30`)
    }
    return slots
}

const ALL_TIMES = generate30MinSlots()

function getNextSlot() {
    const now = new Date()
    const next = new Date(now)
    // Round up to next 30-min mark
    const minutes = next.getMinutes()
    if (minutes < 30) {
        next.setMinutes(30, 0, 0)
    } else {
        next.setHours(next.getHours() + 1, 0, 0, 0)
    }
    const dateStr = next.toISOString().split('T')[0]
    const hour = String(next.getHours()).padStart(2, '0')
    const min = String(next.getMinutes()).padStart(2, '0')
    return { date: dateStr, time: `${hour}:${min}` }
}

interface Props {
    onClose: () => void
    onSuccess: () => void
}

const inputCls = `
    w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5
    text-sm text-white placeholder:text-white/30
    focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30
    transition-colors
`.replace(/\s+/g, ' ').trim()

export default function WalkInForm({ onClose, onSuccess }: Props) {
    const nextSlot = getNextSlot()
    const [form, setForm] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        game_name: GAMES[0].title,
        game_slug: GAMES[0].slug,
        date: nextSlot.date,
        time: nextSlot.time,
        duration_minutes: 60,
        player_count: 2,
        payment_method: 'cash',
        staff_notes: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    function set(field: string, value: string | number) {
        setForm(f => ({ ...f, [field]: value }))
    }

    function handleGameChange(slug: string) {
        const game = GAMES.find(g => g.slug === slug)
        if (game) setForm(f => ({ ...f, game_slug: game.slug, game_name: game.title }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!form.customer_name) { setError('Kundenname ist erforderlich.'); return }
        setLoading(true); setError('')

        const arenas_count = form.player_count > 4 ? 2 : 1
        const res = await fetch('/api/admin/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, arenas_count }),
        })
        const data = await res.json()
        setLoading(false)
        if (res.ok) onSuccess()
        else setError(data.error || 'Unbekannter Fehler')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-[#0A1628] border border-border/40 rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
                    <div>
                        <h2 className="font-bold text-lg">Walk-in Buchung erstellen</h2>
                        <p className="text-sm text-muted-foreground">
                            Nächster Slot: {nextSlot.date} {nextSlot.time}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto max-h-[75vh]">
                    <div className="space-y-4">
                        <Field label="Kundenname *" id="walkin-name">
                            <input
                                id="walkin-name"
                                value={form.customer_name}
                                onChange={e => set('customer_name', e.target.value)}
                                placeholder="Max Mustermann"
                                required
                                className={inputCls}
                            />
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="E-Mail (optional)" id="walkin-email">
                                <input
                                    id="walkin-email"
                                    type="email"
                                    value={form.customer_email}
                                    onChange={e => set('customer_email', e.target.value)}
                                    placeholder="max@example.com"
                                    className={inputCls}
                                />
                            </Field>
                            <Field label="Telefon (optional)" id="walkin-phone">
                                <input
                                    id="walkin-phone"
                                    value={form.customer_phone}
                                    onChange={e => set('customer_phone', e.target.value)}
                                    placeholder="+49 841 000000"
                                    className={inputCls}
                                />
                            </Field>
                        </div>

                        <Field label="Spiel / Erlebnis" id="walkin-game">
                            <select
                                id="walkin-game"
                                value={form.game_slug}
                                onChange={e => handleGameChange(e.target.value)}
                                className={inputCls}
                            >
                                {GAMES.map(g => (
                                    <option key={g.slug} value={g.slug}>{g.title}</option>
                                ))}
                            </select>
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Datum" id="walkin-date">
                                <input
                                    id="walkin-date"
                                    type="date"
                                    value={form.date}
                                    onChange={e => set('date', e.target.value)}
                                    className={inputCls}
                                />
                            </Field>
                            <Field label="Uhrzeit" id="walkin-time">
                                <select
                                    id="walkin-time"
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

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Spieleranzahl" id="walkin-players">
                                <select
                                    id="walkin-players"
                                    value={form.player_count}
                                    onChange={e => set('player_count', Number(e.target.value))}
                                    className={inputCls}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                        <option key={n} value={n}>
                                            {n} Spieler{n > 4 ? ' (2 Arenen)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Dauer (Minuten)" id="walkin-duration">
                                <select
                                    id="walkin-duration"
                                    value={form.duration_minutes}
                                    onChange={e => set('duration_minutes', Number(e.target.value))}
                                    className={inputCls}
                                >
                                    {[30, 60, 90, 120].map(n => (
                                        <option key={n} value={n}>{n} Min.</option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <Field label="Zahlungsmethode" id="walkin-payment">
                            <select
                                id="walkin-payment"
                                value={form.payment_method}
                                onChange={e => set('payment_method', e.target.value)}
                                className={inputCls}
                            >
                                <option value="cash">💵 Barzahlung</option>
                                <option value="card">💳 Kartenzahlung</option>
                            </select>
                        </Field>

                        <Field label="Notiz für Mitarbeiter" id="walkin-notes">
                            <textarea
                                id="walkin-notes"
                                value={form.staff_notes}
                                onChange={e => set('staff_notes', e.target.value)}
                                placeholder="z.B. Geburtstag, Stammkunde, besondere Wünsche..."
                                rows={2}
                                className={`${inputCls} resize-none`}
                            />
                        </Field>
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    <div className="flex gap-3 pt-2">
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
                            id="walkin-submit"
                            className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl text-sm font-bold disabled:opacity-50 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:bg-primary/90 transition-all"
                        >
                            {loading ? 'Wird gespeichert...' : 'Buchung erstellen'}
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
