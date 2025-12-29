import { NextRequest, NextResponse } from 'next/server'
import { countCharacterUnits, PUNJABI_WORD_SET } from '../../../data/punjabiWords'

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

function getDateKey(dateString?: string): string {
    if (dateString) {
        const date = new Date(dateString)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export async function POST(request: NextRequest) {
    try {
        // Check password only if ADMIN_PASSWORD is set and not empty
        const expectedPassword = process.env.ADMIN_PASSWORD
        
        if (expectedPassword && expectedPassword.trim().length > 0) {
            const authHeader = request.headers.get('authorization')
            if (!authHeader || authHeader !== `Bearer ${expectedPassword}`) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                )
            }
        }
        // If no password is set or empty, allow access without authentication

        const body = await request.json()
        const { word, date } = body

        if (!word || typeof word !== 'string') {
            return NextResponse.json(
                { error: 'Word is required' },
                { status: 400 }
            )
        }

        // Validate word is exactly 5 character units
        const unitCount = countCharacterUnits(word)
        if (unitCount !== 5) {
            return NextResponse.json(
                { 
                    error: `Word must be exactly 5 character units, got ${unitCount}`,
                    word: word,
                    unitCount: unitCount
                },
                { status: 400 }
            )
        }

        // Validate word is in valid word set
        if (!PUNJABI_WORD_SET.has(word)) {
            return NextResponse.json(
                { 
                    error: 'Word is not in the valid word list',
                    word: word
                },
                { status: 400 }
            )
        }

        const dateKey = getDateKey(date)

        // Store in KV
        try {
            const kv = await getKV()
            if (kv) {
                await kv.set(`word:${dateKey}`, word)
                console.log(`Word "${word}" saved for date ${dateKey}`)
            } else {
                // Fallback: return success but note that KV is not configured
                console.warn('KV not configured, word not persisted')
                return NextResponse.json({
                    success: true,
                    word: word,
                    date: dateKey,
                    warning: 'KV not configured - word not persisted. Set up Vercel KV for persistent storage. For local development, you can use a file-based approach or set up KV.'
                })
            }
        } catch (error) {
            console.error('KV error:', error)
            return NextResponse.json(
                { error: 'Failed to save word', details: String(error) },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            word: word,
            date: dateKey,
            message: 'Word set successfully'
        })
    } catch (error) {
        console.error('Error setting word:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

