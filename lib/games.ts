/**
 * ============================================================
 * SPIELNOVA — CENTRALIZED GAME CATALOG
 * ============================================================
 *
 * HOW TO ADD OR CHANGE A GAME (no database or programming needed):
 *
 * 1. Copy any existing entry below and paste it at the end of
 *    the correct category (shooter or escape).
 *
 * 2. Fill in each field:
 *    - slug:            URL-safe unique ID, e.g. "my-new-game" (no spaces, no capitals)
 *    - title:           Display name shown to customers
 *    - description:     One-sentence teaser (shown on listing cards)
 *    - longDescription: Full story/description (shown on the detail page)
 *    - imageSrc:        Path to the image in /public/, e.g. "/my-game-poster.jpg"
 *                       → Upload the image file to the /public/ folder first
 *    - duration:        e.g. "30 Minuten", "30–60 Minuten"
 *    - players:         e.g. "2–4 Spieler", "2–8 Spieler"
 *    - difficulty:      "Leicht" | "Mittel" | "Schwer" | "Extrem"
 *    - minAge:          e.g. "10 Jahre", "16 Jahre"
 *    - features:        List of up to 4 bullet points shown on the detail page
 *    - category:        "shooter" or "escape" — determines which listing page it appears on
 *    - bookingMode:     Always match category: "shooter" or "escape"
 *
 * 3. Save the file. The change appears instantly on the website.
 *
 * TO REMOVE A GAME: Delete its entire entry (from the opening { to its closing },).
 * TO RENAME A GAME: Change `title`. Do NOT change `slug` — that would break existing URLs.
 * TO SWAP THE POSTER: Change `imageSrc` to the new filename and upload the new image to /public/.
 *
 * ============================================================
 */

export interface Game {
    slug: string
    title: string
    description: string
    longDescription: string
    imageSrc: string
    duration: string
    players: string
    difficulty: string
    minAge: string
    features: string[]
    category: 'shooter' | 'escape'
    bookingMode: 'shooter' | 'escape'
}

