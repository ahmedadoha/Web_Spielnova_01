import { SectionHeader } from "@/components/section-header";
import { GameCard } from "@/components/game-card";
import { SHOOTER_GAMES } from "@/lib/games";

export default function ShooterGamesPage() {
    return (
        <div className="container py-20 px-4 md:px-6">
            <SectionHeader
                title="VR Shooter Arena"
                subtitle="Adrenalin pur. Kämpfe Seite an Seite mit deinen Freunden in unseren immersiven Free-Roaming Arenen."
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {SHOOTER_GAMES.map((game) => (
                    <GameCard
                        key={game.slug}
                        title={game.title}
                        description={game.description}
                        imageSrc={game.imageSrc}
                        duration={game.duration}
                        players={game.players}
                        href={`/experience/${game.slug}`}
                    />
                ))}
            </div>
        </div>
    );
}
