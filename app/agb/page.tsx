import type { ReactNode } from "react"
import { SectionHeader } from "@/components/section-header"

// ─────────────────────────────────────────────────────────────────────────────
// The canonical text of these AGB is maintained in /AGB.md at the repo root.
// Edit that file, then mirror any changes here.
// ─────────────────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground border-b border-border/40 pb-2">{title}</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed">{children}</div>
        </section>
    )
}

function Sub({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="space-y-1.5 pl-1">
            <h3 className="font-semibold text-foreground/90">{title}</h3>
            <div className="space-y-2">{children}</div>
        </div>
    )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex gap-3">
            <span className="font-semibold text-foreground/80 shrink-0 w-8">{label}</span>
            <span>{children}</span>
        </div>
    )
}

export default function AGBPage() {
    return (
        <div className="container py-20 px-4 md:px-6">
            <SectionHeader
                title="Allgemeine Geschäftsbedingungen"
                subtitle="Spielnova GmbH · Am Westpark 6 · 85057 Ingolstadt"
            />

            <div className="max-w-3xl mx-auto space-y-10 mt-10">

                {/* Meta */}
                <p className="text-sm text-muted-foreground/60 italic">Stand: Mai 2026</p>

                {/* § 1 */}
                <Section title="§ 1 Geltungsbereich">
                    <p>
                        Für die Geschäftsbeziehung zwischen der Spielnova GmbH (nachfolgend „Spielnova") und dem Kunden
                        gelten ausschließlich die nachfolgenden Allgemeinen Geschäftsbedingungen in ihrer zum Zeitpunkt
                        der Buchung gültigen Fassung.
                    </p>
                </Section>

                {/* § 2 */}
                <Section title="§ 2 Vertragsschluss">
                    <p>
                        Die Darstellung der Angebote auf der Website stellt kein rechtlich bindendes Angebot, sondern
                        eine unverbindliche Einladung zur Buchung dar. Mit Abschluss des Buchungsvorgangs und
                        vollständig erfolgter Zahlung kommt ein verbindlicher Vertrag zwischen dem Kunden und der
                        Spielnova GmbH zustande.
                    </p>
                </Section>

                {/* § 3 */}
                <Section title="§ 3 Widerrufsrecht, Stornierungen und Umbuchungen">
                    <Sub title="(1) Kein gesetzliches Widerrufsrecht">
                        <p>
                            Gemäß § 312g Abs. 2 Nr. 9 BGB besteht für Verträge zur Erbringung von Dienstleistungen im
                            Zusammenhang mit Freizeitbetätigungen kein gesetzliches Widerrufsrecht, wenn der Vertrag
                            für die Erbringung einen spezifischen Termin oder Zeitraum vorsieht. Da es sich bei den von
                            der Spielnova GmbH angebotenen Leistungen um termingebundene Freizeitaktivitäten handelt,
                            besteht kein 14-tägiges Widerrufsrecht.{' '}
                            <strong className="text-foreground/90">Mit Abschluss der Buchung wird diese verbindlich.</strong>
                        </p>
                    </Sub>

                    <Sub title="(2) Vertragliche Stornierungs- und Umbuchungsregelungen">
                        <p>
                            Unabhängig vom fehlenden gesetzlichen Widerrufsrecht räumt die Spielnova GmbH folgende
                            vertragliche Stornierungs- und Umbuchungsmöglichkeiten ein:
                        </p>
                        <div className="bg-card/40 border border-border/30 rounded-xl p-4 space-y-3 mt-2">
                            <Row label="a)">
                                <><strong className="text-foreground/90">Mehr als 48 Stunden</strong> vor dem gebuchten Termin:
                                Der Kunde kann die Buchung kostenfrei stornieren oder einmalig auf einen anderen
                                verfügbaren Termin umbuchen.</>
                            </Row>
                            <Row label="b)">
                                <><strong className="text-foreground/90">Zwischen 24 und 48 Stunden</strong> vor dem gebuchten Termin:
                                Eine Stornierung ist ausgeschlossen. Eine einmalige Umbuchung auf einen anderen
                                verfügbaren Termin ist möglich.</>
                            </Row>
                            <Row label="c)">
                                <><strong className="text-foreground/90">Weniger als 24 Stunden</strong> vor dem gebuchten Termin:
                                Stornierungen und reguläre Umbuchungen sind ausgeschlossen. Der gebuchte Termin
                                verfällt ersatzlos. Eine Umbuchung aus Kulanz kann im Einzelfall durch die
                                Spielnova GmbH gewährt werden. Ein Anspruch hierauf besteht nicht.</>
                            </Row>
                        </div>
                        <p>
                            Umbuchungen erfolgen ausschließlich nach Verfügbarkeit und können nur für gleichwertige
                            Leistungen vorgenommen werden.
                        </p>
                    </Sub>

                    <Sub title="(3) Ausfall oder Nichtdurchführbarkeit durch die Spielnova GmbH">
                        <p>
                            Kann die gebuchte Leistung aufgrund technischer Defekte, höherer Gewalt, Sicherheitsgründen
                            oder sonstiger unvorhersehbarer Umstände nicht durchgeführt werden, hat der Kunde Anspruch
                            auf eine vollständige Rückerstattung des gezahlten Betrages oder alternativ auf eine
                            kostenfreie Umbuchung auf einen verfügbaren Ersatztermin.
                        </p>
                        <p>Weitergehende Ansprüche des Kunden sind ausgeschlossen, soweit gesetzlich zulässig.</p>
                    </Sub>

                    <Sub title="(4) Kontakt für Stornierungen und Umbuchungen">
                        <p>
                            Anfragen zu Stornierungen, Umbuchungen, Reklamationen oder sonstigen Anliegen sind per
                            E-Mail an{' '}
                            <a href="mailto:support@spielnova.de" className="text-primary hover:underline">
                                support@spielnova.de
                            </a>{' '}
                            zu richten.
                        </p>
                    </Sub>
                </Section>

                {/* § 4 */}
                <Section title="§ 4 Preise und Zahlung">
                    <p>
                        Alle angegebenen Preise verstehen sich in Euro inklusive der gesetzlichen Mehrwertsteuer. Die
                        Zahlung erfolgt im Rahmen des Online-Buchungsvorgangs per Kreditkarte oder PayPal über den
                        Zahlungsdienstleister Stripe. Bei Walk-in-Buchungen vor Ort sind Barzahlung und Kartenzahlung
                        möglich.
                    </p>
                </Section>

                {/* § 5 */}
                <Section title="§ 5 Haftung und Gesundheitshinweise">
                    <Sub title="(1) Teilnahmevoraussetzungen">
                        <p>
                            Die Nutzung der VR-Erlebnisse setzt voraus, dass der Kunde volljährig ist oder in
                            Begleitung einer erziehungsberechtigten Person teilnimmt. Spielnova behält sich vor,
                            Personen von der Teilnahme auszuschließen, die offensichtlich unter dem Einfluss von
                            Alkohol oder Drogen stehen oder deren Gesundheitszustand eine sichere Nutzung nicht
                            erlaubt.
                        </p>
                    </Sub>
                    <Sub title="(2) Haftungsausschluss">
                        <p>
                            Spielnova haftet nicht für Schäden, die durch unsachgemäße Nutzung der Geräte,
                            Nichtbeachtung der Sicherheitsanweisungen oder durch Vorerkrankungen des Kunden entstehen.
                            Kunden mit bekannter Epilepsie, Herzerkrankungen oder anderen relevanten Vorerkrankungen
                            nehmen auf eigenes Risiko teil. Auf die gesonderten Epilepsie-Hinweise auf der Website wird
                            ausdrücklich hingewiesen.
                        </p>
                    </Sub>
                </Section>

                {/* § 6 */}
                <Section title="§ 6 Datenschutz">
                    <p>
                        Die Verarbeitung personenbezogener Daten erfolgt ausschließlich im Rahmen der geltenden
                        Datenschutzgesetze, insbesondere der DSGVO. Weitere Informationen sind der{' '}
                        <a href="/datenschutz" className="text-primary hover:underline">Datenschutzerklärung</a>{' '}
                        auf der Website zu entnehmen.
                    </p>
                </Section>

                {/* § 7 */}
                <Section title="§ 7 Salvatorische Klausel">
                    <p>
                        Sollte eine Bestimmung dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der
                        übrigen Bestimmungen unberührt.
                    </p>
                </Section>

                {/* § 8 */}
                <Section title="§ 8 Gerichtsstand und anwendbares Recht">
                    <p>
                        Es gilt ausschließlich deutsches Recht. Gerichtsstand für alle Streitigkeiten aus oder im
                        Zusammenhang mit diesen AGB ist Ingolstadt, sofern der Kunde Kaufmann, juristische Person des
                        öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen ist.
                    </p>
                </Section>

                {/* Footer note */}
                <div className="border-t border-border/30 pt-6 text-sm text-muted-foreground/50 space-y-1">
                    <p>Diese AGB können jederzeit aktualisiert werden. Die jeweils aktuelle Fassung ist auf dieser Seite abrufbar.</p>
                    <p>Kontakt: <a href="mailto:info@spielnova.de" className="hover:text-primary transition-colors">info@spielnova.de</a></p>
                </div>

            </div>
        </div>
    )
}
