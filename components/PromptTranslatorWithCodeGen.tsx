'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function PromptTranslatorWithCodeGen() {
    const [russianPrompt, setRussianPrompt] = useState('')
    const [translatedPrompt, setTranslatedPrompt] = useState('')
    const [generatedCode, setGeneratedCode] = useState('')
    const [loadingTranslate, setLoadingTranslate] = useState(false)
    const [loadingCode, setLoadingCode] = useState(false)

    const handleTranslate = async () => {
        setLoadingTranslate(true)
        try {
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: russianPrompt }),
            })

            const data = await res.json()
            setTranslatedPrompt(data.translated || '[ошибка перевода]')
        } catch (e) {
            setTranslatedPrompt('[ошибка запроса]')
        } finally {
            setLoadingTranslate(false)
        }
    }

    const handleGenerateCode = async () => {
        if (!translatedPrompt) {
            alert('Сначала переведите запрос!')
            return
        }

        setLoadingCode(true)
        try {
            const res = await fetch('/api/generate-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: translatedPrompt }),
            })

            const data = await res.json()
            setGeneratedCode(data.code || '[ошибка генерации]')
        } catch (e) {
            setGeneratedCode('[ошибка запроса]')
        } finally {
            setLoadingCode(false)
        }
    }

    const handleClearAll = () => {
        setRussianPrompt('')
        setTranslatedPrompt('')
        setGeneratedCode('')
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-4">Генерация Java-кода из русского запроса</h1>

            <Textarea
                value={russianPrompt}
                onChange={(e) => setRussianPrompt(e.target.value)}
                placeholder="Введите запрос на русском..."
                className="mb-4"
            />

            <div className="flex flex-wrap gap-4 mb-4">
                <Button onClick={handleTranslate} disabled={loadingTranslate}>
                    {loadingTranslate ? 'Переводим...' : 'Перевести'}
                </Button>
                <Button onClick={handleGenerateCode} disabled={loadingCode || !translatedPrompt}>
                    {loadingCode ? 'Генерируем...' : 'Сгенерировать код'}
                </Button>
                <Button variant="outline" onClick={handleClearAll}>
                    Очистить всё
                </Button>
            </div>

            <Textarea
                value={translatedPrompt}
                readOnly
                placeholder="Переведённый prompt"
                className="mb-4"
            />

            <Textarea
                value={generatedCode}
                readOnly
                placeholder="Сгенерированный код"
                className="h-60 font-mono"
            />
        </div>
    )
}
