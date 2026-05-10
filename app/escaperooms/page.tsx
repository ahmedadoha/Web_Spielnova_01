import { SectionHeader } from "@/components/section-header";
import { GameCard } from "@/components/game-card";
import { ESCAPE_GAMES } from "@/lib/games";

export default function EscapeRoomsPage() {
    return (
        <div className="container py-20 px-4 md:px-6">
            <SectionHeader
                title="VR Escape Rooms"
                subtitle="Teamwork ist gefragt. Löst gemeinsam Rätsel in fantastischen Welten, die in der Realität unmöglich wären."
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ESCAPE_GAMES.map((game) => (
                    <GameCard
                        key={game.slug}
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
