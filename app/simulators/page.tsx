import { SectionHeader } from "@/components/section-header";
import { GameCard } from "@/components/game-card";

const simulators = [
    {
        id: "sim-1",
        title: "VR Paraglider",
        description: "Fliege über atemberaubende Landschaften. Spüre den Wind und die Freiheit des Fliegens in unserem realistischen Paragliding-Simulator.",
        imageSrc: "/placeholder-paraglider.jpg",
        duration: "5-10 Min",
        players: "1 Spieler",
        href: "/simulators", // No detail page for simulators for now
    },
    {
        id: "sim-2",
        title: "360° Kampfjet",
        description: "Übernimm die Kontrolle über einen Kampfjet. Der Simulator rotiert um 360 Grad für das ultimative G-Force Erlebnis.",
        imageSrc: "/placeholder-jet.jpg",
        duration: "5-10 Min",
        players: "1 Spieler",
        href: "/simulators",
    },
    {
        id: "sim-3",
        title: "VR Motorrad",
        description: "Rase mit Höchstgeschwindigkeit über futuristische Rennstrecken auf unserem Motorrad-Simulator mit Feedback-System.",
        imageSrc: "/placeholder-moto.jpg",
        duration: "5-10 Min",
        players: "1 Spieler",
        href: "/simulators",
    },
];

export default function SimulatorsPage() {
    return (
        <div className="container py-20 px-4 md:px-6">
            <SectionHeader
                title="VR Simulatoren"
                subtitle="Erlebe Bewegung und Geschwindigkeit hautnah. Unsere Simulatoren bieten ein realistisches physisches Feedback."
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {simulators.map((game) => (
                    <GameCard
                        key={game.id}
                        title={game.title}
                        description={game.description}
                        imageSrc={game.imageSrc}
                        duration={game.duration}
                        players={game.players}
                        href={game.href}
                    />
                ))}
            </div>
        </div>
    );
}
