import { SectionHeader } from "@/components/section-header"
import { Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function OpeningHoursPage() {
    return (
        <div className="container py-20 px-4 md:px-6">
            <SectionHeader title="Öffnungszeiten" subtitle="Wann wir für dich da sind" />

            <div className="max-w-xl mx-auto">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-8 space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">Reguläre Zeiten</h3>
                        </div>

                        <div className="space-y-4 text-lg">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-muted-foreground">Mo. - Fr.</span>
                                <span className="font-semibold">14:00 - 20:00 Uhr</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-muted-foreground">Samstag</span>
                                <span className="font-semibold">10:00 - 20:00 Uhr</span>
                            </div>
                            <div className="flex justify-between pt-2 text-muted-foreground/60">
                                <span>Sonntag</span>
                                <span>Geschlossen (Einkaufzentrum)</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 p-4 rounded-lg bg-secondary/10 border border-secondary/20 text-center">
                    <p className="font-medium text-secondary">
                        In Schulferien:
                    </p>
                    <p className="text-xl font-bold mt-1">10:00 - 20:00 Uhr</p>
                </div>
            </div>
        </div>
    )
}
