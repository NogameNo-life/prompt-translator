'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export default function PromptTranslator() {
    const [inputPrompt, setInputPrompt] = useState('')
    const [translatedPrompt, setTranslatedPrompt] = useState('')
    const [loading, setLoading] = useState(false)
    const [direction, setDirection] = useState<'ru-en' | 'en-ru'>('ru-en')

    const handleTranslate = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: inputPrompt,
                    direction: direction,
                }),
            })

            const data = await res.json()
            setTranslatedPrompt(data.translated || '[ошибка перевода]')
        } catch (e) {
            setTranslatedPrompt('[ошибка запроса]')
        } finally {
            setLoading(false)
        }
    }

    const handleClear = () => {
        setInputPrompt('')
        setTranslatedPrompt('')
    }

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-4">Переводчик промптов</h1>

            <ToggleGroup
                type="single"
                value={direction}
                onValueChange={(val) => val && setDirection(val as 'ru-en' | 'en-ru')}
                className="mb-4"
            >
                <ToggleGroupItem value="ru-en">🇷🇺 → 🇬🇧</ToggleGroupItem>
                <ToggleGroupItem value="en-ru">🇬🇧 → 🇷🇺</ToggleGroupItem>
            </ToggleGroup>

            <Textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder={`Введите текст на ${direction === 'ru-en' ? 'русском' : 'английском'}...`}
                className="mb-4"
            />

            <div className="flex gap-2 mb-4">
                <Button onClick={handleTranslate} disabled={loading}>
                    {loading ? 'Переводим...' : 'Перевести'}
                </Button>
                <Button variant="outline" onClick={handleClear}>
                    Очистить
                </Button>
            </div>

            <Textarea
                value={translatedPrompt}
                readOnly
                placeholder="Здесь будет перевод"
            />
        </div>
    )
}
