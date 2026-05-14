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
 *    - imageSrc:        Either a path to an image in /public/ (e.g. "/my-game-poster.jpg")
 *                       or an https:// URL from the internet.
 *                       → If using /public/: upload the file there first.
 *                       → If using a URL: the domain must be listed in next.config.ts → images → remotePatterns.
 *    - duration:        e.g. "30 Minuten", "30–60 Minuten"
 *    - players:         e.g. "2–4 Spieler", "2–8 Spieler"
 *    - difficulty:      "Leicht" | "Mittel" | "Schwer" | "Extrem"
 *    - minAge:          e.g. "10 Jahre", "16 Jahre"
 *    - features:        List of up to 4 bullet points shown on the detail page
 *    - category:        "shooter" or "escape" — determines which listing page it appears on
 *    - bookingMode:     Always match category: "shooter" or "escape"
 *    - trailerUrl:      (optional) YouTube link for the game trailer, e.g.
 *                       "https://www.youtube.com/watch?v=XXXXXXXXXXX"
 *                       Leave out the field entirely if there is no trailer yet.
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
    trailerUrl?: string
}

export const GAMES: Game[] = [

    // ──────────────────────────────────────────────
    // VR SHOOTER GAMES
    // ──────────────────────────────────────────────

    {
        slug: 'arizona-ss',
        category: 'shooter',
        bookingMode: 'shooter',
        title: 'Arizona Sunshine',
        trailerUrl: 'https://www.youtube.com/watch?v=O2ErTEHPSCg',
        description: 'Das Remake von Arizona Sunshine® hebt das preisgekrönte Originalspiel auf ein neues Niveau – komplett neu aufgebaut',
        longDescription: `mit atemberaubender VR-Grafik sowie VR-Kampfmechaniken und Waffen der nächsten Generation. 
Stelle dich den Untoten allein oder gemeinsam mit bis zu drei weiteren Überlebenden in einem postapokalyptischen Südwesten der USA, der von Zombies überrannt wurde.
In diesem intensiven VR-Shooter müsst ihr als Team zusammenarbeiten, um zu überleben. Deckt euch gegenseitig den Rücken, teilt Munition und findet den Weg durch die verlassene Stadt zur Evakuierungszone.`,
        imageSrc: '/Arizona1.avif',
        duration: '30–60 Minuten',
        players: '1–4 Spieler',
//        difficulty: 'Mittel',
        minAge: '12 Jahre',
        features: [
            'Intense Co-op VR Action',
            'Haptisches Feedback',
            'Team-basiertes Gameplay',
            'Realistische Waffenmechanik',
        ],
    },

    {
        slug: 'after-the-fall',
        category: 'shooter',
        bookingMode: 'shooter',
        title: 'After the Fall',
        trailerUrl: 'https://youtu.be/C-alM4V4VmM?t=3',
        description: 'an epic multiplayer VR action FPS with seamless, co-operative gameplay at its core that pits up to four players against a vast, hostile VR world in a raging fight for survival.',
        longDescription: `An epic multiplayer VR action FPS with seamless, co-operative gameplay at its core that pits up to four players against a vast, hostile VR world in a raging fight for survival.

Set in the ice-covered ruins of LA nearly 20 years after the apocalypse, After the Fall combines a living, breathing VR world shared with players from all over the world, a cinematic and atmospheric campaign, action-packed solo and multiplayer gameplay, and endgame built from the ground up for VR.

2005, LA. A generation has passed since a mysterious outbreak caused by the excessive use of designer drugs birthed the terrible Snowbreed, infesting our cities and collapsing civilization.
You, one of the survivors seemingly immune to the side-effects of the substances, are humanity's last hope of resurgence. 
Explore the remains of a civilization ground to a halt in an alternate 1980s, craft deadly weapons and wield devastating powers with real-life movements as you develop your combat style, and join forces with players worldwide as you go head to head with relentless hordes and larger-than-life bosses in a bid to take back the city. It?s time.`,
        imageSrc: '/After_the_fall1.jpg',
        duration: '30 - 60 Minuten',
        players: '1–4 Spieler',
//        difficulty: 'Mittel',
        minAge: '12 Jahre',
        features: [
            'Sci-Fi Setting',
            'Laserwaffen',
            'Bosskämpfe',
            'Highscore-Jagd',
        ],
    },

    // ──────────────────────────────────────────────
    // VR ESCAPE ROOMS
    // ──────────────────────────────────────────────

    {
        slug: 'mansion',
        category: 'escape',
        bookingMode: 'escape',
        title: 'Mansion of Death',
        trailerUrl: 'https://www.youtube.com/watch?v=aUcChw5q7tY',
        description: 'Escape the mansion… or join its secrets',
        longDescription: `Mansion of Death ist ein Multiplayer-Virtual-Reality-Horrorspiel, das die Spieler tief in ein mysteriöses, verwunschenes Herrenhaus entführt.
Als 45-minütiges Escape-Room-Erlebnis konzipiert, fordert es Gruppen dazu heraus, gemeinsam Rätsel zu lösen, Geheimnisse aufzudecken und die Schrecken im Inneren zu überleben.
        
Jede Ecke des Herrenhauses birgt ein neues Geheimnis. Die Spieler müssen kommunizieren, das Haus erkunden und blitzschnell denken, um zu entkommen, bevor die Zeit abläuft.
Mit seinem immersiven Setting und seiner spannungsgeladenen Atmosphäre bietet „Mansion of Death“ eine einzigartige Mischung aus Horror und kniffligen Herausforderungen.
        
Dieses VR-Erlebnis ist perfekt für Nervenkitzel-Suchende und Escape-Room-Fans, die nach ihrem nächsten unvergesslichen Abenteuer suchen.`,
        imageSrc: '/mansion1.jpg',
        duration: '30 - 60 Minuten',
        players: '1–4 Spieler',
//        difficulty: 'Mittel',
        minAge: '12 Jahre',
        features: [
            'Ecape rooms',
            'Thriller',
            'Eine Atmosphäre voller Geheimnisse und Abenteuer',
        ],
    },

    {
        slug: 'riddle-of-ruins',
        category: 'escape',
        bookingMode: 'escape',
        title: 'Riddle of Ruins',
        trailerUrl: 'https://www.youtube.com/watch?v=bhRei3Q9QSU',
        description: 'Betritt den uralten Tempel, löse tödliche Rätsel, entdecke verborgene Schätze und beweise dich im ultimativen VR-Abenteuer.',
        longDescription: `Willkommen, Abenteurer, bei „Riddle of Ruins: VR Adventure“! Schlüpft in die Rolle wagemutiger Teilnehmer, die sich Woche für Woche in einen uralten Tempel wagen, um ihren Verstand und ihr Glück auf die Probe zu stellen.
Löst knifflige Rätsel, deckt verborgene Geheimnisse auf und jagt nach verlorenen Schätzen – in einem vollkommen immersiven Virtual-Reality-Erlebnis.
Seid ihr bereit, die Herausforderung anzunehmen und zum ultimativen Tempelforscher zu werden? Schließt euch uns an und findet es heraus! `,
        imageSrc: '/riddle2.png',
        duration: '30 - 60 Minuten',
        players: '1–4 Spieler',
//        difficulty: 'Mittel',
        minAge: '7 Jahre',
        features: [
            'Abenteuer',
            'Rätsel',
            'Zeitdruck',
            'Teamwork erforderlich',
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
