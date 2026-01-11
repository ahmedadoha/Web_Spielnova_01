import { ExperienceDetail } from "@/components/experience-detail";
import { notFound } from "next/navigation";

// This is a simplified "database" of games. In a real app, this would come from Supabase or CMS.
// We map slugs to game data.
const gamesData: Record<string, any> = {
    "zombie-apocalypse": {
        title: "Zombie Apocalypse VR",
        description: "Überlebe die Zombiehorden in diesem intensiven Koop-Shooter.",
        longDescription: `Die Welt steht am Abgrund. Ein tödliches Virus hat den Großteil der Menschheit in blutrünstige Zombies verwandelt. Ihr seid die letzte Hoffnung.
    
    In diesem intensiven VR-Shooter müsst ihr als Team zusammenarbeiten, um zu überleben. Deckt euch gegenseitig den Rücken, teilt Munition und findet den Weg durch die verlassene Stadt zur Evakuierungszone.`,
        imageSrc: "/placeholder-zombie.jpg",
        duration: "45 Minuten",
        players: "2-4 Spieler",
        difficulty: "Mittel",
        minAge: "16 Jahre",
        features: ["Freies Bewegen (Free Roam)", "Haptisches Feedback", "Team-basiertes Gameplay", "Realistische Waffenmechanik"]
    },
    "robot-warfare": {
        title: "Robot Warfare",
        description: "Tretet als Elite-Einheit gegen eine Armee von KI-Roboter an.",
        longDescription: "Die Maschinen haben die Kontrolle übernommen. Dringt in das Hauptquartier der KI ein und deaktiviert den Kern. Doch Vorsicht: Die Roboter sind schwer bewaffnet und taktisch klug.",
        imageSrc: "/placeholder-robot.jpg",
        duration: "30 Minuten",
        players: "2-4 Spieler",
        difficulty: "Schwer",
        minAge: "12 Jahre",
        features: ["Sci-Fi Setting", "Laserwaffen", "Bosskämpfe", "Highscore-Jagd"]
    },
    "escape-pyramids": {
        title: "Escape the Pyramids",
        description: "Erkundet eine alte Pyramide und findet den Schatz des Pharaos.",
        longDescription: "Ihr seid ein Team von Archäologen, die eine bislang unentdeckte Pyramide erforschen. Doch kaum habt ihr die Grabkammer betreten, fällt die Tür hinter euch ins Schloss. Ihr habt 60 Minuten Zeit, um die Rätsel des Pharaos zu lösen und zu entkommen.",
        imageSrc: "/placeholder-pyramid.jpg",
        duration: "60 Minuten",
        players: "2-4 Spieler",
        difficulty: "Mittel",
        minAge: "10 Jahre",
        features: ["Keine Gewalt", "Knifflige Logikrätsel", "Atmosphärische Umgebung", "Teamwork erforderlich"]
    }
};

export default function ExperiencePage({ params }: { params: { slug: string } }) {
    const game = gamesData[params.slug];

    if (!game) {
        // Ideally we would fetch dynamic data here, but for static mock we handle missing slugs
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
