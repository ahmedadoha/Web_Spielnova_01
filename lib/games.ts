/**
 * ============================================================
 * SPIELNOVA — CENTRALIZED GAME CATALOG
 * ============================================================
 *
 * HOW TO ADD OR CHANGE A GAME (no database or programming needed):
 *
 * 1. Copy any existing entry below and paste it at the end of
 * the correct category (shooter or escape).
 *
 * 2. Fill in each field:
 * - slug:            URL-safe unique ID, e.g. "my-new-game" (no spaces, no capitals)
 * - title:           Display name shown to customers
 * - description:     One-sentence teaser (shown on listing cards)
 * - longDescription: Full story/description (shown on the detail page)
 * - imageSrc:        Either a path to an image in /public/ (e.g. "/my-game-poster.jpg")
 * or an https:// URL from the internet.
 * → If using /public/: upload the file there first.
 * → If using a URL: the domain must be listed in next.config.ts → images → remotePatterns.
 * - duration:        e.g. "30 Minuten", "30–60 Minuten"
 * - players:         e.g. "2–4 Spieler", "2–8 Spieler"
 * - minAge:          e.g. "10 Jahre", "16 Jahre"
 * - features:        List of up to 4 bullet points shown on the detail page
 * - category:        "shooter" or "escape" — determines which listing page it appears on
 * - bookingMode:     Always match category: "shooter" or "escape"
 * - trailerUrl:      (optional) YouTube link for the game trailer, e.g.
 * "https://www.youtube.com/watch?v=XXXXXXXXXXX"
 * Leave out the field entirely if there is no trailer yet.
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
        description: 'Das preisgekrönte VR-Zombie-Original, jetzt komplett neu aufgebaut! Überlebe die sengende Hitze der Post-Apokalypse mit atemberaubender Grafik und Next-Gen-Waffen-Action.',
        longDescription: `Arizona Sunshine® Remake hebt das legendäre Survival-Erlebnis auf ein völlig neues Niveau. Die Welt wird von Untoten (den "Freds") überrannt, doch als du eine menschliche Stimme aus dem Radio hörst, keimt neue Hoffnung auf. Ausgerüstet mit durch echte Bewegungen gesteuerten Waffen und knapper Munition kämpfst du dich durch die post-apokalyptischen Landschaften des Grand Canyon State. Erlebe die komplette Story inklusive aller Erweiterungen (Dead Man DLC, The Damned DLC u.v.m.), entweder alleine oder im packenden Koop-Modus mit Freunden. Das brandneue Mutilations-System macht den Überlebenskampf intensiver, blutiger und realistischer als je zuvor!`,
        imageSrc: '/ArizonaSS16x9.png',
        duration: '30–60 Minuten',
        players: '1–4 Spieler',
        minAge: '12 Jahre',
        features: [
            'Next-Gen Nah- und Fernkampf',
            'Koop-Multiplayer bis 4 Spieler',
            'Neues Mutilations- und Gore-System',
            'Inklusive aller Original-DLCs',
        ],
    },

    {
        slug: 'after-the-fall',
        category: 'shooter',
        bookingMode: 'shooter',
        title: 'After the Fall',
        trailerUrl: 'https://youtu.be/C-alM4V4VmM?t=3',
        description: 'Tauche ein in die eisigen Ruinen eines dystopischen L.A. der 80er Jahre. Ein epischer VR-Action-Shooter, in dem du dich im 4-Spieler-Koop durch gnadenlose Horden kämpfst!',
        longDescription: `Ein Vierteljahrhundert nach der Apokalypse hat eine verheerende Eiszeit Los Angeles in eine zugefrorene Hölle verwandelt. Ein mysteriöser Virus hat die Menschheit in mutierte, blutrünstige Monster verwandelt: die "Snowbreed". Als einer der wenigen immunen Überlebenden bist du die letzte Hoffnung der Menschheit. In "After the Fall" begibst du dich mit bis zu drei Freunden in ein nahtloses Multiplayer-Erlebnis. Erkunde die vereisten Ruinen der Stadt, crafte tödliche Waffen und nutze verheerende Kräfte, die mit deinen echten Körperbewegungen gesteuert werden. Stelle dich gigantischen Bossen und sichere das Überleben eures Squads in einem unerbittlichen Kampf um die Zukunft!`,
        imageSrc: '/After_the_fall1.jpg',
        duration: '30 - 60 Minuten',
        players: '1–4 Spieler',
        minAge: '12 Jahre',
        features: [
            '4-Spieler Koop-Multiplayer',
            'Eisiges 1980er L.A. Setting',
            'Riesige Mutanten-Horden & kolossale Bosse',
            'Umfangreiches Waffen-Crafting',
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
        description: 'Betritt eine von übernatürlichen Mächten heimgesuchte Villa. Löst im Team düstere Rätsel und entkommt, bevor ihr selbst zu den Geheimnissen des Hauses werdet!',
        longDescription: `Mansion of Death ist das ultimative Horror-Escape-Room-Erlebnis in Virtual Reality. Du und dein Team taucht tief in ein altes, verlassenes Herrenhaus ein, das voller paranormaler Aktivitäten, versteckter Passagen und mysteriöser Geheimnisse steckt. In diesem rund 45-minütigen, kooperativen Abenteuer müsst ihr in schwach beleuchteten Korridoren Hinweise sammeln und zusammenarbeiten, um verschlossene Türen zu öffnen. Doch die Zeit drängt und düstere Geister lauern in jeder Ecke. Nur durch klare Kommunikation, wahren Teamgeist und Nerven aus Stahl könnt ihr die Rätsel lösen und dem Horror entfliehen!`,
        imageSrc: '/mansion1.jpg',
        duration: '30 - 60 Minuten',
        players: '1–4 Spieler',
        minAge: '12 Jahre',
        features: [
            'Spukhaus-Setting mit Schock-Faktor',
            'Teamwork-basierte Logikrätsel',
            'Kooperatives Erlebnis',
            'Atmosphärischer Nervenkitzel',
        ],
    },

    {
        slug: 'riddle-of-ruins',
        category: 'escape',
        bookingMode: 'escape',
        title: 'Riddle of Ruins',
        trailerUrl: 'https://www.youtube.com/watch?v=bhRei3Q9QSU',
        description: 'Schlüpfe in die Rolle wagemutiger Tempelforscher! Entdecke vergessene Schätze in einem uralten Tempel voller versteckter Fallen und kniffliger Rätsel.',
        longDescription: `Willkommen bei Riddle of Ruins, einem wunderschön gestalteten und fesselnden VR-Escape-Abenteuer! Du und dein Team betretet eine archäologische Ausgrabungsstätte, die tief in einem uralten, mystischen Tempel verborgen liegt. Um einen alten Fluch zu brechen und die verborgenen Schätze zu bergen, müsst ihr komplexe Umgebungsrätsel lösen und geheime Kammern öffnen. Diese immersive Welt erfordert scharfe Beobachtungsgabe, logisches Denken und exzellente Kommunikation innerhalb eures Teams. Perfekt für Rätsel-Liebhaber, Familien und alle, die ihr Teamwork auf die ultimative Probe stellen wollen. Werdet ihr das Rätsel der Ruinen lüften?`,
        imageSrc: '/riddle2.png',
        duration: '30 - 60 Minuten',
        players: '1–4 Spieler',
        minAge: '7 Jahre',
        features: [
            'Abenteuerliches Tempel-Setting',
            'Knifflige Umgebungs- & Logikrätsel',
            'Kooperatives Gameplay',
            'Fördert Kommunikation und Teamwork',
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
