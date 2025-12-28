import { NextRequest, NextResponse } from 'next/server'
import { PUNJABI_WORD_SET, countCharacterUnits } from '../../data/punjabiWords'

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

        // Check if word is exactly 5 character units
        const unitCount = countCharacterUnits(word)
        if (unitCount !== 5) {
            return NextResponse.json({
                word: word,
                isValid: false,
                length: unitCount,
                error: `Word must be exactly 5 character units, got ${unitCount}`
            })
        }

        // Check if word exists in valid word set
        const isValid = PUNJABI_WORD_SET.has(word)

        return NextResponse.json({
            word: word,
            isValid,
            length: unitCount
        })
    } catch (error) {
        console.error('Error validating word:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