export const GAMES: Game[] = [

    // ──────────────────────────────────────────────
    // VR SHOOTER GAMES
    // ──────────────────────────────────────────────

    {
        slug: 'zombie-apocalypse',
        category: 'shooter',
        bookingMode: 'shooter',
        title: 'Zombie Apocalypse VR',
        description: 'Überlebe die Zombiehorden in diesem intensiven Koop-Shooter. Arbeitet zusammen, deckt euch gegenseitig und findet den Weg in die Sicherheit.',
        longDescription: `Die Welt steht am Abgrund. Ein tödliches Virus hat den Großteil der Menschheit in blutrünstige Zombies verwandelt. Ihr seid die letzte Hoffnung.

In diesem intensiven VR-Shooter müsst ihr als Team zusammenarbeiten, um zu überleben. Deckt euch gegenseitig den Rücken, teilt Munition und findet den Weg durch die verlassene Stadt zur Evakuierungszone.`,
        imageSrc: '/Shooter_games.jpg',
        duration: '30–60 Minuten',
        players: '2–8 Spieler',
        difficulty: 'Mittel',
        minAge: '16 Jahre',
        features: [
            'Freies Bewegen (Free Roam)',
            'Haptisches Feedback',
            'Team-basiertes Gameplay',
            'Realistische Waffenmechanik',
        ],
    },

    {
        slug: 'robot-warfare',
        category: 'shooter',
        bookingMode: 'shooter',
        title: 'Robot Warfare',
        description: 'Tretet als Elite-Einheit gegen eine Armee von KI-Robotern an. Nutzt futuristische Waffen und taktisches Vorgehen, um den Kern zu zerstören.',
        longDescription: 'Die Maschinen haben die Kontrolle übernommen. Dringt in das Hauptquartier der KI ein und deaktiviert den Kern. Doch Vorsicht: Die Roboter sind schwer bewaffnet und taktisch klug. Nur präzises Teamwork führt euch zum Sieg.',
        imageSrc: '/Shooter_games.jpg',
        duration: '30 Minuten',
        players: '2–8 Spieler',
        difficulty: 'Schwer',
        minAge: '12 Jahre',
        features: [
            'Sci-Fi Setting',
            'Laserwaffen',
            'Bosskämpfe',
            'Highscore-Jagd',
        ],
    },

    {
        slug: 'space-marines',
        category: 'shooter',
        bookingMode: 'shooter',
        title: 'Space Marines',
        description: 'Verteidigt eure Raumstation gegen Alien-Invasoren. Schwerelosigkeit und intensive Feuergefechte erwarten euch.',
        longDescription: 'Die Aliens haben die Raumstation übernommen. Als Elite-Squad der Space Marines seid ihr die letzte Hoffnung der Menschheit. Kämpft euch durch schwebende Korridore und gewichtslose Kampfzonen in einem der intensivsten VR-Erlebnisse, das wir anbieten. Kommunikation und Deckung sind alles.',
        imageSrc: '/Shooter_games.jpg',
        duration: '45 Minuten',
        players: '2–8 Spieler',
        difficulty: 'Extrem',
        minAge: '16 Jahre',
        features: [
            'Schwerelosigkeits-Mechanik',
            'Alien-Gegner',
            'Free Roam Arena',
            'Intensives Team-Gameplay',
        ],
    },

    {
        slug: 'wild-west',
        category: 'shooter',
        bookingMode: 'shooter',
        title: 'Wild West Shootout',
        description: 'Ein klassisches Duell im Wilden Westen. Wer zieht am schnellsten? Lustiger und kompetitiver Shooter für Gruppen.',
        longDescription: 'Lasst uns sehen, wer der schnellste Schütze im Wilden Westen ist. In diesem kompetitiven VR-Shooter messt ihr euch in schnellen Duellen, schießt Flaschen von Zäunen und verteidigt eure Stadt gegen Banditen. Ideal für Gruppen, die Spaß und freundlichen Wettbewerb suchen — perfekt auch für Einsteiger.',
        imageSrc: '/Shooter_games.jpg',
        duration: '20 Minuten',
        players: '2–8 Spieler',
        difficulty: 'Leicht',
        minAge: '10 Jahre',
        features: [
            'Kompetitives Gameplay',
            'Wilder-Westen-Setting',
            'Schnelle Runden — ideal zum Aufwärmen',
            'Perfekt für Einsteiger',
        ],
    },

    // ──────────────────────────────────────────────
    // VR ESCAPE ROOMS
    // ──────────────────────────────────────────────

    {
        slug: 'escape-pyramids',
        category: 'escape',
        bookingMode: 'escape',
        title: 'Escape the Pyramids',
        description: 'Erkundet eine alte Pyramide und findet den Schatz des Pharaos, bevor die Luft ausgeht. Ein klassisches Abenteuer für Rätselfreunde.',
        longDescription: 'Ihr seid ein Team von Archäologen, die eine bislang unentdeckte Pyramide erforschen. Doch kaum habt ihr die Grabkammer betreten, fällt die Tür hinter euch ins Schloss. Ihr habt 60 Minuten Zeit, um die Rätsel des Pharaos zu lösen und zu entkommen.',
        imageSrc: '/adventure1.jpg',
        duration: '60 Minuten',
        players: '2–8 Spieler',
        difficulty: 'Mittel',
        minAge: '10 Jahre',
        features: [
            'Keine Gewalt',
            'Knifflige Logikrätsel',
            'Atmosphärische Umgebung',
            'Teamwork erforderlich',
        ],
    },

    {
        slug: 'space-station',
        category: 'escape',
        bookingMode: 'escape',
        title: 'Space Station Tiberia',
        description: 'Ihr seid auf einer verlassenen Raumstation gefangen. Stellt die Energie wieder her und entkommt, bevor der Meteorit einschlägt.',
        longDescription: 'Der Reaktor der Raumstation Tiberia ist ausgefallen. In 60 Minuten wird ein Meteorit einschlagen. Als gestrandete Astronauten müsst ihr zusammenarbeiten, die Energiezellen aktivieren und das Rettungskapsel starten, bevor es zu spät ist. Jede Sekunde zählt.',
        imageSrc: '/adventure1.jpg',
        duration: '60 Minuten',
        players: '2–8 Spieler',
        difficulty: 'Schwer',
        minAge: '14 Jahre',
        features: [
            'Sci-Fi Atmosphäre',
            'Komplexe Rätsel',
            'Extremer Zeitdruck',
            'Starkes Teamwork erforderlich',
        ],
    },

    {
        slug: 'alice-wonderland',
        category: 'escape',
        bookingMode: 'escape',
        title: 'Alice in Wonderland',
        description: 'Folgt dem weißen Kaninchen in eine verrückte Welt voller Magie und seltsamer Rätsel. Perfekt für Familien und Einsteiger.',
        longDescription: 'Folgt Alice durch den Kaninchenbau in eine Welt, in der nichts so ist, wie es scheint. Trinkt die Zaubertränke, löst die verrückten Rätsel der Herzkönigin und findet den Weg zurück in die reale Welt. Das perfekte Erlebnis für Familien und Gruppen, die etwas Besonderes suchen.',
        imageSrc: '/adventure1.jpg',
        duration: '45 Minuten',
        players: '2–8 Spieler',
        difficulty: 'Leicht',
        minAge: '8 Jahre',
        features: [
            'Familienfreundlich',
            'Märchen-Setting',
            'Farbenfrohe Umgebung',
            'Keine Gewalt — ideal für alle Altersgruppen',
        ],
    },

    {
        slug: 'horror-house',
        category: 'escape',
        bookingMode: 'escape',
        title: 'Horror House',
        description: 'Nichts für schwache Nerven. Entkommt aus dem Spukhaus und löst das Geheimnis der verschwundenen Familie.',
        longDescription: 'Das alte Haus am Ende der Straße birgt ein dunkles Geheimnis. Eine Familie ist vor 20 Jahren spurlos verschwunden. Wagt euch hinein, löst die gruseligen Rätsel und entkommt, bevor der Geist der Familie euch für immer hält. Unser gruseligstes und atmosphärischstes Erlebnis — nur für Mutige.',
        imageSrc: '/adventure1.jpg',
        duration: '60 Minuten',
        players: '2–8 Spieler',
        difficulty: 'Schwer',
        minAge: '16 Jahre',
        features: [
            'Horror-Atmosphäre',
            'Immersives Storytelling',
            'Gruselige Rätsel',
            'Nur für Mutige — Mindestalter 16',
        ],
    },
]

// ── Derived lookups (used by the rest of the codebase) ────────────────────────

/** Find a game by its URL slug. Returns undefined if not found. */
export const GAME_BY_SLUG: Record<string, Game> = Object.fromEntries(
    GAMES.map(g => [g.slug, g])
)

/** All shooter games in catalog order. */
export const SHOOTER_GAMES: Game[] = GAMES.filter(g => g.category === 'shooter')

/** All escape room games in catalog order. */
export const ESCAPE_GAMES: Game[] = GAMES.filter(g => g.category === 'escape')

/** Games grouped by category — used by the booking wizard. */
export const GAMES_BY_MODE: Record<'shooter' | 'escape', Game[]> = {
    shooter: SHOOTER_GAMES,
    escape: ESCAPE_GAMES,
}
