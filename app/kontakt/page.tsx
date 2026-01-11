"use client"

import { Mail, MapPin, Phone, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SectionHeader } from "@/components/section-header"
import { Card, CardContent } from "@/components/ui/card"

export default function ContactPage() {
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
                                    <p className="text-muted-foreground">Spielnova VR Center</p>
                                    <p className="text-muted-foreground">West Park Shopping Center</p>
                                    <p className="text-muted-foreground">Am Westpark 6, 85057 Ingolstadt</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                            <CardContent className="p-6 flex items-start space-x-4">
                                <Clock className="h-6 w-6 text-primary mt-1" />
                                <div>
                                    <h3 className="font-bold mb-1">Öffnungszeiten</h3>
                                    <p className="text-muted-foreground">Mo - Do: 14:00 - 20:00 Uhr</p>
                                    <p className="text-muted-foreground">Fr: 14:00 - 22:00 Uhr</p>
                                    <p className="text-muted-foreground">Sa: 10:00 - 22:00 Uhr</p>
                                    <p className="text-muted-foreground">So: 12:00 - 20:00 Uhr</p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-4">
                            <Button variant="outline" className="flex-1 gap-2">
                                <Phone className="h-4 w-4" /> Anrufen
                            </Button>
                            <Button variant="outline" className="flex-1 gap-2">
                                <Mail className="h-4 w-4" /> Email
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-card/30 p-8 rounded-xl border border-white/10 backdrop-blur-sm">
                    <h3 className="text-2xl font-bold mb-6">Schreib uns eine Nachricht</h3>
                    <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="Dein Name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="deine@email.de" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Betreff</Label>
                            <Input id="subject" placeholder="Worum geht es?" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Nachricht</Label>
                            <Textarea id="message" placeholder="Deine Nachricht an uns..." className="min-h-[150px]" />
                        </div>
                        <Button className="w-full bg-primary text-primary-foreground font-bold hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                            Nachricht Senden
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
