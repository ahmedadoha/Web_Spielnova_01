"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight, Gamepad2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"


// Helper for random stars
function StarField() {
    const [stars, setStars] = useState<{ id: number; top: number; left: number; size: number; duration: number }[]>([])

    useEffect(() => {
        const newStars = Array.from({ length: 70 }).map((_, i) => ({
            id: i,
            top: Math.random() * 100,
            left: Math.random() * 100,
            size: Math.random() * 2 + 1,
            duration: Math.random() * 3 + 2,
        }))
        setStars(newStars)
    }, [])

    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    initial={{ opacity: 0.1, scale: 0.8 }}
                    animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.8, 1.2, 0.8] }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute rounded-full bg-white"
                    style={{
                        top: `${star.top}%`,
                        left: `${star.left}%`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                    }}
                />
            ))}
        </div>
    )
}

export function HeroSection() {
    return (
        <section className="relative flex min-h-[90vh] flex-col items-center justify-start pt-16 md:pt-20 overflow-hidden bg-background text-center md:min-h-screen">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black">

                {/* Random Stars */}
                <StarField />

                {/* Glows */}
                <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />
                <div className="absolute left-1/4 top-1/3 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/10 blur-[80px]" />
            </div>

            <div className="container relative z-10 mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-4 mb-20"
                >
                    <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
                        <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                        Neu in Ingolstadt
                    </div>

                    <div className="flex justify-center">
                        <img
                            src="/logo.png"
                            alt="Spielnova Logo"
                            className="w-full max-w-[600px] h-auto drop-shadow-[0_0_30px_rgba(0,240,255,0.3)] animate-in zoom-in duration-1000 mix-blend-screen [mask-image:radial-gradient(closest-side,black_60%,transparent_100%)]"
                        />
                    </div>

                    <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl lg:text-2xl">
                        Tauche ein in die Zukunft der Unterhaltung. Erlebe Virtual Reality Shooter, Escape Rooms und Simulatoren im West Park Ingolstadt.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button asChild size="lg" className="h-14 px-8 text-lg font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-transform hover:scale-105">
                            <Link href="/buchen">
                                Jetzt Buchen <ChevronRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button 
                            variant="outline" 
                            size="lg" 
                            className="h-14 px-8 text-lg hover:bg-white/5"
                            onClick={() => {
                                document.getElementById('erlebnisse')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                        >
                            <Gamepad2 className="mr-2 h-5 w-5" />
                            Spiele entdecken
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground z-0"
            >
                <span className="sr-only">Scroll down</span>
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xs uppercase tracking-widest text-[10px]">Scroll</span>
                    <div className="h-10 w-[1px] bg-gradient-to-b from-transparent via-primary to-transparent"></div>
                </div>
            </motion.div>
        </section>
    )
}
