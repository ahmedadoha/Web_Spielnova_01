import { Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionHeader } from "@/components/section-header"

export default function PricingPage() {
    return (
        <div className="container py-20 px-4 md:px-6">
            <SectionHeader
                title="Preise & Pakete"
                subtitle="Transparent und fair. Wähle das passende Paket für dein Erlebnis."
            />

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* Standard Ticket */}
                <Card className="flex flex-col border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl">VR Arena Ticket</CardTitle>
                        <CardDescription>Für Einzelspieler & kleine Gruppen</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="text-4xl font-bold mb-6">35€ <span className="text-sm font-normal text-muted-foreground">/ Person</span></div>
                        <ul className="space-y-3">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> 60 Minuten Spielzeit</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Freie Spielwahl (Shooter oder Escape)</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Einweisung durch Personal</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Kostenloses Schließfach</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href="/buchen">Ticket Buchen</Link>
                        </Button>
                    </CardFooter>
                </Card>

                {/* Group Ticket */}
                <Card className="flex flex-col border-primary/50 bg-primary/5 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1">BELIEBT</div>
                    <CardHeader>
                        <CardTitle className="text-2xl text-primary">Team Paket</CardTitle>
                        <CardDescription>Perfekt für 4 Spieler</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="text-4xl font-bold mb-6">120€ <span className="text-sm font-normal text-muted-foreground">/ Gruppe</span></div>
                        <ul className="space-y-3">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Alles aus dem Standard Ticket</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Exklusive Arena-Nutzung</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> 1 Freigetränk pro Person</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Ersparnis von 20€</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                            <Link href="/buchen">Team Buchen</Link>
                        </Button>
                    </CardFooter>
                </Card>

                {/* Simulator Ticket */}
                <Card className="flex flex-col border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl">Simulator Ride</CardTitle>
                        <CardDescription>Paraglider, Jet oder Motorrad</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="text-4xl font-bold mb-6">10€ <span className="text-sm font-normal text-muted-foreground">/ Fahrt</span></div>
                        <ul className="space-y-3">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Ca. 10 Minuten Erlebnis</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Freie Wahl des Simulators</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Keine Reservierung nötig</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/kontakt">Vor Ort bezahlbar</Link>
                        </Button>
                    </CardFooter>
                </Card>
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
