import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const apiKey = process.env.RESEND_API_KEY;
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'info@spielnova.de';
        
        if (!apiKey) {
            return NextResponse.json({ error: 'RESEND_API_KEY is not defined in Vercel' }, { status: 500 });
        }

        const resend = new Resend(apiKey);
        
        const { data, error } = await resend.emails.send({
            from: `Spielnova <${fromEmail}>`,
            to: ['ahmed.adoha@gmail.com'],
            subject: 'Vercel Production Test',
            html: '<p>If you get this, Vercel environment variables are working perfectly!</p>'
        });

        if (error) {
            return NextResponse.json({ error: 'Resend API rejected the email', details: error }, { status: 500 });
        }

        return NextResponse.json({ success: true, data, message: 'Email sent successfully from Vercel!' });
    } catch (e: any) {
        return NextResponse.json({ error: 'Server crashed', details: e.message }, { status: 500 });
    }
}
