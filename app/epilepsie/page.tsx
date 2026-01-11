import { SectionHeader } from "@/components/section-header"
import { AlertTriangle } from "lucide-react"

export default function EpilepsyPage() {
    return (
        <div className="container py-20 px-4 md:px-6">
            <SectionHeader title="Epilepsie Warnung" subtitle="Wichtige Gesundheitsinformationen" />

            <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-xl flex gap-4 items-start">
                    <AlertTriangle className="h-8 w-8 text-destructive flex-shrink-0" />
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-foreground">Warnung zu photosensitiver Epilepsie</h3>
                        <p className="text-muted-foreground">
                            Bei einem sehr kleinen Prozentsatz von Menschen können Anfälle auftreten, wenn sie bestimmten visuellen Reizen ausgesetzt sind, wie z. B. blinkenden Lichtern oder Mustern, die in Videospielen vorkommen können. Auch Menschen, die keine Geschichte von Anfällen oder Epilepsie haben, können unter diesen Bedingungen leiden.
                        </p>
                        <p className="font-bold text-foreground">Symptome können sein:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            <li>Schwindelgefühl</li>
                            <li>Sehstörungen</li>
                            <li>Augen- oder Muskelzucken</li>
                            <li>Verlust des Bewusstseins</li>
                            <li>Desorientierung</li>
                            <li>Unwillkürliche Bewegungen</li>
                        </ul>
                        <p className="text-muted-foreground">
                            Wenn Sie eines dieser Symptome beim Spielen verspüren, <strong>BEENDEN SIE SOFORT DAS SPIEL</strong> und konsultieren Sie einen Arzt.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
