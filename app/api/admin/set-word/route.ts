import { NextRequest, NextResponse } from 'next/server'

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
        return new Date(dateString).toISOString().split('T')[0]
    }
    return new Date().toISOString().split('T')[0]
}

function normalizeWord(word: string): string {
    // Normalize to 5 Unicode characters (code points) - same as validation
    const cleaned = word.replace(/\s/g, '')
    const chars = Array.from(cleaned) // Properly handle Unicode
    if (chars.length >= 5) {
        return chars.slice(0, 5).join('')
    }
    return chars.join('').padEnd(5, ' ')
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

        const normalizedWord = normalizeWord(word)
        const dateKey = getDateKey(date)

        // Store in KV
        try {
            const kv = await getKV()
            if (kv) {
                await kv.set(`word:${dateKey}`, normalizedWord)
                console.log(`Word "${normalizedWord}" saved for date ${dateKey}`)
            } else {
                // Fallback: return success but note that KV is not configured
                console.warn('KV not configured, word not persisted')
                return NextResponse.json({
                    success: true,
                    word: normalizedWord,
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
            word: normalizedWord,
            date: dateKey
        })
    } catch (error) {
        console.error('Error setting word:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

