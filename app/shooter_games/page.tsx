import { SectionHeader } from "@/components/section-header";
import { GameCard } from "@/components/game-card";

// Mock Data for Shooter Games
const shooters = [
    {
        id: "shooter-1",
        title: "Zombie Apocalypse VR",
        description: "Überlebe die Zombiehorden in diesem intensiven Koop-Shooter. Arbeitet zusammen, deckt euch gegenseitig und findet den Weg in die Sicherheit.",
        imageSrc: "/placeholder-zombie.jpg",
        duration: "30-45 Min",
        players: "2-4 Spieler",
        difficulty: "Mittel",
        slug: "zombie-apocalypse",
    },
    {
        id: "shooter-2",
        title: "Robot Warfare",
        description: "Tretet als Elite-Einheit gegen eine Armee von KI-Roboter an. Nutzt futuristische Waffen und taktisches Vorgehen, um den Kern zu zerstören.",
        imageSrc: "/placeholder-robot.jpg",
        duration: "30 Min",
        players: "2-4 Spieler",
        difficulty: "Schwer",
        slug: "robot-warfare",
    },
    {
        id: "shooter-3",
        title: "Space Marines",
        description: "Verteidigt eure Raumstation gegen Alien-Invasoren. Schwerelosigkeit und intensive Feuergefechte erwarten euch.",
        imageSrc: "/placeholder-space.jpg",
        duration: "45 Min",
        players: "2-6 Spieler",
        difficulty: "Extrem",
        slug: "space-marines",
    },
    {
        id: "shooter-4",
        title: "Wild West Shootout",
        description: "Ein klassisches Duell im Wilden Westen. Wer zieht am schnellsten? Lustiger und kompetitiver Shooter für Gruppen.",
        imageSrc: "/placeholder-western.jpg",
        duration: "20 Min",
        players: "2-4 Spieler",
        difficulty: "Leicht",
        slug: "wild-west",
    },
];

export default function ShooterGamesPage() {
    return (
        <div className="container py-20 px-4 md:px-6">
            <SectionHeader
                title="VR Shooter Arena"
                subtitle="Adrenalin pur. Kämpfe Seite an Seite mit deinen Freunden in unseren immersiven Free-Roaming Arenen."
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {shooters.map((game) => (
                    <GameCard
                        key={game.id}
                        title={game.title}
                        description={game.description}
                        imageSrc={game.imageSrc}
                        duration={game.duration}
                        players={game.players}
                        difficulty={game.difficulty}
                        href={`/experience/${game.slug}`}
                    />
                ))}
            </div>
        </div>
    );
}
