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

export async function GET(request: NextRequest) {
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

        // Get all words from KV (this is a simplified approach)
        // In production, you might want to use a different data structure
        const words: Record<string, string> = {}

        try {
            const kv = await getKV()
            if (kv) {
                // Get words for the next 30 days
                const today = new Date()
                for (let i = 0; i < 30; i++) {
                    const date = new Date(today)
                    date.setDate(date.getDate() + i)
                    const dateKey = date.toISOString().split('T')[0]
                    const word = await kv.get<string>(`word:${dateKey}`)
                    if (word) {
                        words[dateKey] = word
                    }
                }
            }
        } catch (error) {
            console.error('KV error:', error)
        }

        return NextResponse.json({ words })
    } catch (error) {
        console.error('Error getting words:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

