# Spielnova — Game Change Walkthrough

> **For:** Ahmed / Business Owner  
> **Purpose:** How to add, rename, remove, or update game posters without a developer  
> **The only file you need to edit:** `lib/games.ts`

---

## Where Is the File?

Open your project on GitHub:  
**`lib/games.ts`** → This one file controls every game on the website.

It feeds the:
- Shooter Games listing page (`/shooter_games`)
- Escape Rooms listing page (`/escaperooms`)
- Game detail pages (`/experience/[slug]`)
- Booking wizard game selector (`/buchen`)

---

## Understanding a Game Entry

Each game is a block that looks like this:

```
{
    slug: 'zombie-apocalypse',
    category: 'shooter',
    bookingMode: 'shooter',
    title: 'Zombie Apocalypse VR',
    description: 'One-sentence teaser shown on the card.',
    longDescription: 'Full description shown on the detail page.',
    imageSrc: 'https://picsum.photos/seed/zombies/1920/1080',
    duration: '30–60 Minuten',
    players: '2–8 Spieler',
    difficulty: 'Mittel',
    minAge: '16 Jahre',
    features: [
        'Feature one',
        'Feature two',
        'Feature three',
        'Feature four',
    ],
},
```

**Rules:**
| Field | What it does | Can I change it? |
|---|---|---|
| `slug` | URL of the page — e.g. `/experience/zombie-apocalypse` | ⚠️ Only if the game is completely new. Changing a slug on an existing game breaks any saved/shared links. |
| `category` | Which listing page it appears on — `'shooter'` or `'escape'` | ✅ Yes |
| `bookingMode` | Must always match `category` | ✅ Yes — keep it the same as category |
| `title` | Name shown to customers | ✅ Yes, freely |
| `description` | Short teaser on the card (1–2 sentences) | ✅ Yes, freely |
| `longDescription` | Full text on the detail page | ✅ Yes, freely |
| `imageSrc` | Poster image | ✅ Yes — see image guide below |
| `duration` | Session length shown in details | ✅ Yes |
| `players` | Player count range shown in details | ✅ Yes |
| `difficulty` | Badge shown on detail page | ✅ Yes — use: `'Leicht'`, `'Mittel'`, `'Schwer'`, or `'Extrem'` |
| `minAge` | Minimum age shown in details | ✅ Yes |
| `features` | Up to 4 bullet points on the detail page | ✅ Yes |

---

## How to Rename a Game

1. Open `lib/games.ts` on GitHub (click the pencil icon ✏️ to edit)
2. Find the game block by its current title
3. Change only the `title` field — **do not change the `slug`**
4. Scroll down → click **"Commit changes"**
5. The website updates automatically within ~60 seconds

**Example:** Renaming "Zombie Apocalypse VR" to "Dead City Survival"

```
title: 'Dead City Survival',    ← change this
slug: 'zombie-apocalypse',      ← leave this exactly as is
```

---

## How to Change a Game's Poster Image

### Option A — Use a photo from the internet

1. Find a photo online that you want to use (e.g., from Unsplash.com, Pexels.com)
2. Right-click the image → **Copy image address** — copy the full `https://...` URL
3. Open `lib/games.ts`, find the game, change `imageSrc` to the URL:
   ```
   imageSrc: 'https://images.unsplash.com/photo-xxxxxxxxxxxx?w=1920&q=80',
   ```
4. **Important:** The image website (domain) must be added to `next.config.ts`.  
   Currently allowed domains: `picsum.photos`  
   To add a new domain (e.g. Unsplash), ask your developer to add it once — then all Unsplash links will work forever.

### Option B — Use your own photo (recommended for real photos)

1. Prepare your photo — recommended size: **1920 × 1080 px**, JPG or PNG
2. Upload it to the `/public/` folder on GitHub:
   - Go to the `/public/` folder in the repository
   - Click **"Add file"** → **"Upload files"**
   - Upload your photo (e.g. `zombie-poster.jpg`)
   - Click **"Commit changes"**
3. Open `lib/games.ts` and change `imageSrc`:
   ```
   imageSrc: '/zombie-poster.jpg',
   ```
   *(Note: just the filename with a `/` in front — no folder path needed)*
4. Commit the change. Done.

---

## How to Add a New Game

1. Decide: is it a shooter (`'shooter'`) or escape room (`'escape'`)?
2. Choose a slug: lowercase, hyphens only, no spaces — e.g. `'cyber-attack'`
3. Open `lib/games.ts` → scroll to the correct category section
4. Copy any existing game block and paste it **before the closing `]` of the GAMES array**
5. Fill in all fields
6. Commit — the game appears on the website and in the booking form automatically

**Full example — new escape room:**

```
{
    slug: 'cyber-attack',
    category: 'escape',
    bookingMode: 'escape',
    title: 'Cyber Attack',
    description: 'Hackt euch durch ein Neon-Netzwerk und rettet die Stadtinfrastruktur.',
    longDescription: 'Die Stadt ist offline. Ein Hacker hat das Energienetz lahmgelegt. Euer Team muss in das feindliche Netzwerk eindringen, den Virus lokalisieren und eliminieren — alles in 60 Minuten. Kein Wissen erforderlich, nur Teamwork.',
    imageSrc: '/cyber-attack-poster.jpg',
    duration: '60 Minuten',
    players: '2–8 Spieler',
    difficulty: 'Schwer',
    minAge: '14 Jahre',
    features: [
        'Neon-Cyber-Ästhetik',
        'Hacking-Mechanik',
        'Komplexe Rätsel',
        'Kein Vorwissen nötig',
    ],
},
```

---

## How to Remove a Game

1. Open `lib/games.ts`
2. Find the game block — it starts with `{` after the comma of the previous entry and ends with `},`
3. Delete the **entire block** including the closing `},`
4. Commit — the game disappears from all listing pages and the booking form

⚠️ **Note:** The `/experience/[slug]` URL will show "Erlebnis nicht gefunden" after removal. If the game was shared on social media or linked somewhere, those links will break. Consider changing `is_active` to hide it temporarily instead (if that feature is added in future).

---

## How to Change Game Order

Games appear on the listing pages in the order they are listed in `lib/games.ts`.

To reorder: simply cut and paste the game blocks in the order you want them to appear.

---

## Current Games (at time of writing)

### VR Shooter Arena
| Slug | Title |
|---|---|
| `zombie-apocalypse` | Zombie Apocalypse VR |
| `robot-warfare` | Robot Warfare |
| `space-marines` | Space Marines |
| `wild-west` | Wild West Shootout |

### VR Escape Rooms
| Slug | Title |
|---|---|
| `escape-pyramids` | Escape the Pyramids |
| `space-station` | Space Station Tiberia |
| `alice-wonderland` | Alice in Wonderland |
| `horror-house` | Horror House |

---

## Quick Reference Card

| Task | What to change | File |
|---|---|---|
| Rename a game | `title` field | `lib/games.ts` |
| Update description | `description` and/or `longDescription` | `lib/games.ts` |
| Swap poster image (own photo) | Upload to `/public/`, update `imageSrc` | `/public/` + `lib/games.ts` |
| Swap poster image (internet URL) | Update `imageSrc` to the URL | `lib/games.ts` (+ domain approval in `next.config.ts` if new domain) |
| Add a new game | Add a full game block | `lib/games.ts` |
| Remove a game | Delete the game block | `lib/games.ts` |
| Change game order | Reorder the blocks | `lib/games.ts` |
| Change difficulty/age/duration | Edit those fields directly | `lib/games.ts` |

---

*Last updated: May 2026. Created by OpenHands AI on behalf of the development team.*
