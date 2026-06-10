import { Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionHeader } from "@/components/section-header"
import { TOP_GAMER_DISCOUNT_PERCENT } from "@/lib/constants"
import { PRICING, formatGermanPrice } from "@/lib/prices"

export default function PricingPage() {
    return (
        <div className="container py-20 px-4 md:px-6">
            <SectionHeader
                title="Preise & Pakete"
                subtitle="Transparent und fair. Wähle das passende Paket für dein Erlebnis."
            />

            <div className="mb-10 max-w-4xl mx-auto bg-primary/10 border border-primary/30 p-4 md:p-5 rounded-xl flex items-center justify-center gap-4 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                <span className="text-3xl hidden sm:block">🎮</span>
                <p className="font-medium text-sm sm:text-base">
                    <strong className="text-primary font-bold">Top Gamer Rabatt:</strong> Komm innerhalb von 30 Tagen zurück und sichere dir <span className="font-bold text-primary">{TOP_GAMER_DISCOUNT_PERCENT * 100}% Rabatt</span> auf dein nächstes VR Arena Erlebnis! (Wird an der Kasse automatisch abgezogen)
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* VR Arena 30 Min */}
                <Card className="flex flex-col border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl">VR Arena <span className="text-primary text-lg ml-1">(30 Min)</span></CardTitle>
                        <CardDescription>Kurzer Spaß oder zum Reinschnuppern</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Einzelspieler</h4>
                                <div className="flex justify-between items-center mb-2">
                                    <span>Mo - Do</span>
                                    <span className="font-bold text-lg">{formatGermanPrice(PRICING.arena_30.weekday.single)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Fr - Sa</span>
                                    <span className="font-bold text-lg">{formatGermanPrice(PRICING.arena_30.weekend.single)}</span>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/10">
                                <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Team (4 Spieler)</h4>
                                <div className="flex justify-between items-center mb-2">
                                    <span>Mo - Do</span>
                                    <span className="font-bold text-lg text-primary">{formatGermanPrice(PRICING.arena_30.weekday.team)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Fr - Sa</span>
                                    <span className="font-bold text-lg text-primary">{formatGermanPrice(PRICING.arena_30.weekend.team)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href="/buchen">Ticket Buchen</Link>
                        </Button>
                    </CardFooter>
                </Card>

                {/* VR Arena 60 Min */}
                <Card className="flex flex-col border-primary/50 bg-primary/5 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1">BELIEBT</div>
                    <CardHeader>
                        <CardTitle className="text-2xl text-primary">VR Arena <span className="text-white text-lg ml-1">(60 Min)</span></CardTitle>
                        <CardDescription>Das volle Erlebnis für dich und deine Freunde</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Einzelspieler</h4>
                                <div className="flex justify-between items-center mb-2">
                                    <span>Mo - Do</span>
                                    <span className="font-bold text-lg">{formatGermanPrice(PRICING.arena_60.weekday.single)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Fr - Sa</span>
                                    <span className="font-bold text-lg">{formatGermanPrice(PRICING.arena_60.weekend.single)}</span>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/10">
                                <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Team (4 Spieler)</h4>
                                <div className="flex justify-between items-center mb-2">
                                    <span>Mo - Do</span>
                                    <span className="font-bold text-lg text-primary">{formatGermanPrice(PRICING.arena_60.weekday.team)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Fr - Sa</span>
                                    <span className="font-bold text-lg text-primary">{formatGermanPrice(PRICING.arena_60.weekend.team)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                            <Link href="/buchen">Ticket Buchen</Link>
                        </Button>
                    </CardFooter>
                </Card>

                {/* Simulatoren */}
                <Card className="flex flex-col border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl">Simulatoren & Arcade</CardTitle>
                        <CardDescription>Fliegen, Fahren und Klassiker</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">VR Simulator</h4>
                                <div className="flex justify-between items-center mb-2">
                                    <span>Mo - Do</span>
                                    <span className="font-bold text-lg">{formatGermanPrice(PRICING.simulator.weekday)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Fr - Sa</span>
                                    <span className="font-bold text-lg">{formatGermanPrice(PRICING.simulator.weekend)}</span>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/10">
                                <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Kinder Arcade</h4>
                                <div className="flex justify-between items-center mb-2">
                                    <span>Mo - Do</span>
                                    <span className="font-bold text-lg">{formatGermanPrice(PRICING.arcade.weekday)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Fr - Sa</span>
                                    <span className="font-bold text-lg">{formatGermanPrice(PRICING.arcade.weekend)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="w-full text-center py-2 px-4 rounded-md border border-border text-muted-foreground text-sm font-medium">
                            Vor Ort bezahlbar
                        </div>
                    </CardFooter>
                </Card>
            </div>

            <p className="text-sm text-muted-foreground mt-6 text-center max-w-2xl mx-auto">
                * Bei Gruppen über 4 Personen wird unser intelligentes Buchungssystem den günstigeren Team-Tarif für jede volle 4er-Gruppe automatisch anwenden.
            </p>

            {/* Birthday Section */}
            <div className="mt-12">
                <Link href="/BirthdayFlyer.pdf" target="_blank" rel="noopener noreferrer" className="block group">
                    <Card className="border-secondary/50 bg-secondary/5 backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,0,255,0.2)] hover:border-secondary">
                        <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent pointer-events-none" />
                        <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative z-10">
                            <div className="flex-1 space-y-4">
                                <h3 className="text-3xl font-bold text-secondary group-hover:underline">Wir feiern Geburtstage!</h3>
                                <p className="text-lg text-muted-foreground group-hover:text-foreground transition-colors">
                                    Auf der Suche nach dem ultimativen Geburtstagserlebnis in Ingolstadt? Feiere bei Spielnova für einen unvergesslichen Tag voller Gaming, VR-Abenteuer und Spaß.
                                </p>
                            </div>
                            <div className="flex-none">
                                <Button asChild size="lg" className="h-14 px-8 text-lg font-bold bg-secondary text-secondary-foreground shadow-[0_0_15px_rgba(255,0,255,0.4)] group-hover:bg-secondary/90">
                                    <span className="pointer-events-none">Flyer Ansehen</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="mt-20">
                <SectionHeader title="Häufige Fragen" subtitle="Infos zu Buchung, Kleidung und mehr." centered={false} />
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <h3 className="font-bold text-lg">Muss ich Erfahrung mitbringen?</h3>
                        <p className="text-muted-foreground">Nein, überhaupt nicht! Unser Personal gibt dir eine ausführliche Einweisung, bevor es losgeht.</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-bold text-lg">Was soll ich anziehen?</h3>
                        <p className="text-muted-foreground">Wir empfehlen bequeme Kleidung und flaches Schuhwerk, da du dich in den Arenen viel bewegen wirst.</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-bold text-lg">Kann ich als Brillenträger spielen?</h3>
                        <p className="text-muted-foreground">Ja, unsere VR-Brillen bieten genug Platz für die meisten Sehbrillen. Kontaktlinsen sind jedoch komfortabler.</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-bold text-lg">Ab welchem Alter?</h3>
                        <p className="text-muted-foreground">Die meisten Spiele sind ab 10 oder 12 Jahren geeignet. Shooter sind generell ab 16 Jahren.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
