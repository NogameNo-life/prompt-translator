import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json()

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
        }

        // URL локального сервера генерации (можно задать в .env.local как LOCAL_CODEGEN_API)
        const endpoint = process.env.LOCAL_CODEGEN_API || 'http://localhost:5000/generate'

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Ошибка локального генератора:', errorText)
            return NextResponse.json({ error: 'Local model error' }, { status: 500 })
        }

        const data = await response.json()
        const code = data?.generated_text || '[ошибка генерации]'

        return NextResponse.json({ code })
    } catch (error) {
        console.error('Ошибка при генерации кода:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
