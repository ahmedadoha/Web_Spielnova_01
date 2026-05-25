/**
 * Central Pricing Configuration for Spielnova
 * 
 * Modifying the prices here will automatically update:
 * 1. The public pricing page (/preise)
 * 2. The booking wizard (/buchen)
 * 3. The Stripe payment calculation backend (/api/bookings)
 * 
 * All prices are in EUR as standard decimal numbers.
 */

export const PRICING = {
    // VR Arena 30 Minutes sessions
    arena_30: {
        weekday: {
            single: 14.90,
            team: 50.00,
        },
        weekend: {
            single: 17.00,
            team: 60.00,
        }
    },
    // VR Arena 60 Minutes sessions
    arena_60: {
        weekday: {
            single: 24.00,
            team: 80.00,
        },
        weekend: {
            single: 28.00,
            team: 99.00,
        }
    },
    // VR Simulator (Paraglider or Super Fighter)
    simulator: {
        weekday: 7.00,
        weekend: 9.00,
    },
    // Children Arcade Games
    arcade: {
        weekday: 3.00,
        weekend: 4.00,
    }
}

/**
 * Converts a decimal euro price to cents (integer) for Stripe checkout session.
 * e.g. 14.90 -> 1490
 */
export function toCents(euros: number): number {
    return Math.round(euros * 100);
}

/**
 * Formats a euro amount with a German comma decimal separator (e.g. 14.90 -> "14,90 €" or 55.00 -> "55,00 €").
 */
export function formatGermanPrice(euros: number): string {
    return euros.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }) + ' €';
}
