import { SectionHeader } from "@/components/section-header"

export default function ImpressumPage() {
    return (
        <div className="container py-20 px-4 md:px-6">
            <SectionHeader title="Impressum" subtitle="Angaben gemäß § 5 TMG" />

            <div className="max-w-3xl mx-auto space-y-8 text-muted-foreground">
                <div>
                    <h3 className="font-bold text-lg text-foreground mb-2">Betreiber der Website</h3>
                    <p>Spielnova GmbH (Beispiel)</p>
                    <p>Am Westpark 6</p>
                    <p>85057 Ingolstadt</p>
                </div>

                <div>
                    <h3 className="font-bold text-lg text-foreground mb-2">Kontakt</h3>
                    <p>Telefon: +49 123 456789</p>
                    <p>E-Mail: support@spielnova.de</p>
                </div>

                <div>
                    <h3 className="font-bold text-lg text-foreground mb-2">Vertretungsberechtigte Geschäftsführer</h3>
                    <p>Max Mustermann (Beispiel)</p>
                </div>

                <div>
                    <h3 className="font-bold text-lg text-foreground mb-2">Registereintrag</h3>
                    <p>Eintragung im Handelsregister.</p>
                    <p>Registergericht: Amtsgericht Ingolstadt</p>
                    <p>Registernummer: HRB 12345</p>
                </div>

                <div>
                    <h3 className="font-bold text-lg text-foreground mb-2">Umsatzsteuer-ID</h3>
                    <p>Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:</p>
                    <p>DE 123456789</p>
                </div>
            </div>
        </div>
    )
}
