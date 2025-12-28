import { NextResponse } from 'next/server'

// Dynamically import KV only if env vars are set
async function getKV() {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
        return null
    }
    try {
        const kvModule = await import('@vercel/kv')
        return kvModule.kv
    } catch (e) {
        return null
    }
}

// Fallback word list
const FALLBACK_WORDS = [
    'ਸੱਚਾ', 'ਪਿਆਰ', 'ਖੁਸ਼ੀ', 'ਸੁੰਦਰ', 'ਮਿੱਠਾ',
    'ਬਹਾਦਰ', 'ਸਾਫ਼', 'ਤਾਜ਼ਾ', 'ਗਰਮ', 'ਠੰਡਾ',
    'ਵੱਡਾ', 'ਛੋਟਾ', 'ਨਵਾਂ', 'ਪੁਰਾਣਾ', 'ਸੁਣਹਿਰੀ',
    'ਕਾਲਾ', 'ਸਫ਼ੈਦ', 'ਲਾਲ', 'ਹਰਾ', 'ਨੀਲਾ',
    'ਖਾਣਾ', 'ਪੀਣਾ', 'ਸੌਣਾ', 'ਉਠਣਾ', 'ਚੱਲਣਾ',
    'ਬੋਲਣਾ', 'ਸੁਣਣਾ', 'ਦੇਖਣਾ', 'ਸੋਚਣਾ', 'ਕਰਣਾ',
    'ਰੋਟੀ', 'ਦਾਲ', 'ਸਬਜ਼ੀ', 'ਫਲ', 'ਪਾਣੀ',
    'ਸੂਰਜ', 'ਚੰਦ', 'ਤਾਰਾ', 'ਬੱਦਲ', 'ਬਾਰਿਸ਼',
    'ਪੰਛੀ', 'ਕੁੱਤਾ', 'ਬਿੱਲੀ', 'ਘੋੜਾ', 'ਗਾਂ',
    'ਕਿਤਾਬ', 'ਕਲਮ', 'ਮੇਜ਼', 'ਕੁਰਸੀ', 'ਖਿੜਕੀ',
    'ਦਰਵਾਜ਼ਾ', 'ਲਾਲਟੈਨ', 'ਚਾਹ', 'ਦੁੱਧ', 'ਸ਼ੱਕਰ',
    'ਮਿੱਟੀ', 'ਪੱਥਰ', 'ਲੱਕੜ', 'ਲੋਹਾ', 'ਸੋਨਾ',
    'ਚਾਂਦੀ', 'ਤਾਂਬਾ', 'ਕੱਪੜਾ', 'ਜੁੱਤੀ', 'ਟੋਪੀ',
    'ਬਸਤਾ', 'ਕਾਗਜ਼', 'ਸਿਆਹੀ', 'ਰਬੜ', 'ਪੈਨਸਿਲ',
    'ਸਕੂਲ', 'ਕਲਾਸ', 'ਅਧਿਆਪਕ', 'ਵਿਦਿਆਰਥੀ', 'ਮਿੱਤਰ',
    'ਦੋਸਤ', 'ਪਰਿਵਾਰ', 'ਮਾਤਾ', 'ਪਿਤਾ', 'ਭਰਾ',
    'ਭੈਣ', 'ਚਾਚਾ', 'ਤਾਇਆ', 'ਮਾਮਾ', 'ਚਾਚੀ',
    'ਤਾਈ', 'ਮਾਮੀ', 'ਦਾਦਾ', 'ਦਾਦੀ', 'ਨਾਨਾ',
    'ਨਾਨੀ', 'ਪੋਤਾ', 'ਪੋਤੀ', 'ਧੀ', 'ਪੁੱਤਰ',
    'ਬੇਟਾ', 'ਬੇਟੀ', 'ਪਤਨੀ', 'ਪਤੀ'
]

function normalizeWord(word: string): string {
    const cleaned = word.replace(/\s/g, '')
    if (cleaned.length >= 5) {
        return cleaned.substring(0, 5)
    }
    return cleaned.padEnd(5, ' ')
}

function getDateKey(date: Date = new Date()): string {
    return date.toISOString().split('T')[0] // YYYY-MM-DD format
}

function getRandomWord(): string {
    const normalized = FALLBACK_WORDS
        .filter(word => word.replace(/\s/g, '').length >= 5)
        .map(normalizeWord)
    return normalized[Math.floor(Math.random() * normalized.length)]
}

export async function GET() {
    try {
        const dateKey = getDateKey()
        let word: string | null = null

        // Try to get word from KV store
        try {
            const kv = await getKV()
            if (kv) {
                word = await kv.get<string>(`word:${dateKey}`)
            }
        } catch (error) {
            console.error('KV error (using fallback):', error)
        }

        // If no word set for today, use fallback
        if (!word) {
            word = getRandomWord()
        }

        return NextResponse.json({ word, date: dateKey })
    } catch (error) {
        console.error('Error getting word of day:', error)
        return NextResponse.json(
            { word: getRandomWord(), date: getDateKey() },
            { status: 200 }
        )
    }
}

