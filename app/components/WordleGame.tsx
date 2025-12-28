'use client'

import { useEffect, useState, useCallback } from 'react'

// Gurmukhi keyboard layout for Punjabi
// Consonants
const PUNJABI_CONSONANTS = [
    ['ੳ', 'ਅ', 'ੲ', 'ਸ', 'ਹ', 'ਕ', 'ਖ', 'ਗ', 'ਘ', 'ਙ'],
    ['ਚ', 'ਛ', 'ਜ', 'ਝ', 'ਞ', 'ਟ', 'ਠ', 'ਡ', 'ਢ', 'ਣ'],
    ['ਤ', 'ਥ', 'ਦ', 'ਧ', 'ਨ', 'ਪ', 'ਫ', 'ਬ', 'ਭ', 'ਮ'],
    ['ਯ', 'ਰ', 'ਲ', 'ਵ', 'ੜ', 'ਸ਼', 'ਖ਼', 'ਗ਼', 'ਜ਼', 'ਫ਼', 'ਲ਼']
];

// Matras (vowel diacritics) - these combine with previous consonant
const PUNJABI_MATRAS = [
    ['ਿ', 'ੀ', 'ੁ', 'ੂ', 'ੇ', 'ੈ', 'ੋ', 'ੌ'], // Sihari, Bihari, Aunkar, Dulankar, Hora, Kanora, Kana, Dulaen
    ['ੰ', 'ੱ', 'ਂ', '਼'] // Tippi, Adhak, Bindi, Pair Bindi
];

// Check if a character is a matra
function isMatra(char: string): boolean {
    return PUNJABI_MATRAS.flat().includes(char)
}

// Check if a character is a consonant
function isConsonant(char: string): boolean {
    return PUNJABI_CONSONANTS.flat().includes(char)
}

// Count character units (consonant + matra = 1 unit)
function countCharacterUnits(str: string): number {
    const chars = Array.from(str)
    let count = 0
    for (let i = 0; i < chars.length; i++) {
        if (isMatra(chars[i])) {
            // Matra doesn't count as separate unit, it's part of previous character
            continue
        }
        count++
    }
    return count
}

// Get character unit at index (consonant + following matras = 1 unit)
function getCharacterUnitAt(str: string, unitIndex: number): string {
    if (!str || unitIndex < 0) return ''
    
    const chars = Array.from(str)
    let unitCount = 0
    let currentUnitStart = -1
    
    // First, find which character index starts the requested unit
    // Matras don't start new units, they belong to the previous consonant
    for (let i = 0; i < chars.length; i++) {
        if (!isMatra(chars[i])) {
            // This is a new unit (consonant or vowel)
            if (unitCount === unitIndex) {
                currentUnitStart = i
                break
            }
            unitCount++
        }
        // Matras don't increment unitCount - they belong to the previous unit
    }
    
    // If we found the unit start, collect the consonant and all immediately following matras
    if (currentUnitStart >= 0 && currentUnitStart < chars.length) {
        let result = chars[currentUnitStart]
        // Collect all consecutive matras that follow this consonant
        let j = currentUnitStart + 1
        while (j < chars.length && isMatra(chars[j])) {
            result += chars[j]
            j++
        }
        return result
    }
    
    // Unit index is beyond the available units
    return ''
}

// Combined keyboard for display
const PUNJABI_KEYBOARD = [
    ...PUNJABI_CONSONANTS,
    PUNJABI_MATRAS[0], // Main matras row
    PUNJABI_MATRAS[1]  // Additional diacritics
];

interface WordleGameProps {
  targetWord: string
}

