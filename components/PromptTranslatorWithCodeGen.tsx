'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

type HistoryItem = {
    russian: string
    translated: string
    code: string
}

export default function PromptTranslatorWithCodeGen() {
    const [russianPrompt, setRussianPrompt] = useState('')
    const [translatedPrompt, setTranslatedPrompt] = useState('')
    const [generatedCode, setGeneratedCode] = useState('')
    const [history, setHistory] = useState<HistoryItem[]>([])

    const [loadingTranslate, setLoadingTranslate] = useState(false)
    const [loadingCode, setLoadingCode] = useState(false)

    const handleTranslate = async () => {
        setLoadingTranslate(true)
        try {
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: russianPrompt, direction: 'ru-en' }),
            })
            const data = await res.json()
            const rawTranslated = data.translated || '[ошибка перевода]'
            const cleanedPrompt = rawTranslated.replace(/^translate (russian|english) to (english|russian):\s*/i, '')
            setTranslatedPrompt(cleanedPrompt)
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
            const code = data.code || '[ошибка генерации]'
            setGeneratedCode(code)

            setHistory(prev => [
                { russian: russianPrompt, translated: translatedPrompt, code },
                ...prev,
            ])
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

    const deleteFromHistory = (index: number) => {
        setHistory(prev => prev.filter((_, i) => i !== index))
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-4">Генерация Java-кода из русского запроса</h1>

            <Textarea
                value={russianPrompt}
                onChange={(e) => setRussianPrompt(e.target.value)}
                placeholder="Введите запрос на русском..."
                className="mb-4"
            />

            <div className="flex gap-4 mb-4">
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

            {history.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">История запросов</h2>
                    <div className="space-y-4">
                        {history.map((item, index) => (
                            <div
                                key={index}
                                className="border p-4 rounded-xl bg-muted relative"
                            >
                                <button
                                    className="absolute top-2 right-2 text-red-500"
                                    onClick={() => deleteFromHistory(index)}
                                >
                                    <Trash2 size={16} />
                                </button>
                                <p className="text-sm font-medium">📝 Русский:</p>
                                <pre className="whitespace-pre-wrap">{item.russian}</pre>
                                <p className="text-sm font-medium mt-2">🔁 Перевод:</p>
                                <pre className="whitespace-pre-wrap">{item.translated}</pre>
                                <p className="text-sm font-medium mt-2">💻 Код:</p>
                                <pre className="bg-gray-100 p-2 rounded font-mono text-sm overflow-auto">
                                    {item.code}
                                </pre>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
