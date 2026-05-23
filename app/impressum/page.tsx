import { SectionHeader } from "@/components/section-header"
import { CONTACT_INFO } from "@/lib/contact"

export default function ImpressumPage() {
    return (
        <div className="container py-20 px-4 md:px-6">
            <SectionHeader title="Impressum" subtitle="Angaben gemäß § 5 TMG" />

            <div className="max-w-3xl mx-auto space-y-8 text-muted-foreground">
                <div>
                    <h3 className="font-bold text-lg text-foreground mb-2">Betreiber der Website</h3>
                    <p>{CONTACT_INFO.companyName}</p>
                    <p>{CONTACT_INFO.address.street}</p>
                    <p>{CONTACT_INFO.address.cityZip}</p>
                </div>

                <div>
                    <h3 className="font-bold text-lg text-foreground mb-2">Kontakt</h3>
                    <p>Telefon: {CONTACT_INFO.phone.display}</p>
                    <p>E-Mail: {CONTACT_INFO.email.support}</p>
                </div>

                <div>
                    <h3 className="font-bold text-lg text-foreground mb-2">Vertretungsberechtigte Geschäftsführer</h3>
                    <p>Wafaa Elshaarawi</p>
                </div>

                <div>
                    <h3 className="font-bold text-lg text-foreground mb-2">Registereintrag</h3>
                    <p>Eintragung im Handelsregister.</p>
                    <p>Registergericht: Amtsgericht Ingolstadt</p>
                    <p>Registernummer: HRB 12696</p>
                </div>

                <div>
                    <h3 className="font-bold text-lg text-foreground mb-2">Umsatzsteuer-ID</h3>
                    <p>Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:</p>
                    <p>DE 459413303</p>
                </div>
            </div>
        </div>
    )
}
