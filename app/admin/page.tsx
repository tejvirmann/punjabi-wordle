'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPanel() {
    const [password, setPassword] = useState('')
    const [authenticated, setAuthenticated] = useState(false)
    const [word, setWord] = useState('')
    const [date, setDate] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [savedWords, setSavedWords] = useState<Record<string, string>>({})
    const router = useRouter()

    useEffect(() => {
        // Check if already authenticated (simple client-side check)
        const stored = sessionStorage.getItem('admin_authenticated')
        if (stored === 'true') {
            setAuthenticated(true)
            loadSavedWords()
        }
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            // Verify password by trying to get words
            const response = await fetch('/api/admin/get-words', {
                headers: {
                    'Authorization': `Bearer ${password}`
                }
            })

            if (response.ok) {
                setAuthenticated(true)
                sessionStorage.setItem('admin_authenticated', 'true')
                sessionStorage.setItem('admin_password', password)
                const data = await response.json()
                setSavedWords(data.words || {})
                setMessage('Login successful!')
            } else {
                setMessage('Invalid password')
            }
        } catch (error) {
            setMessage('Error logging in')
        } finally {
            setLoading(false)
        }
    }

    const loadSavedWords = async () => {
        try {
            const response = await fetch('/api/admin/get-words', {
                headers: {
                    'Authorization': `Bearer ${password || sessionStorage.getItem('admin_password') || ''}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setSavedWords(data.words || {})
            }
        } catch (error) {
            console.error('Error loading words:', error)
        }
    }

    const handleSetWord = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!word || word.length < 5) {
            setMessage('Word must be at least 5 characters')
            return
        }

        setLoading(true)
        setMessage('')

        try {
            const response = await fetch('/api/admin/set-word', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${password || sessionStorage.getItem('admin_password') || ''}`
                },
                body: JSON.stringify({
                    word,
                    date: date || undefined
                })
            })

            const data = await response.json()

            if (response.ok) {
                setMessage(`Word "${data.word}" set for ${data.date}`)
                setWord('')
                setDate('')
                loadSavedWords()
            } else {
                setMessage(data.error || 'Error setting word')
            }
        } catch (error) {
            setMessage('Error setting word')
        } finally {
            setLoading(false)
        }
    }

    if (!authenticated) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                flexDirection: 'column',
                padding: '20px'
            }}>
                <h1 style={{ marginBottom: '20px' }}>Admin Panel</h1>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ padding: '10px', fontSize: '16px' }}
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ 
                            padding: '10px', 
                            fontSize: '16px', 
                            backgroundColor: '#6aaa64',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                    {message && <p style={{ color: message.includes('successful') ? 'green' : 'red' }}>{message}</p>}
                </form>
                <button 
                    onClick={() => router.push('/')}
                    style={{ 
                        marginTop: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#787c7e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Back to Game
                </button>
            </div>
        )
    }

    // Set default date to today
    useEffect(() => {
        if (!date) {
            const today = new Date().toISOString().split('T')[0]
            setDate(today)
        }
    }, [date])

    return (
        <div style={{ 
            minHeight: '100vh', 
            padding: '20px',
            maxWidth: '800px',
            margin: '0 auto'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>Admin Panel</h1>
                <div>
                    <button 
                        onClick={() => router.push('/')}
                        style={{ 
                            padding: '10px 20px',
                            backgroundColor: '#787c7e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '10px'
                        }}
                    >
                        Back to Game
                    </button>
                    <button 
                        onClick={() => {
                            setAuthenticated(false)
                            sessionStorage.removeItem('admin_authenticated')
                            setPassword('')
                        }}
                        style={{ 
                            padding: '10px 20px',
                            backgroundColor: '#c9b458',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ marginBottom: '15px' }}>Set Word for Date</h2>
                <form onSubmit={handleSetWord} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                            Date:
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            style={{ 
                                padding: '10px', 
                                fontSize: '16px',
                                width: '100%',
                                maxWidth: '300px',
                                border: '1px solid #d3d6da',
                                borderRadius: '4px'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                            Word (5 characters):
                        </label>
                        <input
                            type="text"
                            value={word}
                            onChange={(e) => setWord(e.target.value)}
                            placeholder="Enter Punjabi word"
                            required
                            maxLength={10}
                            style={{ 
                                padding: '10px', 
                                fontSize: '16px',
                                width: '100%',
                                maxWidth: '300px',
                                border: '1px solid #d3d6da',
                                borderRadius: '4px',
                                fontFamily: 'inherit'
                            }}
                        />
                        <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                            Word will be normalized to 5 characters
                        </p>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ 
                            padding: '12px 24px', 
                            fontSize: '16px', 
                            backgroundColor: '#6aaa64',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '700',
                            maxWidth: '300px'
                        }}
                    >
                        {loading ? 'Saving...' : 'Set Word'}
                    </button>
                </form>
                {message && (
                    <p style={{ 
                        marginTop: '15px',
                        color: message.includes('Error') ? 'red' : 'green',
                        fontWeight: '600'
                    }}>
                        {message}
                    </p>
                )}
            </div>

            <div>
                <h2 style={{ marginBottom: '15px' }}>Saved Words</h2>
                {Object.keys(savedWords).length === 0 ? (
                    <p style={{ color: '#666' }}>No words set yet</p>
                ) : (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '10px'
                    }}>
                        {Object.entries(savedWords).map(([dateKey, word]) => (
                            <div 
                                key={dateKey}
                                style={{
                                    padding: '15px',
                                    border: '1px solid #d3d6da',
                                    borderRadius: '4px',
                                    backgroundColor: '#f9f9f9'
                                }}
                            >
                                <div style={{ fontWeight: '600', marginBottom: '5px' }}>{dateKey}</div>
                                <div style={{ fontSize: '24px' }}>{word}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

