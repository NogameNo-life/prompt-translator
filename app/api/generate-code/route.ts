import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json()

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
        }

        const response = await fetch(
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
                        max_new_tokens: 96,
                        temperature: 0.2,
                        return_full_text: false
                    }
                }),
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Ошибка Hugging Face:', errorText)
            return NextResponse.json({ error: 'Hugging Face API error' }, { status: 500 })
        }

        const data = await response.json()
        const code = data?.[0]?.generated_text || '[ошибка генерации]'

        return NextResponse.json({ code })
    } catch (error) {
        console.error('Ошибка при генерации кода:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
