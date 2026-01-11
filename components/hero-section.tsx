"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight, Gamepad2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
    return (
        <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-background text-center md:min-h-screen">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
                <div className="absolute left-1/4 top-1/4 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/20 blur-[100px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            <div className="container relative z-10 mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-6"
                >
                    <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
                        <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                        Neu in Ingolstadt
                    </div>

                    <h1 className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl md:text-8xl lg:text-9xl font-mono">
                        SPIEL<span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">NOVA</span>
                    </h1>

                    <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl lg:text-2xl">
                        Tauche ein in die Zukunft der Unterhaltung. Erlebe Virtual Reality Shooter, Escape Rooms und Simulatoren im West Park Ingolstadt.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button asChild size="lg" className="h-14 px-8 text-lg font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-transform hover:scale-105">
                            <Link href="/buchen">
                                Jetzt Buchen <ChevronRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg hover:bg-white/5">
                            <Link href="/shooter_games">
                                <Gamepad2 className="mr-2 h-5 w-5" />
                                Spiele entdecken
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted-foreground"
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
