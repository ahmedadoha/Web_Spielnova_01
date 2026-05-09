import { ExperienceDetail } from "@/components/experience-detail";
import { GAME_BY_SLUG } from "@/lib/games";

export default function ExperiencePage({ params }: { params: { slug: string } }) {
    const game = GAME_BY_SLUG[params.slug];

    if (!game) {
        return (
            <div className="container py-20 text-center">
                <h1 className="text-4xl font-bold mb-4">Erlebnis nicht gefunden</h1>
                <p className="text-muted-foreground">Das gesuchte Erlebnis existiert nicht oder wurde verschoben.</p>
            </div>
        )
    }

    return (
        <ExperienceDetail {...game} />
    );
}
