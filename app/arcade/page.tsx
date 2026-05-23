import { SectionHeader } from "@/components/section-header";
import { GameCard } from "@/components/game-card";

const arcadeGames = [
    {
        id: "arcade-1",
        title: "Air Hockey",
        description: "Der Klassiker in jeder Spielhalle. Fordere deine Freunde zu einem schnellen Match am Air Hockey Tisch heraus.",
        imageSrc: "/AirHockey.jpg",
        duration: "Variabel",
        players: "2 Spieler",
        href: "/arcade",
    },
    {
        id: "arcade-2",
        title: "Basketball Maschine",
        description: "Wer wirft die meisten Körbe? Teste deine Zielgenauigkeit und stelle einen neuen Highscore auf.",
        imageSrc: "/basketball.jpg",
        duration: "Variabel",
        players: "1-2 Spieler",
        href: "/arcade",
    },
    {
        id: "arcade-3",
        title: "Retro Racing",
        description: "Klassische Arcade-Rennspiele für den schnellen Spaß zwischendurch.",
        imageSrc: "/Motor_Cycle.jpg",
        duration: "Variabel",
        players: "1-2 Spieler",
        href: "/arcade",
    },
];

export default function ArcadePage() {
    return (
        <div className="container py-20 px-4 md:px-6">
            <SectionHeader
                title="Arcade Games"
                subtitle="Klassischer Spielspaß für zwischendurch. Ideal um Wartezeiten zu überbrücken oder sich aufzuwärmen."
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {arcadeGames.map((game) => (
                    <GameCard
                        key={game.id}
                        title={game.title}
                        description={game.description}
                        imageSrc={game.imageSrc}
                        duration={game.duration}
                        players={game.players}
                        href={game.href}
                        hideFooter={true}
                    />
                ))}
            </div>

            <div className="mt-12 text-center">
                <p className="text-xl font-medium text-muted-foreground bg-primary/10 inline-block px-6 py-3 rounded-full border border-primary/20">
                    ℹ️ Bezahlung und Spielen vor Ort — keine Vorab-Buchung erforderlich
                </p>
            </div>
        </div>
    );
}
