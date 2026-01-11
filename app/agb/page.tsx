import { SectionHeader } from "@/components/section-header"

export default function AGBPage() {
    return (
        <div className="container py-20 px-4 md:px-6">
            <SectionHeader title="Allgemeine Geschäftsbedingungen" subtitle="AGB der Spielnova GmbH" />

            <div className="max-w-3xl mx-auto space-y-6 text-muted-foreground">
                <h3 className="font-bold text-lg text-foreground">1. Geltungsbereich</h3>
                <p>
                    Für die Geschäftsbeziehung zwischen der Spielnova GmbH und dem Kunden gelten ausschließlich die nachfolgenden Allgemeinen Geschäftsbedingungen in ihrer zum Zeitpunkt der Bestellung gültigen Fassung.
                </p>

                <h3 className="font-bold text-lg text-foreground">2. Vertragsschluss</h3>
                <p>
                    Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot, sondern einen unverbindlichen Online-Katalog dar.
                </p>

                <h3 className="font-bold text-lg text-foreground">3. Buchung und Stornierung</h3>
                <p>
                    Gebuchte Termine sind verbindlich. Eine kostenfreie Stornierung ist bis zu 48 Stunden vor dem Termin möglich.
                </p>
            </div>
        </div>
    )
}
