import { NextResponse } from 'next/server'
import { PUNJABI_VALID_WORDS, PUNJABI_WORD_SET, countCharacterUnits } from '../../data/punjabiWords'

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

function getDateKey(date: Date = new Date()): string {
    return date.toISOString().split('T')[0] // YYYY-MM-DD format
}

// Get a deterministic word for a date (same word every time for the same date)
function getWordForDate(dateKey: string): string {
    // Use the date as a seed for deterministic selection
    // Convert date string to a number
    const dateNum = parseInt(dateKey.replace(/-/g, ''), 10)
    
    // Use modulo to get a consistent index
    const wordIndex = dateNum % PUNJABI_VALID_WORDS.length
    
    return PUNJABI_VALID_WORDS[wordIndex]
}

export async function GET() {
    try {
        const dateKey = getDateKey()
        let word: string | null = null

        // Try to get word from KV store (admin-set word takes priority)
        try {
            const kv = await getKV()
            if (kv) {
                word = await kv.get<string>(`word:${dateKey}`)
            }
        } catch (error) {
            console.error('KV error (using fallback):', error)
        }

        // If no word set for today in KV, use deterministic word based on date
        if (!word) {
            word = getWordForDate(dateKey)
        }

        // Ensure word is exactly 5 character units (safety check)
        const unitCount = countCharacterUnits(word)
        if (unitCount !== 5) {
            // Fallback to a known 5-unit word if something went wrong
            console.warn(`Word "${word}" has ${unitCount} units (expected 5), using fallback`)
            // Find first valid 5-unit word
            for (const validWord of PUNJABI_VALID_WORDS) {
                if (countCharacterUnits(validWord) === 5) {
                    word = validWord
                    break
                }
            }
            if (countCharacterUnits(word) !== 5) {
                // Last resort fallback
                word = PUNJABI_VALID_WORDS[0]
            }
        }
        
        // Final validation - ensure word is in valid word set
        if (!PUNJABI_WORD_SET.has(word)) {
            console.warn(`Word "${word}" not in valid word set, using fallback`)
            // Find first valid 5-unit word that's in the set
            for (const validWord of PUNJABI_VALID_WORDS) {
                if (countCharacterUnits(validWord) === 5 && PUNJABI_WORD_SET.has(validWord)) {
                    word = validWord
                    break
                }
            }
        }

        return NextResponse.json({ word, date: dateKey })
    } catch (error) {
        console.error('Error getting word of day:', error)
        const dateKey = getDateKey()
        return NextResponse.json(
            { word: getWordForDate(dateKey), date: dateKey },
            { status: 200 }
        )
    }
}

