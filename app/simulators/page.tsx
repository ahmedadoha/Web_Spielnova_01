"use client"

import { useState } from "react";
import { SectionHeader } from "@/components/section-header";
import { GameCard } from "@/components/game-card";
import { X } from "lucide-react";

const simulators = [
    {
        id: "sim-1",
        title: "VR Paraglider",
        description: "Fliege über atemberaubende Landschaften. Spüre den Wind und die Freiheit des Fliegens in unserem realistischen Paragliding-Simulator.",
        imageSrc: "/Paraglider.jpg",
        videoSrc: "/New Arrival Super Series - VR Paraglider.mp4",
        duration: "5-10 Min",
        players: "1 Spieler",
        href: "/simulators", // No detail page for simulators for now
    },
    {
        id: "sim-2",
        title: "VR Super Fighter",
        description: "Übernimm die Kontrolle über einen Super Fighter. Der Simulator rotiert um 360 Grad für das ultimative G-Force Erlebnis.",
        imageSrc: "/Super_fighter.jpg",
        videoSrc: "/VR_Fighter_Jet.mp4",
        duration: "5-10 Min",
        players: "1 Spieler",
        href: "/simulators",
    },
];

export default function SimulatorsPage() {
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    return (
        <div className="container py-20 px-4 md:px-6 relative">
            <SectionHeader
                title="VR Simulatoren"
                subtitle="Erlebe Bewegung und Geschwindigkeit hautnah. Unsere Simulatoren bieten ein realistisches physisches Feedback."
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-5xl mx-auto">
                {simulators.map((game) => (
                    <GameCard
                        key={game.id}
                        title={game.title}
                        description={game.description}
                        imageSrc={game.imageSrc}
                        duration={game.duration}
                        players={game.players}
                        href={game.href}
                        hideFooter={true}
                        onClickImage={() => setSelectedVideo(game.videoSrc)}
                    />
                ))}
            </div>

            <div className="mt-12 text-center">
                <p className="text-xl font-medium text-muted-foreground bg-primary/10 inline-block px-6 py-3 rounded-full border border-primary/20">
                    ℹ️ Bezahlung und Spielen vor Ort
                </p>
            </div>

            {/* Video Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" onClick={() => setSelectedVideo(null)}>
                    <div className="relative w-full max-w-5xl aspect-video rounded-xl overflow-hidden border border-primary/30 shadow-[0_0_50px_rgba(0,240,255,0.2)]" onClick={(e) => e.stopPropagation()}>
                        <button 
                            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black p-2 rounded-full text-white transition-colors"
                            onClick={() => setSelectedVideo(null)}
                        >
                            <X size={24} />
                        </button>
                        <video 
                            src={selectedVideo} 
                            controls 
                            autoPlay 
                            className="w-full h-full object-contain bg-black"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
