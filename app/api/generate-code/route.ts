import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json()

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
        }

        const hfResponse = await fetch(
            'https://api-inference.huggingface.co/models/bigcode/starcoder',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.HF_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 300,
                        temperature: 0.7,
                    },
                }),
            }
        )

        if (!hfResponse.ok) {
            const errorText = await hfResponse.text()
            console.error('Ошибка Hugging Face:', errorText)
            return NextResponse.json({ error: errorText }, { status: 500 })
        }

        const data = await hfResponse.json()
        console.log('Ответ модели:', data)

        const code = Array.isArray(data)
            ? data[0]?.generated_text
            : data?.generated_text || ''

        return NextResponse.json({ code })
    } catch (error) {
        console.error('Ошибка в generate-code route:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
