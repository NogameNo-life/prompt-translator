import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json()

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
        }

        const replicateResponse = await fetch(
            'https://api.replicate.com/v1/predictions',
            {
                method: 'POST',
                headers: {
                    Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    version: "fb68fbc7e00ab75f8f0c3d860bf6ffd02ef0a857e90f8c91f6764a4ce803039a", // ID конкретной версии
                    input: {
                        prompt,
                        max_new_tokens: 96
                    }
                }),
            }
        )

        const json = await replicateResponse.json()

        if (!replicateResponse.ok) {
            console.error('Ошибка Replicate:', json)
            return NextResponse.json({ error: json?.detail || 'Replicate error' }, { status: 500 })
        }

        // Репликейт возвращает результат как prediction → output
        const predictionUrl = json?.urls?.get
        const id = json?.id

        // Ждём, пока prediction завершится (можно сделать опрос или Webhook)
        let finalOutput = null
        for (let i = 0; i < 10; i++) {
            const statusRes = await fetch(predictionUrl, {
                headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` },
            })
            const statusJson = await statusRes.json()
            if (statusJson.status === 'succeeded') {
                finalOutput = statusJson.output
                break
            }
            if (statusJson.status === 'failed') {
                throw new Error('Replicate prediction failed')
            }
            await new Promise(r => setTimeout(r, 2000)) // 2 сек между запросами
        }

        return NextResponse.json({ code: finalOutput })

    } catch (error) {
        console.error('Ошибка при генерации кода:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
