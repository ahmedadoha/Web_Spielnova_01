import Image from "next/image"
import Link from "next/link"
import { Clock, Users, ShieldCheck, Zap, CheckCircle } from "lucide-react"

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
    trailerUrl?: string
}

/** Convert any YouTube URL format to an embed URL, or return null. */
function toEmbedUrl(url: string): string | null {
    const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/)
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?rel=0`
    const shortMatch = url.match(/youtu\.be\/([^?]+)/)
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?rel=0`
    if (url.includes('youtube.com/embed/')) return url
    return null
}

const difficultyColor: Record<string, string> = {
    Leicht:  'bg-green-500/20  text-green-400  border-green-500/30',
    Mittel:  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Schwer:  'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Extrem:  'bg-red-500/20    text-red-400    border-red-500/30',
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
    features,
    trailerUrl,
}: ExperienceDetailProps) {
    const embedUrl = trailerUrl ? toEmbedUrl(trailerUrl) : null
    const badgeCls = difficultyColor[difficulty] ?? 'bg-primary/20 text-primary border-primary/30'

    return (
        <div className="flex flex-col min-h-screen">

            {/* ── HERO ─────────────────────────────────────────────── */}
            <div className="relative h-[75vh] min-h-[520px] max-h-[780px] w-full overflow-hidden">
                <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    sizes="100vw"
                    className="object-cover object-center"
                    priority
                />
                {/* Multi-stop gradient: nearly opaque at bottom, fades to subtle at top */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 via-40% to-black/20" />

                {/* Hero content pinned to the bottom */}
                <div className="absolute inset-x-0 bottom-0 pb-10 md:pb-14">
                    <div className="container mx-auto px-4 md:px-6">
                        <Badge className={`mb-4 border text-sm font-semibold px-3 py-1 ${badgeCls}`}>
                            {difficulty}
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-2xl mb-4 leading-none">
                            {title}
                        </h1>
                        {/* Marketing one-liner */}
                        <p className="text-lg md:text-xl text-white/85 max-w-2xl leading-snug mb-8 drop-shadow-lg">
                            {description}
                        </p>
                        <Button
                            asChild
                            size="lg"
                            className="h-13 px-8 text-lg font-bold shadow-[0_0_20px_rgba(0,240,255,0.5)] hover:shadow-[0_0_30px_rgba(0,240,255,0.7)] transition-shadow"
                        >
                            <Link href="/buchen">Jetzt Buchen</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── CONTENT ──────────────────────────────────────────── */}
            <div className="container mx-auto py-14 px-4 md:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* ── Left: story + trailer + highlights ── */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Long description */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-foreground">Über das Erlebnis</h2>
                            <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line">
                                {longDescription}
                            </p>
                        </section>

                        {/* Trailer video — only rendered when a URL is provided */}
                        {embedUrl && (
                            <section>
                                <h2 className="text-2xl font-bold mb-4 text-foreground">Trailer</h2>
                                <div className="aspect-video rounded-xl overflow-hidden border border-border shadow-[0_0_40px_rgba(0,0,0,0.6)]">
                                    <iframe
                                        src={embedUrl}
                                        title={`${title} – Trailer`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        className="w-full h-full"
                                    />
                                </div>
                            </section>
                        )}

                        {/* Feature highlights */}
                        <section>
                            <h2 className="text-2xl font-bold mb-6 text-foreground">Das erwartet euch</h2>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/40 p-4">
                                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                        <span className="text-sm font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>

                    {/* ── Right: details card + booking ── */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 rounded-2xl border border-border bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">

                            {/* Card header */}
                            <div className="px-6 py-5 border-b border-border/60">
                                <h3 className="text-lg font-bold">Details</h3>
                            </div>

                            {/* Stats */}
                            <div className="px-6 py-5 space-y-5">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Clock className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Dauer</div>
                                        <div className="font-semibold">{duration}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Users className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Spieler</div>
                                        <div className="font-semibold">{players}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Mindestalter</div>
                                        <div className="font-semibold">{minAge}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Zap className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Schwierigkeit</div>
                                        <div className="font-semibold">{difficulty}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Booking CTA */}
                            <div className="px-6 pb-6 pt-2">
                                <Button
                                    asChild
                                    size="lg"
                                    className="w-full text-lg font-bold h-14 shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-shadow"
                                >
                                    <Link href="/buchen">Termin Buchen</Link>
                                </Button>
                                <p className="text-xs text-center text-muted-foreground mt-3">
                                    Online buchen und Platz sichern.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
