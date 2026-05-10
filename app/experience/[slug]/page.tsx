import { ExperienceDetail } from "@/components/experience-detail";
import { GAME_BY_SLUG } from "@/lib/games";

// Next.js 15+ passes params as a Promise — must be awaited in async page components.
export default async function ExperiencePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const game = GAME_BY_SLUG[slug];

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
