import { SectionHeader } from "@/components/section-header";
import { GameCard } from "@/components/game-card";

// Mock Data for Escape Rooms
const escapeRooms = [
    {
        id: "escape-1",
        title: "Escape the Pyramids",
        description: "Erkundet eine alte Pyramide und findet den Schatz des Pharaos, bevor die Luft ausgeht. Ein klassisches Abenteuer für Rätselfreunde.",
        imageSrc: "/placeholder-pyramid.jpg",
        duration: "60 Min",
        players: "2-4 Spieler",
        difficulty: "Mittel",
        slug: "escape-pyramids",
    },
    {
        id: "escape-2",
        title: "Space Station Tiberia",
        description: "Ihr seid auf einer verlassenen Raumstation gefangen. Stellt die Energie wieder her und entkommt, bevor der Meteorit einschlägt.",
        imageSrc: "/placeholder-station.jpg",
        duration: "60 Min",
        players: "2-4 Spieler",
        difficulty: "Schwer",
        slug: "space-station",
    },
    {
        id: "escape-3",
        title: "Alice in Wonderland",
        description: "Folgt dem weißen Kaninchen in eine verrückte Welt voller Magie und seltsamer Rätsel. Perfekt für Familien und Einsteiger.",
        imageSrc: "/placeholder-alice.jpg",
        duration: "45 Min",
        players: "2-5 Spieler",
        difficulty: "Leicht",
        slug: "alice-wonderland",
    },
    {
        id: "escape-4",
        title: "Horror House",
        description: "Nichts für schwache Nerven. Entkommt aus dem Spukhaus und löst das Geheimnis der verschwundenen Familie.",
        imageSrc: "/placeholder-horror.jpg",
        duration: "60 Min",
        players: "2-4 Spieler",
        difficulty: "Schwer",
        slug: "horror-house",
    },
];

export default function EscapeRoomsPage() {
    return (
        <div className="container py-20 px-4 md:px-6">
            <SectionHeader
                title="VR Escape Rooms"
                subtitle="Teamwork ist gefragt. Löst gemeinsam Rätsel in fantastischen Welten, die in der Realität unmöglich wären."
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {escapeRooms.map((game) => (
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
