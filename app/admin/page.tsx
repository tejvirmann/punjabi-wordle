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

    // Set default date to today when authenticated - MUST be before conditional return
    useEffect(() => {
        if (authenticated && !date) {
            const today = new Date().toISOString().split('T')[0]
            setDate(today)
        }
    }, [authenticated, date])

    useEffect(() => {
        // Check if password is required by trying to access without auth
        const checkAuthRequired = async () => {
            try {
                const response = await fetch('/api/admin/get-words')
                if (response.ok) {
                    // No password required
                    setAuthenticated(true)
                    const data = await response.json()
                    setSavedWords(data.words || {})
                } else if (response.status === 401) {
                    // Password required - check if already authenticated
                    const stored = sessionStorage.getItem('admin_authenticated')
                    const storedPassword = sessionStorage.getItem('admin_password')
                    if (stored === 'true' && storedPassword) {
                        setAuthenticated(true)
                        setPassword(storedPassword)
                        // Load words with password
                        const authResponse = await fetch('/api/admin/get-words', {
                            headers: {
                                'Authorization': `Bearer ${storedPassword}`
                            }
                        })
                        if (authResponse.ok) {
                            const authData = await authResponse.json()
                            setSavedWords(authData.words || {})
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking auth:', error)
            }
        }
        checkAuthRequired()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            // Try to get words with password
            const response = await fetch('/api/admin/get-words', {
                headers: password ? {
                    'Authorization': `Bearer ${password}`
                } : {}
            })

            if (response.ok) {
                setAuthenticated(true)
                sessionStorage.setItem('admin_authenticated', 'true')
                if (password) {
                    sessionStorage.setItem('admin_password', password)
                }
                const data = await response.json()
                setSavedWords(data.words || {})
                setMessage('Login successful!')
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Invalid password' }))
                setMessage(errorData.error || 'Invalid password')
            }
        } catch (error) {
            setMessage('Error logging in')
        } finally {
            setLoading(false)
        }
    }

    const loadSavedWords = async () => {
        try {
            const authPassword = password || sessionStorage.getItem('admin_password') || ''
            
            const response = await fetch('/api/admin/get-words', {
                headers: authPassword ? {
                    'Authorization': `Bearer ${authPassword}`
                } : {}
            })
            
            if (response.ok) {
                const data = await response.json()
                setSavedWords(data.words || {})
            } else {
                const errorData = await response.json().catch(() => ({}))
                console.error('Failed to load words:', errorData)
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
            const authPassword = password || sessionStorage.getItem('admin_password') || ''
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            }
            if (authPassword) {
                headers['Authorization'] = `Bearer ${authPassword}`
            }
            
            const response = await fetch('/api/admin/set-word', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    word,
                    date: date || undefined
                })
            })

            const data = await response.json()

            if (response.ok) {
                const successMsg = data.warning 
                    ? `Word "${data.word}" set for ${data.date} (${data.warning})`
                    : `Word "${data.word}" set for ${data.date}`
                setMessage(successMsg)
                setWord('')
                // Don't clear date, keep it for next entry
                loadSavedWords()
            } else {
                const errorMsg = data.error || 'Error setting word'
                setMessage(errorMsg)
                console.error('Error setting word:', data)
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
                <div style={{ 
                    maxWidth: '500px', 
                    marginBottom: '20px', 
                    padding: '15px', 
                    backgroundColor: '#f0f0f0', 
                    borderRadius: '4px',
                    fontSize: '14px'
                }}>
                    <strong>Password Protection:</strong>
                    <p style={{ margin: '10px 0 0 0' }}>
                        This admin panel is password-protected. To set a password:
                    </p>
                    <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
                        <li>Create a <code>.env.local</code> file in the project root</li>
                        <li>Add: <code>ADMIN_PASSWORD=your-password-here</code></li>
                        <li>Restart the development server</li>
                    </ol>
                    <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666' }}>
                        For Vercel deployment, add <code>ADMIN_PASSWORD</code> in Environment Variables.
                        If no password is set, the admin panel will be accessible without authentication.
                    </p>
                </div>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
                    <input
                        type="password"
                        placeholder="Enter password (if set)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                    {message && (
                        <div style={{ 
                            padding: '10px',
                            backgroundColor: message.includes('successful') ? '#efe' : '#fee',
                            color: message.includes('successful') ? '#060' : '#c00',
                            borderRadius: '4px',
                            marginTop: '10px'
                        }}>
                            {message}
                        </div>
                    )}
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
                            sessionStorage.removeItem('admin_password')
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
                    <div style={{ 
                        marginTop: '15px',
                        padding: '10px',
                        backgroundColor: message.includes('Error') || message.includes('Invalid') ? '#fee' : '#efe',
                        color: message.includes('Error') || message.includes('Invalid') ? '#c00' : '#060',
                        fontWeight: '600',
                        borderRadius: '4px',
                        border: `1px solid ${message.includes('Error') || message.includes('Invalid') ? '#fcc' : '#cfc'}`
                    }}>
                        {message}
                    </div>
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

