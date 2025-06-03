import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    const { prompt, direction } = await req.json()

    const input =
        direction === 'en-ru'
            ? `translate English to Russian: ${prompt}`
            : `translate Russian to English: ${prompt}`

    const hfResponse = await fetch(
        'https://api-inference.huggingface.co/models/utrobinmv/t5_translate_en_ru_zh_base_200',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.HF_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: input }),
        }
    )

    if (!hfResponse.ok) {
        const errorText = await hfResponse.text()
        return NextResponse.json({ error: errorText }, { status: 500 })
    }

    const data = await hfResponse.json()
    const translated = data?.[0]?.translation_text || ''

    return NextResponse.json({ translated })
}
