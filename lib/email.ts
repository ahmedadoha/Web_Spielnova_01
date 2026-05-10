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

                        <div style="background-color: rgba(139, 92, 246, 0.1); border: 1px solid #8b5cf6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                            <h4 style="margin: 0 0 10px 0; color: #c4b5fd; font-size: 16px; text-transform: uppercase;">⏱️ Wichtiges zum Timing</h4>
                            <p style="margin: 0; color: #d4d4d8; font-size: 15px; line-height: 1.5;">
                                Bitte sei <strong>10 Minuten vor Spielbeginn</strong> bei uns! So haben wir genug Zeit für das Briefing und du verlierst keine wertvolle Spielzeit.
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
// Contact Form (forwarded to info@spielnova.de with reply-to set to sender)
// ---------------------------------------------------------------------------

interface ContactDetails {
    senderName: string;
    senderEmail: string;
    subject: string;
    message: string;
}

export async function sendContactEmail(details: ContactDetails) {
    try {
        const { senderName, senderEmail, subject, message } = details;

        const { data, error } = await resend.emails.send({
            from: `Spielnova Kontakt <${FROM_EMAIL}>`,
            to: ['info@spielnova.de'],
            replyTo: senderEmail,
            subject: `Kontaktanfrage: ${subject}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #fafafa; border-radius: 12px; overflow: hidden; border: 1px solid #27272a;">
                    <div style="background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%); padding: 24px 20px; text-align: center;">
                        <img src="${LOGO_URL}" alt="Spielnova Logo" style="max-width: 180px; height: auto; margin: 0 auto; display: block;" />
                    </div>

                    <div style="padding: 36px 30px;">
                        <h2 style="color: #ffffff; font-size: 22px; margin-top: 0;">📬 Neue Kontaktanfrage</h2>

                        <div style="background-color: #18181b; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #3b82f6;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #a1a1aa; width: 120px;">👤 Name:</td>
                                    <td style="padding: 8px 0; font-weight: bold; color: #ffffff;">${senderName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #a1a1aa;">📧 E-Mail:</td>
                                    <td style="padding: 8px 0; font-weight: bold; color: #60a5fa;">
                                        <a href="mailto:${senderEmail}" style="color: #60a5fa;">${senderEmail}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #a1a1aa;">📌 Betreff:</td>
                                    <td style="padding: 8px 0; font-weight: bold; color: #ffffff;">${subject}</td>
                                </tr>
                            </table>
                        </div>

                        <div style="background-color: #18181b; padding: 20px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                            <h3 style="margin-top: 0; color: #c4b5fd; font-size: 15px; text-transform: uppercase; letter-spacing: 1px;">Nachricht</h3>
                            <p style="color: #d4d4d8; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
                        </div>

                        <p style="color: #52525b; font-size: 13px; margin-top: 28px; text-align: center;">
                            Du kannst direkt auf diese E-Mail antworten — die Antwort geht an ${senderEmail}
                        </p>
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error('Resend Error (contact):', error);
            return { success: false, error };
        }
        return { success: true, data };
    } catch (err) {
        console.error('Failed to send contact email:', err);
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

                        <div style="background-color: rgba(139, 92, 246, 0.1); border: 1px solid #8b5cf6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                            <h4 style="margin: 0 0 10px 0; color: #c4b5fd; font-size: 16px; text-transform: uppercase;">⏱️ Wichtiges zum Timing</h4>
                            <p style="margin: 0; color: #d4d4d8; font-size: 15px; line-height: 1.5;">
                                Bitte sei <strong>10 Minuten vor deinem neuen Spielbeginn</strong> bei uns, damit wir pünktlich mit dem Briefing starten können!
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

                        <div style="background-color: rgba(139, 92, 246, 0.1); border: 1px solid #8b5cf6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                            <h4 style="margin: 0 0 10px 0; color: #c4b5fd; font-size: 16px; text-transform: uppercase;">⏱️ Wichtiges zum Timing</h4>
                            <p style="margin: 0; color: #d4d4d8; font-size: 15px; line-height: 1.5;">
                                Wir erwarten dich <strong>10 Minuten vor dem Start</strong> im Basecamp. Das Briefing wartet schon auf dich!
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
