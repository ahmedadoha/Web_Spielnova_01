import { Resend } from 'resend';

// Initialize Resend with the API key from environment variables
// Note: In a production environment, ensure RESEND_API_KEY is set in .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

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
            customerName,
            customerEmail,
            date,
            time,
            gameName,
            duration,
            playerCount,
            totalAmount,
            isTopGamer
        } = details;

        // Note: For testing without a verified domain on Resend, you can only send to the email address associated with your Resend account.
        // Once you verify your domain (e.g., spielnova.de), you can change 'from' to 'buchung@spielnova.de'
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

        const { data, error } = await resend.emails.send({
            from: `Spielnova <${fromEmail}>`,
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

                    <p><strong>Standort:</strong><br/>
                    Spielnova im West Park<br/>
                    Am Westpark 6<br/>
                    85057 Ingolstadt</p>

                    <p>Wir freuen uns auf Sie!<br/>
                    Ihr Spielnova Team</p>
                </div>
            `,
        });

        if (error) {
            console.error('Resend Error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (err) {
        console.error('Failed to send email:', err);
        return { success: false, error: err };
    }
}
