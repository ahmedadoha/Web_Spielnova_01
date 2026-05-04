import { Resend } from 'resend';

// Initialize Resend with the API key from environment variables
// Note: In a production environment, ensure RESEND_API_KEY is set in .env.local
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const LOCATION_HTML = `Spielnova im West Park<br/>Am Westpark 6<br/>85057 Ingolstadt`

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
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h1 style="color: #000;">Hallo ${customerName},</h1>
                    <p>vielen Dank für Ihre Buchung bei <strong>Spielnova</strong>!</p>
                    
                    <div style="background-color: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h2 style="margin-top: 0; color: #000;">Ihre Buchungsdetails:</h2>
                        <ul style="list-style: none; padding: 0;">
                            <li><strong>Spiel:</strong> ${gameName}</li>
                            <li><strong>Datum:</strong> ${date}</li>
                            <li><strong>Uhrzeit:</strong> ${time} Uhr</li>
                            <li><strong>Dauer:</strong> ${duration} Minuten</li>
                            <li><strong>Spieler:</strong> ${playerCount}</li>
                            <li><strong>Gesamtpreis:</strong> ${(totalAmount / 100).toFixed(2)} €</li>
                        </ul>
                    </div>
                    
                    ${isTopGamer ? `
                    <div style="background-color: #e6f7ff; border-left: 4px solid #1890ff; padding: 15px; margin-bottom: 20px;">
                        <p style="margin: 0;">🎮 <strong>Top Gamer Rabatt angewendet!</strong> Danke, dass du wieder da bist. Wir haben dir automatisch 20% Rabatt auf diese Buchung gewährt.</p>
                    </div>
                    ` : ''}

                    <p><strong>Standort:</strong><br/>${LOCATION_HTML}</p>
                    <p>Wir freuen uns auf Sie!<br/>Ihr Spielnova Team</p>
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
            subject: 'Ihre Buchung wurde umgebucht – Spielnova',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h1 style="color: #000;">Hallo ${details.customerName},</h1>
                    <p>Ihre Buchung bei <strong>Spielnova</strong> wurde auf Ihren Wunsch hin umgebucht.</p>
                    <div style="background-color: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h2 style="margin-top: 0; color: #000;">Neue Buchungsdetails:</h2>
                        <ul style="list-style: none; padding: 0;">
                            <li><strong>Spiel:</strong> ${details.gameName}</li>
                            <li><strong>Neues Datum:</strong> ${details.newDate}</li>
                            <li><strong>Neue Uhrzeit:</strong> ${details.newTime} Uhr</li>
                        </ul>
                        <p style="color: #888; font-size: 0.9em;">Alter Termin: ${details.oldDate} um ${details.oldTime} Uhr</p>
                    </div>
                    <p>Bei Fragen wenden Sie sich bitte an unser Team.</p>
                    <p>Wir freuen uns auf Sie!<br/>Ihr Spielnova Team</p>
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
            subject: 'Erinnerung: Ihre Buchung bei Spielnova',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h1 style="color: #000;">Hallo ${details.customerName},</h1>
                    <p>Dies ist eine freundliche Erinnerung an Ihre bevorstehende Buchung bei <strong>Spielnova</strong>.</p>
                    <div style="background-color: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h2 style="margin-top: 0; color: #000;">Ihre Buchungsdetails:</h2>
                        <ul style="list-style: none; padding: 0;">
                            <li><strong>Spiel:</strong> ${details.gameName}</li>
                            <li><strong>Datum:</strong> ${details.date}</li>
                            <li><strong>Uhrzeit:</strong> ${details.time} Uhr</li>
                            <li><strong>Dauer:</strong> ${details.duration} Minuten</li>
                            <li><strong>Spieler:</strong> ${details.playerCount}</li>
                        </ul>
                    </div>
                    <p><strong>Standort:</strong><br/>${LOCATION_HTML}</p>
                    <p>Wir freuen uns auf Sie!<br/>Ihr Spielnova Team</p>
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
