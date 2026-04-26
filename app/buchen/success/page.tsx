"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Check, Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"
import Link from "next/link"

function SuccessContent() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get("session_id")
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

    useEffect(() => {
        if (!sessionId) {
            setStatus("error")
            return
        }

        // Verify payment with backend
        fetch(`/api/bookings/confirm?session_id=${sessionId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
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

    return (
        <div className="container py-20 px-4 text-center min-h-[60vh] flex flex-col items-center justify-center">
            <div className="h-24 w-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-8 animate-in zoom-in duration-500">
                <Check className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Buchung erfolgreich!</h1>
            <p className="text-xl text-muted-foreground max-w-lg mb-8">
                Vielen Dank! Deine Zahlung wurde bestätigt und deine Slots sind reserviert.
                Du erhältst in Kürze eine E-Mail mit allen Details.
            </p>
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