export default function PunjabiWordleGame({ targetWord }: WordleGameProps) {
    const wordLength = 5
    const maxGuesses = 6
    const [currentGuess, setCurrentGuess] = useState('')
    const [guesses, setGuesses] = useState<string[]>([])
    const [currentRow, setCurrentRow] = useState(0)
    const [gameOver, setGameOver] = useState(false)
    const [message, setMessage] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [won, setWon] = useState(false)
    const [keyStates, setKeyStates] = useState<Record<string, 'correct' | 'present' | 'absent' | null>>({})

    const handleKeyPress = useCallback((key: string) => {
        if (gameOver) return
        
        // Count character units (consonant + matra = 1 unit)
        const currentUnitCount = countCharacterUnits(currentGuess)
        
        // If it's a matra, it should combine with the previous character
        if (isMatra(key)) {
            // Matras can only be added if there's a previous character
            if (currentUnitCount === 0) {
                // Can't start with a matra
                setMessage('ਮਾਤਰਾ ਤੋਂ ਪਹਿਲਾਂ ਵਿਅੰਜਨ ਟਾਈਪ ਕਰੋ')
                setTimeout(() => setMessage(''), 2000)
                return
            }
            
            // Matras can always be added to the last character, even if we've reached 5 units
            // because matras don't count as separate units - they're part of the previous unit
            // No need to check unit count for matras - they just combine with the last character
            setCurrentGuess(prev => prev + key)
        } else {
            // It's a consonant or other character - counts as a new unit
            if (currentUnitCount >= wordLength) return
            setCurrentGuess(prev => prev + key)
        }
    }, [gameOver, currentGuess, wordLength])

    const handleBackspace = useCallback(() => {
        if (currentGuess.length > 0) {
            // Remove last character (handles multi-byte Unicode correctly)
            const chars = Array.from(currentGuess)
            chars.pop()
            setCurrentGuess(chars.join(''))
        }
    }, [currentGuess])

    const evaluateGuess = useCallback((guess: string): ('correct' | 'present' | 'absent')[] => {
        const evaluation: ('correct' | 'present' | 'absent')[] = []
        
        // Get character units for both guess and target
        const targetUnits: string[] = []
        const guessUnits: string[] = []
        
        for (let i = 0; i < wordLength; i++) {
            targetUnits.push(getCharacterUnitAt(targetWord, i))
            guessUnits.push(getCharacterUnitAt(guess, i))
        }
        
        const used = new Array(wordLength).fill(false)

        // First pass: mark correct positions (compare full character units)
        for (let i = 0; i < wordLength; i++) {
            if (guessUnits[i] === targetUnits[i]) {
                evaluation[i] = 'correct'
                used[i] = true
            }
        }

        // Second pass: mark present letters (compare character units)
        for (let i = 0; i < wordLength; i++) {
            if (evaluation[i]) continue

            for (let j = 0; j < wordLength; j++) {
                if (!used[j] && guessUnits[i] === targetUnits[j]) {
                    evaluation[i] = 'present'
                    used[j] = true
                    break
                }
            }

            if (!evaluation[i]) {
                evaluation[i] = 'absent'
            }
        }

        return evaluation
    }, [targetWord, wordLength])

    const submitGuess = useCallback(async () => {
        // Count character units (consonant + matra = 1 unit)
        const guessUnitCount = countCharacterUnits(currentGuess)
        if (guessUnitCount !== wordLength) {
            setMessage('5 ਅੱਖਰ ਭਰੋ')
            setTimeout(() => setMessage(''), 2000)
            return
        }

        // Validate word
        try {
            const response = await fetch('/api/validate-word', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ word: currentGuess }),
            })

            const data = await response.json()
            
            if (!data.isValid) {
                setMessage('ਇਹ ਸ਼ਬਦ ਮਾਨਤਾ ਪ੍ਰਾਪਤ ਨਹੀਂ ਹੈ')
                setTimeout(() => setMessage(''), 2000)
                return
            }
        } catch (error) {
            console.error('Error validating word:', error)
            // Continue with guess even if validation fails
        }

        const evaluation = evaluateGuess(currentGuess)
        const newGuesses = [...guesses, currentGuess]
        setGuesses(newGuesses)

        // Update keyboard states - iterate through character units
        const newKeyStates = { ...keyStates }
        for (let i = 0; i < wordLength; i++) {
            const unit = getCharacterUnitAt(currentGuess, i)
            const status = evaluation[i]
            
            // Update state for each character in the unit
            Array.from(unit).forEach((char) => {
                const currentStatus = newKeyStates[char]
                if (status === 'correct' || 
                    (status === 'present' && currentStatus !== 'correct') ||
                    (status === 'absent' && !currentStatus)) {
                    newKeyStates[char] = status
                }
            })
        }
        setKeyStates(newKeyStates)

        // Check win condition
        if (currentGuess === targetWord) {
            setGameOver(true)
            setWon(true)
            setTimeout(() => setShowModal(true), 2000)
            return
        }

        // Check lose condition
        if (currentRow >= maxGuesses - 1) {
            setGameOver(true)
            setWon(false)
            setTimeout(() => setShowModal(true), 2000)
            return
        }

        setCurrentRow(prev => prev + 1)
        setCurrentGuess('')
    }, [currentGuess, wordLength, guesses, evaluateGuess, keyStates, targetWord, currentRow, maxGuesses])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameOver) return

            if (e.key === 'Enter') {
                submitGuess()
            } else if (e.key === 'Backspace') {
                handleBackspace()
            } else if (e.key.length === 1) {
                // Check for consonants and matras
                const allChars = [
                    ...PUNJABI_CONSONANTS.flat(),
                    ...PUNJABI_MATRAS.flat()
                ]
                if (allChars.includes(e.key)) {
                    handleKeyPress(e.key)
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [gameOver, submitGuess, handleBackspace, handleKeyPress])

    const reset = () => {
        setCurrentGuess('')
        setGuesses([])
        setCurrentRow(0)
        setGameOver(false)
        setShowModal(false)
        setMessage('')
        setKeyStates({})
        // Reload page to get new word of the day
        window.location.reload()
    }

    const getTileState = (row: number, col: number): string => {
        if (row < guesses.length) {
            const evaluation = evaluateGuess(guesses[row])
            // Evaluation is now based on character units, so col directly maps to evaluation index
            return evaluation[col] || ''
        }
        const currentUnitCount = countCharacterUnits(currentGuess)
        if (row === currentRow && col < currentUnitCount) {
            return 'filled'
        }
        return ''
    }

    const getMatraName = (matra: string): string => {
        const matraNames: Record<string, string> = {
            'ਿ': 'Sihari (i)',
            'ੀ': 'Bihari (ī)',
            'ੁ': 'Aunkar (u)',
            'ੂ': 'Dulankar (ū)',
            'ੇ': 'Hora (e)',
            'ੈ': 'Kanora (ai)',
            'ੋ': 'Kana (o)',
            'ੌ': 'Dulaen (au)',
            'ੰ': 'Tippi (ṃ)',
            'ੱ': 'Adhak (double consonant)',
            'ਂ': 'Bindi (ṃ)',
            '਼': 'Pair Bindi (aspirated)'
        }
        return matraNames[matra] || ''
    }

    return (
        <div className="container">
            <header>
                <h1>ਪੰਜਾਬੀ ਵਰਡਲ</h1>
            </header>

            <div className="game-board">
                {Array.from({ length: maxGuesses }).map((_, row) =>
                    Array.from({ length: wordLength }).map((_, col) => {
                        const state = getTileState(row, col)
                        const currentStr = row === currentRow ? currentGuess : (guesses[row] || '')
                        
                        // Get character unit at this position (consonant + matras = 1 unit)
                        // Only show if we have a valid unit at this position
                        const unitCount = countCharacterUnits(currentStr)
                        let displayChar = col < unitCount ? getCharacterUnitAt(currentStr, col) : ''
                        
                        // Safety check: never show a matra alone (should always be with a consonant)
                        if (displayChar && isMatra(displayChar[0]) && !isConsonant(displayChar[0])) {
                            displayChar = ''
                        }

                        return (
                            <div
                                key={`${row}-${col}`}
                                className={`tile ${state}`}
                            >
                                {displayChar}
                            </div>
                        )
                    })
                )}
            </div>

            <div className="keyboard">
                {/* Consonants */}
                {PUNJABI_CONSONANTS.map((row, rowIdx) => (
                    <div key={`cons-${rowIdx}`} className="keyboard-row">
                        {row.map((keyChar) => {
                            const keyState = keyStates[keyChar] || ''
                            return (
                                <button
                                    key={keyChar}
                                    className={`key ${keyState}`}
                                    onClick={() => handleKeyPress(keyChar)}
                                    disabled={gameOver}
                                >
                                    {keyChar}
                                </button>
                            )
                        })}
                    </div>
                ))}
                {/* Matras Row 1 */}
                <div className="keyboard-row">
                    {PUNJABI_MATRAS[0].map((keyChar) => {
                        const keyState = keyStates[keyChar] || ''
                        return (
                            <button
                                key={keyChar}
                                className={`key ${keyState}`}
                                onClick={() => handleKeyPress(keyChar)}
                                disabled={gameOver}
                                title={getMatraName(keyChar)}
                            >
                                {keyChar}
                            </button>
                        )
                    })}
                </div>
                {/* Matras Row 2 */}
                <div className="keyboard-row">
                    {PUNJABI_MATRAS[1].map((keyChar) => {
                        const keyState = keyStates[keyChar] || ''
                        return (
                            <button
                                key={keyChar}
                                className={`key ${keyState}`}
                                onClick={() => handleKeyPress(keyChar)}
                                disabled={gameOver}
                                title={getMatraName(keyChar)}
                            >
                                {keyChar}
                            </button>
                        )
                    })}
                </div>
                {/* Control buttons */}
                <div className="keyboard-row">
                    <button
                        className="key wide"
                        onClick={submitGuess}
                        disabled={gameOver}
                    >
                        Enter
                    </button>
                    <button
                        className="key wide"
                        onClick={handleBackspace}
                        disabled={gameOver}
                    >
                        ⌫
                    </button>
                </div>
            </div>

            <div className="message">{message}</div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>{won ? 'ਤੁਸੀਂ ਜਿੱਤ ਗਏ!' : 'ਤੁਸੀਂ ਹਾਰ ਗਏ'}</h2>
                        <p>ਸ਼ਬਦ ਸੀ: {targetWord}</p>
                        <button className="play-again-btn" onClick={reset}>
                            ਫਿਰ ਖੇਡੋ
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

