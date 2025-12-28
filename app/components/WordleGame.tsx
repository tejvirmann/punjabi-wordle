'use client'

import { useEffect, useState, useCallback } from 'react'

// Gurmukhi keyboard layout for Punjabi - matching standard alphabet table
// Vowels (first row)
const PUNJABI_VOWELS = ['ੳ', 'ਅ', 'ੲ', 'ਸ', 'ਹ'];

// Consonants in rows of 5 (matching Gurmukhi alphabet table)
const PUNJABI_CONSONANTS = [
    ['ਕ', 'ਖ', 'ਗ', 'ਘ', 'ਙ'],  // Row 1
    ['ਚ', 'ਛ', 'ਜ', 'ਝ', 'ਞ'],  // Row 2
    ['ਟ', 'ਠ', 'ਡ', 'ਢ', 'ਣ'],  // Row 3
    ['ਤ', 'ਥ', 'ਦ', 'ਧ', 'ਨ'],  // Row 4
    ['ਪ', 'ਫ', 'ਬ', 'ਭ', 'ਮ'],  // Row 5
    ['ਯ', 'ਰ', 'ਲ', 'ਵ', 'ੜ'],  // Row 6
    ['ਸ਼', 'ਖ਼', 'ਗ਼', 'ਜ਼', 'ਫ਼'], // Row 7
    ['ਲ਼']  // Row 8 (can add more if needed)
];

// Matras (vowel diacritics) - these combine with previous consonant
// Organized in rows of 5 to match standard layout
const PUNJABI_MATRAS = [
    ['ਿ', 'ੀ', 'ੁ', 'ੂ', 'ੇ'], // Sihari (i), Bihari (ee), Aunkar (u), Dulankar (oo), Hora (e)
    ['ੈ', 'ੋ', 'ੌ', 'ਾ', 'ੰ'], // Kanora (ai), Kana (o), Dulaen (au), Aa (aa - the horizontal dash), Tippi
    ['ੱ', 'ਂ', '਼'] // Adhak (double consonant), Bindi, Pair Bindi
];

// Check if a character is a matra
function isMatra(char: string): boolean {
    // Include the "aa" matra (ਾ) which is commonly used
    const allMatras = [...PUNJABI_MATRAS.flat(), 'ਾ']
    return allMatras.includes(char)
}

// Virama (੍) is a combining character that creates conjuncts
function isVirama(char: string): boolean {
    return char === '੍' // U+0A4D GURMUKHI SIGN VIRAMA
}

// Check if a character is a consonant or vowel
function isConsonant(char: string): boolean {
    return PUNJABI_CONSONANTS.flat().includes(char) || PUNJABI_VOWELS.includes(char)
}

// Count character units (consonant + matra = 1 unit, virama doesn't count)
function countCharacterUnits(str: string): number {
    const chars = Array.from(str)
    let count = 0
    for (let i = 0; i < chars.length; i++) {
        // Skip matras and virama - they don't count as separate units
        if (isMatra(chars[i]) || isVirama(chars[i])) {
            continue
        }
        count++
    }
    return count
}

