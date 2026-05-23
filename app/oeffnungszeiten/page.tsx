import { SectionHeader } from "@/components/section-header"
import { Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { OPENING_HOURS } from "@/lib/hours"

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
                                <span className="text-muted-foreground">{OPENING_HOURS.visual.weekdaysLabel}</span>
                                <span className="font-semibold">{OPENING_HOURS.visual.weekdays}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-muted-foreground">{OPENING_HOURS.visual.saturdayLabel}</span>
                                <span className="font-semibold">{OPENING_HOURS.visual.saturday}</span>
                            </div>
                            <div className="flex justify-between pt-2 text-muted-foreground/60">
                                <span>{OPENING_HOURS.visual.sundayLabel}</span>
                                <span>{OPENING_HOURS.visual.sunday}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 p-4 rounded-lg bg-secondary/10 border border-secondary/20 text-center">
                    <p className="font-medium text-secondary">
                        {OPENING_HOURS.visual.holidaysLabel}:
                    </p>
                    <p className="text-xl font-bold mt-1">{OPENING_HOURS.visual.holidays}</p>
                </div>
            </div>
        </div>
    )
}
