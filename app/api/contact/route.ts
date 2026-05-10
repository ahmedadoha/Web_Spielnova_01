import { NextResponse } from 'next/server'
import { sendContactEmail } from '@/lib/email'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, email, subject, message } = body

        // Server-side validation
        if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
            return NextResponse.json(
                { error: 'Alle Felder sind Pflichtfelder.' },
                { status: 400 }
            )
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Bitte gib eine gültige E-Mail-Adresse ein.' },
                { status: 400 }
            )
        }

        if (message.trim().length < 10) {
            return NextResponse.json(
                { error: 'Die Nachricht muss mindestens 10 Zeichen lang sein.' },
                { status: 400 }
            )
        }

        const result = await sendContactEmail({
            senderName: name.trim(),
            senderEmail: email.trim(),
            subject: subject.trim(),
            message: message.trim(),
        })

        if (!result.success) {
            console.error('Contact email failed:', result.error)
            return NextResponse.json(
                { error: 'Nachricht konnte nicht gesendet werden. Bitte versuche es später erneut.' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (err) {
        console.error('Contact route error:', err)
        return NextResponse.json(
            { error: 'Ungültige Anfrage.' },
            { status: 400 }
        )
    }
}
