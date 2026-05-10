"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Check, Loader2, Users } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"
import { TOP_GAMER_DISCOUNT_PERCENT, MAX_PLAYERS, PLAYERS_PER_ARENA } from "@/lib/constants"
import { GAMES_BY_MODE } from "@/lib/games"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SectionHeader } from "@/components/section-header"
import { Card, CardContent } from "@/components/ui/card"
import { de } from "date-fns/locale"

// Game catalog is managed centrally in lib/games.ts
const games = GAMES_BY_MODE

interface TimeSlot {
    time: string
    arena1: boolean
    arena2: boolean
}

export default function BookingPage() {
    const [step, setStep] = React.useState(1)
    const [gameMode, setGameMode] = React.useState<"shooter" | "escape" | null>(null)
    const [selectedGame, setSelectedGame] = React.useState<string>("")
    const [playerCount, setPlayerCount] = React.useState<string>("2")
    const [duration, setDuration] = React.useState<"30" | "60">("60")
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    const [availableSlots, setAvailableSlots] = React.useState<Record<string, { arena1: boolean, arena2: boolean }>>({})
    const [selectedTime, setSelectedTime] = React.useState<string | null>(null)

    const [customerName, setCustomerName] = React.useState("")
    const [customerEmail, setCustomerEmail] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [success, setSuccess] = React.useState(false)

    // Fetch availability when date changes
    React.useEffect(() => {
        if (date) {
            setLoading(true)
            const dateStr = format(date, "yyyy-MM-dd")
            fetch(`/api/availability?date=${dateStr}`)
                .then(async (res) => {
                    if (!res.ok) {
                        const text = await res.text();
                        throw new Error(`Server Data Error: ${res.status} ${res.statusText} - ${text.substring(0, 50)}...`);
                    }
                    return res.json();
                })
                .then(data => {
                    if (data.error) {
                        console.error("Availability API Error:", data.error)
                        setAvailableSlots({})
                        // Only alert if it's a specific logic error, not just empty slots
                        if (data.message !== 'Closed on Sundays') {
                            alert("Hinweis: " + data.error)
                        }
                    } else {
                        setAvailableSlots(data.availability || {})
                    }
                    setLoading(false)
                })
                .catch((err) => {
                    console.error("Fetch Error Detail:", err)
                    alert(`Fehler: ${err.message}`)
                    setLoading(false)
                })
        }
    }, [date])

    const calculatePrice = () => {
        if (!date) return { total: 0, standardTotal: 0, savings: 0, singlePrice: 0, teamPrice: 0, teamCount: 0, singleCount: 0 }
        const isWeekend = [0, 5, 6].includes(date.getDay()) // Sun, Fri, Sat
        let singlePrice = 0, teamPrice = 0
        if (duration === "30") {
            singlePrice = isWeekend ? 19.90 : 14.90
            teamPrice = isWeekend ? 74.00 : 55.00
        } else {
            singlePrice = isWeekend ? 34.90 : 24.90
            teamPrice = isWeekend ? 124.00 : 90.00
        }
        const pCount = parseInt(playerCount)
        const teamCount = Math.floor(pCount / 4)
        const singleCount = pCount % 4
        const total = (teamCount * teamPrice) + (singleCount * singlePrice)
        const standardTotal = pCount * singlePrice
        const savings = standardTotal - total
        return { total, standardTotal, savings, singlePrice, teamPrice, teamCount, singleCount }
    }
    const pricing = calculatePrice()

    const handleNext = () => setStep(step + 1)
    const handleBack = () => setStep(step - 1)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Determine arena allocation logic
        // Simple logic: Try Arena 1, if taken try Arena 2.
        // Ideally user selects specific arena or system assigns.
        // Here we auto-assign based on availability

        if (!selectedTime || !availableSlots[selectedTime]) return;

        let assignedArena = "";
        if (availableSlots[selectedTime].arena1) assignedArena = "arena-1"
        else if (availableSlots[selectedTime].arena2) assignedArena = "arena-2"

        if (!assignedArena) {
            alert("Sorry, dieser Slot ist nicht mehr verfügbar.")
            setLoading(false)
            return
        }

        // For groups > 4, we might need 2 arenas, but let's keep it simple for now as per logic
        // Booking 1 arena per transaction

        const res = await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                date: date ? format(date, "yyyy-MM-dd") : "",
                time: selectedTime,
                duration: parseInt(duration),
                arenaId: assignedArena,
                gameMode,
                gameSlug: selectedGame,
                playerCount: parseInt(playerCount),
                customerName,
                customerEmail
            })
        })

        const data = await res.json()
        setLoading(false)

        if (data.success && data.url) {
            // Redirect to Stripe
            window.location.href = data.url;
        } else {
            alert("Fehler bei der Buchung: " + (data.error || "Unbekannter Fehler"))
        }
    }

    // Success state is now handled by a separate page, but we keep this as fallback or cleanup
    if (success) return null;

    return (
        <div className="container py-20 px-4 md:px-6 max-w-4xl mx-auto">
            <SectionHeader title="Erlebnis Buchen" subtitle={`Schritt ${step} von 4`} />

            <div className="mb-6 bg-primary/10 border border-primary/30 p-4 rounded-xl flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                <span className="text-2xl">🎮</span>
                <p className="font-medium text-sm sm:text-base">
                    <strong className="text-primary font-bold">Top Gamer Rabatt:</strong> Komm innerhalb von 30 Tagen zurück und sichere dir <span className="font-bold text-primary">{TOP_GAMER_DISCOUNT_PERCENT * 100}% Rabatt</span> auf dein nächstes VR Arena Erlebnis! (Wird an der Kasse automatisch abgezogen)
                </p>
            </div>

            <Card className="border-border/50 bg-card/60 backdrop-blur-md">
                <CardContent className="p-6 md:p-10">
                    <AnimatePresence mode="wait">

                        {/* Step 1: Mode & Game Selection */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold">Wähle dein Erlebnis</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Button
                                            variant={gameMode === "shooter" ? "default" : "outline"}
                                            className="h-24 text-lg font-bold"
                                            onClick={() => { setGameMode("shooter"); setSelectedGame(""); }}
                                        >
                                            VR Shooter
                                        </Button>
                                        <Button
                                            variant={gameMode === "escape" ? "default" : "outline"}
                                            className="h-24 text-lg font-bold"
                                            onClick={() => { setGameMode("escape"); setSelectedGame(""); }}
                                        >
                                            VR Escape Room
                                        </Button>
                                    </div>
                                </div>

                                {gameMode && (
                                    <div className="space-y-4 pt-4 border-t border-white/10 mt-4">
                                        <h3 className="text-xl font-bold">Spieldauer</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Button
                                                variant={duration === "30" ? "default" : "outline"}
                                                className="h-16 text-lg font-bold"
                                                onClick={() => setDuration("30")}
                                            >
                                                30 Minuten
                                            </Button>
                                            <Button
                                                variant={duration === "60" ? "default" : "outline"}
                                                className="h-16 text-lg font-bold relative overflow-hidden"
                                                onClick={() => setDuration("60")}
                                            >
                                                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5">BELIEBT</div>
                                                60 Minuten
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {gameMode && (
                                    <div className="space-y-4 pt-4 border-t border-white/10 mt-4">
                                        <h3 className="text-xl font-bold">Wähle das Spiel</h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {games[gameMode].map((g) => (
                                                <div
                                                    key={g.slug}
                                                    className={cn(
                                                        "p-4 rounded-lg border cursor-pointer transition-all flex items-center justify-between hover:bg-accent",
                                                        selectedGame === g.slug ? "border-primary bg-primary/10" : "border-border"
                                                    )}
                                                    onClick={() => setSelectedGame(g.slug)}
                                                >
                                                    <span className="font-medium">{g.title}</span>
                                                    {selectedGame === g.slug && <Check className="h-5 w-5 text-primary" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end pt-4">
                                    <Button onClick={handleNext} disabled={!selectedGame} size="lg">Weiter</Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Players & Date */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold">Wie viele Spieler?</h3>
                                    <Select value={playerCount} onValueChange={(val) => { setPlayerCount(val); setSelectedTime(null); }}>
                                        <SelectTrigger className="w-full md:w-[200px]">
                                            <SelectValue placeholder="Anzahl Spieler" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: MAX_PLAYERS - 1 }, (_, i) => i + 2).map(n => (
                                                <SelectItem key={n} value={String(n)}>
                                                    {n} Spieler{n > PLAYERS_PER_ARENA ? ' (Benötigt 2 Arenen)' : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {parseInt(playerCount) > 4 && (
                                        <p className="text-sm text-yellow-500">Hinweis: Für mehr als 4 Spieler buchen wir automatisch beide Arenen (falls verfügbar).</p>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold">Wann wollt ihr spielen?</h3>
                                    <div className="flex flex-col md:flex-row gap-8 items-start">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            className="rounded-md border mx-auto md:mx-0"
                                            locale={de}
                                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                        />
                                        <div className="flex-1 w-full">
                                            <h4 className="font-semibold mb-3">Verfügbare Slots am {date ? format(date, "dd.MM.yyyy") : ""}</h4>
                                            {loading ? (
                                                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                                            ) : (
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2">
                                                    {Object.entries(availableSlots).length > 0 ? (
                                                        Object.entries(availableSlots).map(([time, status]) => {
                                                            const needsBothArenas = parseInt(playerCount) > 4;
                                                            const isToday = date ? format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') : false;
                                                            const isPast = isToday && time <= format(new Date(), 'HH:mm');
                                                            const isAvailable = !isPast && (needsBothArenas
                                                                ? (status.arena1 && status.arena2)
                                                                : (status.arena1 || status.arena2));
                                                            return (
                                                                <Button
                                                                    key={time}
                                                                    variant={selectedTime === time ? "default" : isAvailable ? "outline" : "ghost"}
                                                                    disabled={!isAvailable}
                                                                    onClick={() => setSelectedTime(time)}
                                                                    className={cn(!isAvailable && "opacity-50")}
                                                                >
                                                                    {time}
                                                                </Button>
                                                            )
                                                        })
                                                    ) : (
                                                        <p className="text-muted-foreground col-span-3">Keine Slots verfügbar oder Datum geschlossen.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button variant="ghost" onClick={handleBack}>Zurück</Button>
                                    <Button onClick={handleNext} disabled={!selectedTime} size="lg">Weiter</Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Details & Payment */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="bg-secondary/10 p-4 rounded-lg border border-secondary/20">
                                    <h3 className="font-bold text-lg mb-2">Zusammenfassung</h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <span className="text-muted-foreground">Spiel:</span>
                                        <span className="font-medium text-right">{games[gameMode!].find(g => g.slug === selectedGame)?.title} ({duration} Min)</span>

                                        <span className="text-muted-foreground">Datum & Zeit:</span>
                                        <span className="font-medium text-right">{date ? format(date, "dd.MM.yyyy") : ""} um {selectedTime} Uhr</span>

                                        <span className="text-muted-foreground">Spieler:</span>
                                        <span className="font-medium text-right">
                                            {playerCount} {pricing.teamCount > 0 ? `(${pricing.teamCount}x Team-Paket${pricing.singleCount > 0 ? ` + ${pricing.singleCount} Einzelspieler` : ''})` : ''}
                                        </span>

                                        {pricing.savings > 0 ? (
                                            <>
                                                <span className="text-muted-foreground">Standardpreis:</span>
                                                <span className="font-medium text-right line-through text-muted-foreground">
                                                    {pricing.standardTotal.toFixed(2)} € <span className="text-xs">({playerCount}x {pricing.singlePrice.toFixed(2)} €)</span>
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-muted-foreground">Preis pro Person:</span>
                                                <span className="font-medium text-right">{pricing.singlePrice.toFixed(2)} €</span>
                                            </>
                                        )}

                                        <div className="col-span-2 h-px bg-white/10 my-2"></div>

                                        <span className="text-lg font-bold">Dein Preis:</span>
                                        <span className="text-lg font-bold text-right text-primary">
                                            {pricing.total.toFixed(2)} €
                                        </span>
                                    </div>
                                    {pricing.savings > 0 && (
                                        <div className="mt-4 p-3 bg-primary/20 border border-primary/30 rounded text-center">
                                            <span className="font-bold text-primary">🎉 Du sparst: {pricing.savings.toFixed(2)} €!</span>
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Dein Name</Label>
                                        <Input
                                            id="name"
                                            required
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="Max Mustermann"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Adresse</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            value={customerEmail}
                                            onChange={(e) => setCustomerEmail(e.target.value)}
                                            placeholder="max@beispiel.de"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <Button type="submit" size="lg" className="w-full font-bold text-lg" disabled={loading}>
                                            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                            Jetzt Buchen & Bezahlen
                                        </Button>
                                        <p className="text-center text-xs text-muted-foreground mt-2">
                                            Zahlung derzeit nur vor Ort (Demo Mode) oder via Stripe (wenn konfiguriert).
                                        </p>
                                    </div>
                                </form>

                                <div className="flex justify-start pt-4">
                                    <Button variant="ghost" onClick={handleBack}>Zurück</Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4 handling is redundant if we assume 3 steps UI logic, adjusting logic above */}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    )
}
