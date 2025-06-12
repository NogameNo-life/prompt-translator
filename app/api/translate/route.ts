import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    const { prompt, direction } = await req.json()

    const input =
        direction === 'en-ru'
            ? `translate English to Russian: ${prompt}` // Пока только ru-en поддерживается
            : prompt

    try {
        const response = await fetch('http://localhost:8000/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: input }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            return NextResponse.json({ error: errorText }, { status: 500 })
        }

        const data = await response.json()
        const translated = data.translation || ''

        return NextResponse.json({ translated })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to connect to local translator service' },
            { status: 500 }
        )
    }
}
