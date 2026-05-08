import { Resend } from 'resend';

// Initialize Resend with the API key from environment variables
// Note: In a production environment, ensure RESEND_API_KEY is set in .env.local
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const LOCATION_HTML = `Spielnova im West Park<br/>Am Westpark 6<br/>85057 Ingolstadt`

// Ensure the logo is always fetched from the public production domain.
// Vercel deployment URLs are password protected, which breaks images in emails.
const LOGO_URL = 'https://www.spielnova.de/logo.png';

// ---------------------------------------------------------------------------
// Booking Confirmation (sent after successful payment via Stripe webhook)
// ---------------------------------------------------------------------------

interface BookingDetails {
    customerName: string;
    customerEmail: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    gameName: string;
    duration: number;
    playerCount: number;
    totalAmount: number;
    isTopGamer?: boolean;
}

export async function sendBookingConfirmation(details: BookingDetails) {
    try {
        const {
            customerName, customerEmail, date, time,
            gameName, duration, playerCount, totalAmount, isTopGamer
        } = details;

        const { data, error } = await resend.emails.send({
            from: `Spielnova <${FROM_EMAIL}>`,
            to: [customerEmail],
            subject: 'Ihre Buchungsbestätigung - Spielnova',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #fafafa; border-radius: 12px; overflow: hidden; border: 1px solid #27272a;">
                    <!-- Header with Logo/Brand -->
                    <div style="background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px 20px; text-align: center;">
                        <img src="${LOGO_URL}" alt="Spielnova Logo" style="max-width: 200px; height: auto; margin: 0 auto; display: block;" />
                    </div>
                    
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #ffffff; font-size: 24px; margin-top: 0;">Hey ${customerName.split(' ')[0]}, bist du bereit für dein Abenteuer? 🚀</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa;">
                            Deine Mission ist bestätigt! Die Grenzen der Realität verschwinden und eine völlig neue Welt wartet auf dich. Lade deine Energie auf und mach dich bereit für ein unvergessliches Erlebnis.
                        </p>
                        
                        <div style="background-color: #18181b; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #8b5cf6;">
                            <h3 style="margin-top: 0; color: #ffffff; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Deine Missionsdaten</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr><td style="padding: 8px 0; color: #a1a1aa;">🎮 Spiel:</td><td style="padding: 8px 0; font-weight: bold; color: #ffffff; text-align: right;">${gameName}</td></tr>
                                <tr><td style="padding: 8px 0; color: #a1a1aa;">📅 Datum:</td><td style="padding: 8px 0; font-weight: bold; color: #ffffff; text-align: right;">${date}</td></tr>
                                <tr><td style="padding: 8px 0; color: #a1a1aa;">⏰ Startzeit:</td><td style="padding: 8px 0; font-weight: bold; color: #ffffff; text-align: right;">${time} Uhr</td></tr>
                                <tr><td style="padding: 8px 0; color: #a1a1aa;">⏳ Dauer:</td><td style="padding: 8px 0; font-weight: bold; color: #ffffff; text-align: right;">${duration} Minuten</td></tr>
                                <tr><td style="padding: 8px 0; color: #a1a1aa;">👥 Teamgröße:</td><td style="padding: 8px 0; font-weight: bold; color: #ffffff; text-align: right;">${playerCount} Players</td></tr>
                                <tr><td style="padding: 8px 0; color: #a1a1aa; border-top: 1px solid #27272a;">💰 Gesamtbetrag:</td><td style="padding: 8px 0; font-weight: bold; color: #10b981; text-align: right; border-top: 1px solid #27272a;">${(totalAmount / 100).toFixed(2)} €</td></tr>
                            </table>
                        </div>
                        
                        ${isTopGamer ? `
                        <div style="background-color: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
                            <p style="margin: 0; color: #60a5fa; font-weight: bold;">⚡ Top Gamer Bonus aktiviert! Du hast 20% Rabatt auf diese Mission erhalten.</p>
                        </div>
                        ` : ''}

                        <div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                            <h4 style="margin: 0 0 10px 0; color: #fca5a5; font-size: 16px; text-transform: uppercase;">⚠️ Achtung: Timing ist alles!</h4>
                            <p style="margin: 0; color: #fecaca; font-size: 15px; line-height: 1.5;">
                                Bitte sei unbedingt <strong>10 Minuten vor Spielbeginn</strong> bei uns! Dein Briefing startet pünktlich. Bei Verspätung verlierst du leider wertvolle Spielzeit.
                            </p>
                        </div>

                        <p style="color: #a1a1aa; font-size: 14px; text-align: center;">
                            <strong>Basecamp / Standort:</strong><br/>
                            ${LOCATION_HTML}
                        </p>

                        <hr style="border: none; border-top: 1px solid #27272a; margin: 30px 0;" />
                        
                        <p style="text-align: center; color: #71717a; font-size: 14px; margin: 0;">
                            Wir sehen uns im Grid!<br/>
                            <strong style="color: #a1a1aa;">Dein Spielnova Team</strong>
                        </p>
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error('Resend Error (confirmation):', error);
            return { success: false, error };
        }
        return { success: true, data };
    } catch (err) {
        console.error('Failed to send booking confirmation email:', err);
        return { success: false, error: err };
    }
}

// ---------------------------------------------------------------------------
// Reschedule Confirmation (sent automatically when staff reschedules)
// ---------------------------------------------------------------------------

interface RescheduleDetails {
    customerName: string;
    customerEmail: string;
    gameName: string;
    oldDate: string;
    oldTime: string;
    newDate: string;
    newTime: string;
    employeeName: string;
}

export async function sendRescheduleConfirmation(details: RescheduleDetails) {
    try {
        const { data, error } = await resend.emails.send({
            from: `Spielnova <${FROM_EMAIL}>`,
            to: [details.customerEmail],
            subject: 'Ihre Mission wurde verlegt – Spielnova',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #fafafa; border-radius: 12px; overflow: hidden; border: 1px solid #27272a;">
                    <div style="background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px 20px; text-align: center;">
                        <img src="${LOGO_URL}" alt="Spielnova Logo" style="max-width: 200px; height: auto; margin: 0 auto; display: block;" />
                    </div>
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #ffffff; font-size: 24px; margin-top: 0;">Hey ${details.customerName.split(' ')[0]}, Koordinaten-Update! 🛰️</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa;">
                            Deine Missionsdaten wurden auf deinen Wunsch hin im System aktualisiert. Bitte notiere dir die neuen Startbedingungen.
                        </p>
                        
                        <div style="background-color: #18181b; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
                            <h3 style="margin-top: 0; color: #ffffff; font-size: 18px; text-transform: uppercase;">Neue Missionsdaten</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr><td style="padding: 8px 0; color: #a1a1aa;">🎮 Spiel:</td><td style="padding: 8px 0; font-weight: bold; color: #ffffff; text-align: right;">${details.gameName}</td></tr>
                                <tr><td style="padding: 8px 0; color: #a1a1aa;">📅 Neues Datum:</td><td style="padding: 8px 0; font-weight: bold; color: #10b981; text-align: right;">${details.newDate}</td></tr>
                                <tr><td style="padding: 8px 0; color: #a1a1aa;">⏰ Neue Startzeit:</td><td style="padding: 8px 0; font-weight: bold; color: #10b981; text-align: right;">${details.newTime} Uhr</td></tr>
                            </table>
                            <p style="color: #52525b; font-size: 0.85em; margin-top: 15px; text-align: right;">(Alter Termin: ${details.oldDate} um ${details.oldTime} Uhr)</p>
                        </div>

                        <div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                            <p style="margin: 0; color: #fecaca; font-size: 15px; line-height: 1.5; text-align: center;">
                                WICHTIG: Bitte sei unbedingt <strong>10 Minuten vor dem neuen Spielbeginn</strong> bei uns!
                            </p>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #27272a; margin: 30px 0;" />
                        <p style="text-align: center; color: #71717a; font-size: 14px; margin: 0;">Wir sehen uns im Grid!<br/><strong style="color: #a1a1aa;">Dein Spielnova Team</strong></p>
                    </div>
                </div>
            `,
        });
        if (error) console.error('Resend Error (reschedule):', error);
        return { success: !error, data };
    } catch (err) {
        console.error('Failed to send reschedule email:', err);
        return { success: false, error: err };
    }
}

// ---------------------------------------------------------------------------
// Manual Reminder (sent by staff via "Erinnerung senden" button)
// ---------------------------------------------------------------------------

interface ReminderDetails {
    customerName: string;
    customerEmail: string;
    gameName: string;
    date: string;
    time: string;
    duration: number;
    playerCount: number;
}

export async function sendReminderEmail(details: ReminderDetails) {
    try {
        const { data, error } = await resend.emails.send({
            from: `Spielnova <${FROM_EMAIL}>`,
            to: [details.customerEmail],
            subject: 'Bereit? Deine Mission bei Spielnova startet bald!',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #fafafa; border-radius: 12px; overflow: hidden; border: 1px solid #27272a;">
                    <div style="background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px 20px; text-align: center;">
                        <img src="${LOGO_URL}" alt="Spielnova Logo" style="max-width: 200px; height: auto; margin: 0 auto; display: block;" />
                    </div>
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #ffffff; font-size: 24px; margin-top: 0;">Hey ${details.customerName.split(' ')[0]}, mach dich bereit! ⚡</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa;">
                            Der Countdown läuft! Deine Mission im VR-Grid steht kurz bevor. Hier ist nochmal ein kurzer System-Check deiner Daten:
                        </p>
                        
                        <div style="background-color: #18181b; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #3b82f6;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr><td style="padding: 8px 0; color: #a1a1aa;">🎮 Spiel:</td><td style="padding: 8px 0; font-weight: bold; color: #ffffff; text-align: right;">${details.gameName}</td></tr>
                                <tr><td style="padding: 8px 0; color: #a1a1aa;">📅 Datum:</td><td style="padding: 8px 0; font-weight: bold; color: #ffffff; text-align: right;">${details.date}</td></tr>
                                <tr><td style="padding: 8px 0; color: #a1a1aa;">⏰ Startzeit:</td><td style="padding: 8px 0; font-weight: bold; color: #ffffff; text-align: right;">${details.time} Uhr</td></tr>
                                <tr><td style="padding: 8px 0; color: #a1a1aa;">👥 Teamgröße:</td><td style="padding: 8px 0; font-weight: bold; color: #ffffff; text-align: right;">${details.playerCount} Players</td></tr>
                            </table>
                        </div>

                        <div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                            <h4 style="margin: 0 0 10px 0; color: #fca5a5; font-size: 16px; text-transform: uppercase;">⚠️ Erinnerung: Timing ist alles!</h4>
                            <p style="margin: 0; color: #fecaca; font-size: 15px; line-height: 1.5;">
                                Wir brauchen dich <strong>10 Minuten vor dem Start</strong> im Basecamp. Das Briefing wartet nicht!
                            </p>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #27272a; margin: 30px 0;" />
                        <p style="text-align: center; color: #71717a; font-size: 14px; margin: 0;">Wir sehen uns im Grid!<br/><strong style="color: #a1a1aa;">Dein Spielnova Team</strong></p>
                    </div>
                </div>
            `,
        });
        if (error) console.error('Resend Error (reminder):', error);
        return { success: !error, data };
    } catch (err) {
        console.error('Failed to send reminder email:', err);
        return { success: false, error: err };
    }
}
