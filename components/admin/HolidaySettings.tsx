'use client'

import { useEffect, useState } from 'react'
import { CalendarRange, Trash2, Plus } from 'lucide-react'

interface Holiday {
    id: string
    name: string
    type: 'school' | 'public'
    start_date: string
    end_date: string
}

export default function HolidaySettings() {
    const [holidays, setHolidays] = useState<Holiday[]>([])
    const [name, setName] = useState('')
    const [type, setType] = useState<'school' | 'public'>('school')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')

    async function fetchHolidays() {
        const res = await fetch('/api/admin/holidays')
        const data = await res.json()
        if (data.holidays) setHolidays(data.holidays)
    }

    useEffect(() => { fetchHolidays() }, [])

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault()
        if (!name || !startDate || !endDate) return

        setLoading(true)
        const res = await fetch('/api/admin/holidays', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'create', name, type, start_date: startDate, end_date: endDate })
        })
        const data = await res.json()
        setLoading(false)

        if (res.ok) {
            setMsg('✓ ' + data.message)
            setName('')
            setStartDate('')
            setEndDate('')
            fetchHolidays()
        } else {
            setMsg('❌ ' + data.error)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Ferien wirklich löschen?')) return
        setLoading(true)
        const res = await fetch('/api/admin/holidays', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id })
        })
        const data = await res.json()
        setLoading(false)

        if (res.ok) {
            setMsg('✓ ' + data.message)
            fetchHolidays()
        } else {
            setMsg('❌ ' + data.error)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <CalendarRange className="h-5 w-5 text-primary" />
                    Schulferien verwalten
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                    An diesen Tagen öffnet das System automatisch bereits um 10:00 Uhr statt um 14:30 Uhr.
                </p>
            </div>

            {msg && <div className={`text-sm rounded-lg px-4 py-2 ${msg.startsWith('✓') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{msg}</div>}

            <form onSubmit={handleAdd} className="bg-card/40 border border-border/30 rounded-xl p-5 space-y-4">
                <h4 className="font-medium text-sm text-primary">Neue Ferien/Feiertage hinzufügen</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground ml-1">Bezeichnung</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="z.B. Sommerferien" required className="w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground ml-1">Typ</label>
                        <select value={type} onChange={e => setType(e.target.value as 'school' | 'public')} className="w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm">
                            <option value="school">Schulferien (offen ab 10:00)</option>
                            <option value="public">Feiertag (geschlossen)</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground ml-1">Startdatum</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground ml-1">Enddatum</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm" />
                    </div>
                </div>
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary/80 transition-all disabled:opacity-50">
                    <Plus className="h-4 w-4" /> Hinzufügen
                </button>
            </form>

            <div className="bg-card/40 border border-border/30 rounded-xl overflow-hidden">
                <div className="divide-y divide-border/20">
                    {holidays.length === 0 ? (
                        <div className="px-5 py-4 text-sm text-muted-foreground">Keine Ferien eingetragen.</div>
                    ) : (
                        holidays.map(h => (
                            <div key={h.id} className="px-5 py-4 flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-sm flex items-center gap-2">
                                        {h.name}
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase ${h.type === 'school' ? 'text-blue-400 border-blue-400/30 bg-blue-500/10' : 'text-red-400 border-red-400/30 bg-red-500/10'}`}>
                                            {h.type === 'school' ? 'Schulferien' : 'Feiertag'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                        {new Date(h.start_date).toLocaleDateString('de-DE')} - {new Date(h.end_date).toLocaleDateString('de-DE')}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(h.id)}
                                    disabled={loading}
                                    className="p-2 rounded-lg border border-border/40 hover:border-red-400/40 hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4 text-red-400" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
