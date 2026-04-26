'use client'

import { useEffect, useState } from 'react'
import { UserPlus, Shield, ShieldOff, Key, Trash2 } from 'lucide-react'

interface Employee {
    id: string
    name: string
    role: string
    is_active: boolean
    last_login: string | null
    created_at: string
}

export default function TeamManagement() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [showAdd, setShowAdd] = useState(false)
    const [newName, setNewName] = useState('')
    const [newEmail, setNewEmail] = useState('')
    const [newRole, setNewRole] = useState('worker')
    const [newPass, setNewPass] = useState('')
    const [msg, setMsg] = useState('')
    const [loading, setLoading] = useState(false)

    async function fetchEmployees() {
        const res = await fetch('/api/admin/employees')
        const data = await res.json()
        if (data.employees) setEmployees(data.employees)
    }

    useEffect(() => { fetchEmployees() }, [])

    async function doAction(action: string, employee_id: string, extra?: Record<string, unknown>) {
        setLoading(true); setMsg('')
        const res = await fetch('/api/admin/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, employee_id, ...extra }),
        })
        const data = await res.json()
        setLoading(false)
        if (res.ok) { setMsg('✓ ' + (data.message || 'Gespeichert')); fetchEmployees() }
        else setMsg('❌ ' + data.error)
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (!newName || !newEmail || !newPass) { setMsg('Alle Felder ausfüllen.'); return }
        setLoading(true); setMsg('')
        const res = await fetch('/api/admin/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'create', name: newName, email: newEmail, role: newRole, temp_password: newPass }),
        })
        const data = await res.json()
        setLoading(false)
        if (res.ok) { setMsg('✓ Mitarbeiter erstellt!'); setNewName(''); setNewEmail(''); setNewPass(''); setShowAdd(false); fetchEmployees() }
        else setMsg('❌ ' + data.error)
    }

    async function handleResetPassword(emp: Employee) {
        const newPassword = prompt(`Neues temporäres Passwort für ${emp.name} eingeben:`)
        if (!newPassword) return
        await doAction('reset_password', emp.id, { temp_password: newPassword })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-lg">Team verwalten</h3>
                    <p className="text-sm text-muted-foreground">{employees.length} Mitarbeiter insgesamt</p>
                </div>
                <button
                    id="admin-add-employee-btn"
                    onClick={() => setShowAdd(!showAdd)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary/80 transition-all"
                >
                    <UserPlus className="h-4 w-4" />
                    Mitarbeiter hinzufügen
                </button>
            </div>

            {msg && <div className={`text-sm rounded-lg px-4 py-2 ${msg.startsWith('✓') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{msg}</div>}

            {/* Add form */}
            {showAdd && (
                <form onSubmit={handleCreate} className="bg-card/40 border border-primary/20 rounded-xl p-5 space-y-3">
                    <h4 className="font-medium text-sm text-primary">Neuer Mitarbeiter</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <input id="emp-name" value={newName} onChange={e => setNewName(e.target.value)}
                            placeholder="Vollständiger Name" required
                            className="bg-background/60 border border-border rounded-lg px-3 py-2 text-sm col-span-2" />
                        <input id="emp-email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                            placeholder="E-Mail-Adresse" required
                            className="bg-background/60 border border-border rounded-lg px-3 py-2 text-sm" />
                        <select id="emp-role" value={newRole} onChange={e => setNewRole(e.target.value)}
                            className="bg-background/60 border border-border rounded-lg px-3 py-2 text-sm">
                            <option value="worker">Mitarbeiter</option>
                            <option value="manager">Manager</option>
                        </select>
                        <input id="emp-pass" type="text" value={newPass} onChange={e => setNewPass(e.target.value)}
                            placeholder="Temporäres Passwort" required
                            className="bg-background/60 border border-border rounded-lg px-3 py-2 text-sm col-span-2" />
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={() => setShowAdd(false)}
                            className="flex-1 border border-border/50 py-2 rounded-lg text-sm hover:border-border">Abbrechen</button>
                        <button type="submit" disabled={loading}
                            className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-bold disabled:opacity-50">
                            {loading ? 'Erstelle...' : 'Erstellen'}
                        </button>
                    </div>
                </form>
            )}

            {/* Employee list */}
            <div className="bg-card/40 border border-border/30 rounded-xl overflow-hidden">
                <div className="divide-y divide-border/20">
                    {employees.map(emp => (
                        <div key={emp.id} className="px-5 py-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                                {emp.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{emp.name}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${emp.role === 'manager' ? 'text-primary border-primary/30 bg-primary/10' : 'text-muted-foreground border-border/50'}`}>
                                        {emp.role === 'manager' ? 'Manager' : 'Mitarbeiter'}
                                    </span>
                                    {!emp.is_active && <span className="text-xs text-red-400 border border-red-400/30 bg-red-500/10 px-2 py-0.5 rounded-full">Deaktiviert</span>}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Letzter Login: {emp.last_login ? new Date(emp.last_login).toLocaleString('de-DE') : 'Noch nie'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    title={emp.is_active ? 'Deaktivieren' : 'Aktivieren'}
                                    onClick={() => doAction('toggle_active', emp.id, { is_active: !emp.is_active })}
                                    disabled={loading}
                                    className="p-2 rounded-lg border border-border/40 hover:border-yellow-400/40 hover:bg-yellow-500/10 transition-colors"
                                >
                                    {emp.is_active ? <ShieldOff className="h-4 w-4 text-yellow-400" /> : <Shield className="h-4 w-4 text-green-400" />}
                                </button>
                                <button
                                    title="Passwort zurücksetzen"
                                    onClick={() => handleResetPassword(emp)}
                                    disabled={loading}
                                    className="p-2 rounded-lg border border-border/40 hover:border-blue-400/40 hover:bg-blue-500/10 transition-colors"
                                >
                                    <Key className="h-4 w-4 text-blue-400" />
                                </button>
                                <button
                                    title="Mitarbeiter löschen"
                                    onClick={() => { if (confirm(`${emp.name} wirklich löschen?`)) doAction('delete', emp.id) }}
                                    disabled={loading}
                                    className="p-2 rounded-lg border border-border/40 hover:border-red-400/40 hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4 text-red-400" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
