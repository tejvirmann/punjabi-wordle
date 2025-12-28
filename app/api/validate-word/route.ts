import { NextRequest, NextResponse } from 'next/server'
import { PUNJABI_WORD_SET } from '../../data/punjabiWords'

function normalizeWord(word: string): string {
    // Normalize to 5 Unicode characters (code points)
    const cleaned = word.replace(/\s/g, '')
    const chars = Array.from(cleaned) // Properly handle Unicode
    if (chars.length >= 5) {
        return chars.slice(0, 5).join('')
    }
    return chars.join('').padEnd(5, ' ')
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { word } = body

        if (!word || typeof word !== 'string') {
            return NextResponse.json(
                { error: 'Word is required' },
                { status: 400 }
            )
        }

        const normalizedWord = normalizeWord(word)
        const isValid = PUNJABI_WORD_SET.has(normalizedWord)

        return NextResponse.json({
            word: normalizedWord,
            isValid,
            length: normalizedWord.replace(/\s/g, '').length
        })
    } catch (error) {
        console.error('Error validating word:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

