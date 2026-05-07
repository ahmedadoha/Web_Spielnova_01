import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function runTests() {
    console.log("API KEY LENGTH:", process.env.RESEND_API_KEY?.length);
    console.log("API KEY PREFIX:", process.env.RESEND_API_KEY?.substring(0, 3));

    const { sendBookingConfirmation, sendRescheduleConfirmation } = await import('./lib/email');
    console.log("⏳ Sending Booking Confirmation Email...");
    try {
        const result1 = await sendBookingConfirmation({
            customerName: "Ahmed Adoha",
            customerEmail: "ahmed.adoha@gmail.com",
            date: "2026-05-25",
            time: "19:00",
            gameName: "Escape the Pyramids",
            duration: 60,
            playerCount: 4,
            totalAmount: 8000,
            isTopGamer: false
        });
        console.log("✅ Booking Confirmation Result:", result1);
    } catch (e) {
        console.error("❌ Failed to send Booking Confirmation:", e);
    }

    console.log("\n⏳ Sending Reschedule Confirmation Email...");
    try {
        const result2 = await sendRescheduleConfirmation({
            customerName: "Ahmed Adoha",
            customerEmail: "ahmed.adoha@gmail.com",
            gameName: "Escape the Pyramids",
            oldDate: "2026-05-25",
            oldTime: "19:00",
            newDate: "2026-05-26",
            newTime: "17:00",
            employeeName: "Manager"
        });
        console.log("✅ Reschedule Confirmation Result:", result2);
    } catch (e) {
        console.error("❌ Failed to send Reschedule Confirmation:", e);
    }
}

runTests();
