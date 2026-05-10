"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Check, Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"
import Link from "next/link"

interface BookingSummary {
    customer_name?: string
    game_name?: string
    game_slug?: string
    game_mode?: string
    date?: string
    time?: string
    duration_minutes?: number
    player_count?: number
    total_amount?: number
}

function SuccessContent() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get("session_id")
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [booking, setBooking] = useState<BookingSummary | null>(null)

    useEffect(() => {
        if (!sessionId) { setStatus("error"); return }

        fetch(`/api/bookings/confirm?session_id=${sessionId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setBooking(data.booking ?? null)
                    setStatus("success")
                } else {
                    setStatus("error")
                }
            })
            .catch(() => setStatus("error"))
    }, [sessionId])

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h1 className="text-2xl font-bold">Zahlung wird überprüft...</h1>
                <p className="text-muted-foreground">Bitte schließe das Fenster nicht.</p>
            </div>
        )
    }

    if (status === "error") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center px-4">
                <div className="h-20 w-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="h-10 w-10" />
                </div>
                <h1 className="text-3xl font-bold">Fehler bei der Bestätigung</h1>
                <p className="text-muted-foreground max-w-lg">
                    Es gab ein Problem beim Abrufen deiner Zahlungsbestätigung. Wenn das Geld abgebucht wurde, kontaktiere uns bitte.
                </p>
                <Button asChild variant="outline">
                    <Link href="/kontakt">Kontakt aufnehmen</Link>
                </Button>
            </div>
        )
    }

    const gameName = booking?.game_name || booking?.game_slug || booking?.game_mode || '—'
    const formattedDate = booking?.date
        ? new Date(booking.date).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
        : null
    const amountEur = booking?.total_amount ? (booking.total_amount / 100).toFixed(2) : null

    return (
        <div className="container py-16 px-4 min-h-[60vh] flex flex-col items-center justify-center">
            {/* Icon + headline */}
            <div className="h-24 w-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-8 animate-in zoom-in duration-500">
                <Check className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center">
                Buchung erfolgreich!
            </h1>
            <p className="text-muted-foreground text-center mb-8 max-w-md">
                Deine Zahlung wurde bestätigt. Eine Bestätigungs-E-Mail ist unterwegs zu dir.
            </p>

            {/* Booking summary card */}
            {booking && (
                <div className="w-full max-w-sm bg-card/40 border border-border/30 rounded-2xl overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-border/30 px-5 py-3">
                        <p className="text-xs font-semibold text-primary uppercase tracking-widest">Deine Buchung</p>
                    </div>
                    <div className="px-5 py-4 space-y-3">
                        {[
                            ['🎮 Erlebnis',    gameName],
                            ['📅 Datum',       formattedDate],
                            ['⏰ Startzeit',   booking.time ? `${booking.time} Uhr` : null],
                            ['⏳ Dauer',       booking.duration_minutes ? `${booking.duration_minutes} Minuten` : null],
                            ['👥 Spieler',     booking.player_count ? `${booking.player_count} Personen` : null],
                            ['💰 Bezahlt',     amountEur ? `${amountEur} €` : null],
                        ].filter(([, v]) => v).map(([label, value]) => (
                            <div key={label as string} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{label as string}</span>
                                <span className="font-semibold text-right max-w-[55%]">{value as string}</span>
                            </div>
                        ))}
                    </div>
                    <div className="px-5 py-3 bg-purple-500/10 border-t border-border/30">
                        <p className="text-xs text-purple-300 text-center">
                            ⏱ Bitte sei <strong>10 Minuten vor Spielbeginn</strong> bei uns im Basecamp!
                        </p>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="px-8 font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                    <Link href="/">Zur Startseite</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                    <Link href="/kontakt">Anfahrt ansehen</Link>
                </Button>
            </div>
        </div>
    )
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h1 className="text-2xl font-bold">Laden...</h1>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    )
}
