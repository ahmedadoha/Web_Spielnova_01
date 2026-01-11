import { SectionHeader } from "@/components/section-header"

export default function PrivacyPage() {
    return (
        <div className="container py-20 px-4 md:px-6">
            <SectionHeader title="Datenschutzerklärung" subtitle="Informationen zum Umgang mit deinen Daten" />

            <div className="max-w-3xl mx-auto space-y-6 text-muted-foreground">
                <h3 className="font-bold text-lg text-foreground">1. Datenschutz auf einen Blick</h3>
                <p>
                    Allgemeine Hinweise: Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie unsere Website besuchen.
                </p>

                <h3 className="font-bold text-lg text-foreground">2. Datenerfassung auf unserer Website</h3>
                <p>
                    <strong>Cookies:</strong> Unsere Internetseiten verwenden teilweise so genannte Cookies. Cookies richten auf Ihrem Rechner keinen Schaden an und enthalten keine Viren.
                </p>
                <p>
                    <strong>Kontaktformular:</strong> Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.
                </p>
            </div>
        </div>
    )
}
