export default function TestEmailPage() {
    const customerName = "Ahmed Customer";
    const gameName = "Escape the Pyramids";
    const date = "2026-05-06";
    const time = "15:00";
    const duration = 60;
    const playerCount = 4;
    const totalAmount = 6000; // 60.00 EUR
    const isTopGamer = true;
    const LOCATION_HTML = `Spielnova im West Park<br/>Am Westpark 6<br/>85057 Ingolstadt`;

    const details = {
        customerName,
        gameName,
        newDate: "2026-05-10",
        newTime: "18:00",
        oldDate: "2026-05-06",
        oldTime: "15:00"
    };

    const LOGO_URL = "http://localhost:3000/logo.png";

    const bookingHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #fafafa; border-radius: 12px; overflow: hidden; border: 1px solid #27272a;">
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
    `;

    const rescheduleHtml = `
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
    `;

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-3xl font-bold mb-8 text-center">E-Mail Template Vorschau</h1>
            
            <div className="max-w-4xl mx-auto space-y-16">
                
                {/* Email 1 */}
                <section>
                    <h2 className="text-xl text-blue-400 font-semibold mb-4 text-center">1. Buchungsbestätigung</h2>
                    <div className="bg-white p-4 rounded-xl">
                        <div dangerouslySetInnerHTML={{ __html: bookingHtml }} />
                    </div>
                </section>

                {/* Email 2 */}
                <section>
                    <h2 className="text-xl text-orange-400 font-semibold mb-4 text-center">2. Umbuchung (Reschedule)</h2>
                    <div className="bg-white p-4 rounded-xl">
                        <div dangerouslySetInnerHTML={{ __html: rescheduleHtml }} />
                    </div>
                </section>

            </div>
        </div>
    );
}
