import Image from "next/image"
import Link from "next/link"
import { Clock, Users, Zap, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ExperienceDetailProps {
    title: string
    description: string
    longDescription: string
    imageSrc: string
    duration: string
    players: string
    difficulty: string
    minAge: string
    features: string[]
}

export function ExperienceDetail({
    title,
    description,
    longDescription,
    imageSrc,
    duration,
    players,
    difficulty,
    minAge,
    features
}: ExperienceDetailProps) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section of Detail Page */}
            <div className="relative h-[50vh] min-h-[400px] max-h-[560px] w-full overflow-hidden">
                <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    sizes="100vw"
                    className="object-cover object-center"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                    <div className="container mx-auto">
                        <Badge className="mb-4 bg-primary text-primary-foreground text-lg px-4 py-1">{difficulty}</Badge>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-white drop-shadow-lg">{title}</h1>
                        <p className="text-xl md:text-2xl text-gray-200 max-w-3xl drop-shadow-md">{description}</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto py-12 px-4 md:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Über das Erlebnis</h2>
                            <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line">
                                {longDescription}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-4">Das erwartet euch</h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Sidebar Info & Booking */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm shadow-lg">
                            <h3 className="text-xl font-bold mb-6">Details</h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Dauer</div>
                                        <div className="font-semibold">{duration}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Users className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Spieler</div>
                                        <div className="font-semibold">{players}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Zap className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Mindestalter</div>
                                        <div className="font-semibold">{minAge}</div>
                                    </div>
                                </div>
                            </div>

                            <Button asChild size="lg" className="w-full text-lg font-bold h-14 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                                <Link href="/buchen">
                                    Termin Buchen
                                </Link>
                            </Button>
                            <p className="text-xs text-center text-muted-foreground mt-4">
                                Online buchen und Platz sichern.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