// Get character unit at index (consonant + virama + following consonant + matras = 1 unit)
function getCharacterUnitAt(str: string, unitIndex: number): string {
    if (!str || unitIndex < 0) return ''
    
    const chars = Array.from(str)
    let unitCount = 0
    let currentUnitStart = -1
    
    // First, find which character index starts the requested unit
    // Matras and virama don't start new units
    for (let i = 0; i < chars.length; i++) {
        if (!isMatra(chars[i]) && !isVirama(chars[i])) {
            // This is a new unit (consonant or vowel)
            if (unitCount === unitIndex) {
                currentUnitStart = i
                break
            }
            unitCount++
        }
    }
    
    // If we found the unit start, collect the consonant, virama (if present), next consonant, and matras
    if (currentUnitStart >= 0 && currentUnitStart < chars.length) {
        let result = chars[currentUnitStart]
        let j = currentUnitStart + 1
        
        // Check for virama (creates conjunct)
        if (j < chars.length && isVirama(chars[j])) {
            result += chars[j]
            j++
            // After virama, there's usually another consonant
            if (j < chars.length && !isMatra(chars[j]) && !isVirama(chars[j])) {
                result += chars[j]
                j++
            }
        }
        
        // Collect all consecutive matras that follow
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
    const [hintsUsed, setHintsUsed] = useState(0)
    const [hintedPositions, setHintedPositions] = useState<Set<number>>(new Set())

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
                // Check for vowels, consonants and matras
                const allChars = [
                    ...PUNJABI_VOWELS,
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

    const useHint = useCallback(() => {
        if (gameOver || hintsUsed >= wordLength) {
            setMessage('All hints used')
            setTimeout(() => setMessage(''), 2000)
            return
        }
        
        // Get target word units (consonant + matras = 1 unit)
        const targetUnits: string[] = []
        for (let i = 0; i < wordLength; i++) {
            targetUnits.push(getCharacterUnitAt(targetWord, i))
        }
        
        // Reveal letters sequentially from left to right
        // hintsUsed tells us how many letters to reveal (0-based, so hintsUsed = 1 means reveal first letter)
        const lettersToReveal = hintsUsed + 1
        
        // Build the new guess: first N letters from target, rest from current guess (or empty)
        const newUnits: string[] = []
        const currentUnitCount = countCharacterUnits(currentGuess)
        
        for (let i = 0; i < wordLength; i++) {
            if (i < lettersToReveal) {
                // Reveal this position with the correct unit (includes matras automatically)
                newUnits.push(targetUnits[i])
            } else if (i < currentUnitCount) {
                // Keep existing guess for positions not yet revealed
                newUnits.push(getCharacterUnitAt(currentGuess, i))
            } else {
                // Empty position
                newUnits.push('')
            }
        }
        
        // Rebuild the guess string by joining all units
        const newGuess = newUnits.join('')
        
        setCurrentGuess(newGuess)
        setHintsUsed(prev => prev + 1)
        // Track all revealed positions
        const newHintedPositions = new Set<number>()
        for (let i = 0; i < lettersToReveal; i++) {
            newHintedPositions.add(i)
        }
        setHintedPositions(newHintedPositions)
        setMessage(`💡 Hint: ${lettersToReveal} letter${lettersToReveal > 1 ? 's' : ''} revealed`)
        setTimeout(() => setMessage(''), 2000)
    }, [gameOver, hintsUsed, currentGuess, targetWord, wordLength])
    
    const reset = () => {
        setCurrentGuess('')
        setGuesses([])
        setCurrentRow(0)
        setGameOver(false)
        setShowModal(false)
        setMessage('')
        setKeyStates({})
        setHintsUsed(0)
        setHintedPositions(new Set())
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
            'ੀ': 'Bihari (ī/ee)',
            'ੁ': 'Aunkar (u)',
            'ੂ': 'Dulankar (ū/oo)',
            'ੇ': 'Hora (e)',
            'ੈ': 'Kanora (ai)',
            'ੋ': 'Kana (o)',
            'ੌ': 'Dulaen (au)',
            'ਾ': 'Aa (aa - horizontal dash)',
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
                {/* Vowels (first row) */}
                <div className="keyboard-row">
                    {PUNJABI_VOWELS.map((keyChar) => {
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
                {/* Consonants in rows of 5 */}
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
                        {/* Pad row if less than 5 characters */}
                        {Array.from({ length: 5 - row.length }).map((_, i) => (
                            <div key={`pad-${i}`} className="key" style={{ visibility: 'hidden' }} />
                        ))}
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
                {/* Matras Row 3 (if exists) */}
                {PUNJABI_MATRAS[2] && (
                    <div className="keyboard-row">
                        {PUNJABI_MATRAS[2].map((keyChar) => {
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
                )}
                {/* Control buttons */}
                <div className="keyboard-row keyboard-control-row">
                    <button
                        className="key extra-wide"
                        onClick={submitGuess}
                        disabled={gameOver}
                    >
                        Enter
                    </button>
                    <button
                        className="key extra-wide"
                        onClick={handleBackspace}
                        disabled={gameOver}
                    >
                        ⌫
                    </button>
                </div>
            </div>

            <div className="message">{message}</div>
            
            {/* Hint Button */}
            {!gameOver && (
                <button
                    className="hint-btn"
                    onClick={useHint}
                    disabled={hintsUsed >= wordLength}
                >
                    💡 Hint ({hintsUsed}/{wordLength})
                </button>
            )}

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

