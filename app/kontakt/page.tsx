"use client"

import React from "react"
import { Mail, MapPin, Phone, Clock, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SectionHeader } from "@/components/section-header"
import { Card, CardContent } from "@/components/ui/card"

// Ändere diese Nummer, um sie auf der gesamten Seite zu aktualisieren
const CONTACT_PHONE = "+49 15754497518"

export default function ContactPage() {
    const [name, setName] = React.useState("")
    const [email, setEmail] = React.useState("")
    const [subject, setSubject] = React.useState("")
    const [message, setMessage] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [success, setSuccess] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Basic client-side validation
        if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
            setError("Bitte fülle alle Felder aus.")
            return
        }

        setLoading(true)

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, subject, message }),
            })
            const data = await res.json()

            if (data.success) {
                setSuccess(true)
            } else {
                setError(data.error || "Unbekannter Fehler. Bitte versuche es erneut.")
            }
        } catch {
            setError("Verbindungsfehler. Bitte überprüfe deine Internetverbindung.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container py-20 px-4 md:px-6">
            <SectionHeader
                title="Kontakt & Anfahrt"
                subtitle="Du hast Fragen oder möchtest ein Event planen? Schreib uns oder komm vorbei."
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Info */}
                <div className="space-y-8">
                    <div className="space-y-6">
                        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                            <CardContent className="p-6 flex items-start space-x-4">
                                <MapPin className="h-6 w-6 text-primary mt-1" />
                                <div>
                                    <h3 className="font-bold mb-1">Anschrift</h3>
                                    <p className="text-muted-foreground">Spielnova VR</p>
                                    <p className="text-muted-foreground">West Park Einkaufzentrum, OG</p>
                                    <p className="text-muted-foreground">Am Westpark 6, 85057 Ingolstadt</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                            <CardContent className="p-6 flex items-start space-x-4">
                                <Clock className="h-6 w-6 text-primary mt-1" />
                                <div>
                                    <h3 className="font-bold mb-1">Öffnungszeiten</h3>
                                    <p className="text-muted-foreground">Mo. - Fr. : 14:00 - 20:00 Uhr</p>
                                    <p className="text-muted-foreground">Sa: 10:00 - 20:00 Uhr</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                            <CardContent className="p-6 flex items-start space-x-4">
                                <Phone className="h-6 w-6 text-primary mt-1" />
                                <div>
                                    <h3 className="font-bold mb-1">Telefon / WhatsApp</h3>
                                    <p className="text-muted-foreground">{CONTACT_PHONE}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Button variant="outline" className="w-full gap-2" asChild>
                                <a href={`tel:${CONTACT_PHONE.replace(/\s+/g, '')}`}>
                                    <Phone className="h-4 w-4" /> Anrufen
                                </a>
                            </Button>
                            <Button variant="outline" className="w-full gap-2 bg-[#25D366] text-white hover:bg-[#128C7E] hover:text-white border-transparent" asChild>
                                <a href={`https://wa.me/${CONTACT_PHONE.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                    WhatsApp
                                </a>
                            </Button>
                            <Button variant="outline" className="w-full gap-2" asChild>
                                <a href="mailto:support@spielnova.de">
                                    <Mail className="h-4 w-4" /> Email
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-card/30 p-8 rounded-xl border border-white/10 backdrop-blur-sm">
                    {success ? (
                        <div className="flex flex-col items-center justify-center h-full py-12 text-center space-y-4">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                            <h3 className="text-2xl font-bold">Nachricht gesendet!</h3>
                            <p className="text-muted-foreground max-w-sm">
                                Vielen Dank, {name.split(" ")[0]}! Wir haben deine Nachricht erhalten und melden uns bald bei dir.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSuccess(false)
                                    setName(""); setEmail(""); setSubject(""); setMessage("")
                                }}
                            >
                                Neue Nachricht schreiben
                            </Button>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-2xl font-bold mb-6">Schreib uns eine Nachricht</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="Dein Name"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="deine@email.de"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Betreff</Label>
                                    <Input
                                        id="subject"
                                        placeholder="Worum geht es?"
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Nachricht</Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Deine Nachricht an uns..."
                                        className="min-h-[150px]"
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="rounded-md bg-red-500/15 border border-red-500/40 px-4 py-3 text-sm text-red-400">
                                        {error}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full bg-primary text-primary-foreground font-bold hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                                    disabled={loading}
                                >
                                    {loading ? <><Loader2 className="animate-spin mr-2 h-4 w-4" />Wird gesendet...</> : "Nachricht Senden"}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
