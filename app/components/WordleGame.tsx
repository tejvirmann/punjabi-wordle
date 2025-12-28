'use client'

import { useEffect, useState, useCallback } from 'react'

// Gurmukhi keyboard layout for Punjabi
const PUNJABI_KEYBOARD = [
    ['ੳ', 'ਅ', 'ੲ', 'ਸ', 'ਹ', 'ਕ', 'ਖ', 'ਗ', 'ਘ', 'ਙ'],
    ['ਚ', 'ਛ', 'ਜ', 'ਝ', 'ਞ', 'ਟ', 'ਠ', 'ਡ', 'ਢ', 'ਣ'],
    ['ਤ', 'ਥ', 'ਦ', 'ਧ', 'ਨ', 'ਪ', 'ਫ', 'ਬ', 'ਭ', 'ਮ'],
    ['ਯ', 'ਰ', 'ਲ', 'ਵ', 'ੜ', 'ਸ਼', 'ਖ਼', 'ਗ਼', 'ਜ਼', 'ਫ਼', 'ਲ਼']
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
        if (gameOver || currentGuess.length >= wordLength) return
        setCurrentGuess(prev => prev + key)
    }, [gameOver, currentGuess.length, wordLength])

    const handleBackspace = useCallback(() => {
        if (currentGuess.length > 0) {
            setCurrentGuess(prev => prev.slice(0, -1))
        }
    }, [currentGuess.length])

    const evaluateGuess = useCallback((guess: string): ('correct' | 'present' | 'absent')[] => {
        const evaluation: ('correct' | 'present' | 'absent')[] = []
        const targetArray = targetWord.split('')
        const guessArray = guess.split('')
        const used = new Array(wordLength).fill(false)

        // First pass: mark correct positions
        for (let i = 0; i < wordLength; i++) {
            if (guessArray[i] === targetArray[i]) {
                evaluation[i] = 'correct'
                used[i] = true
            }
        }

        // Second pass: mark present letters
        for (let i = 0; i < wordLength; i++) {
            if (evaluation[i]) continue

            for (let j = 0; j < wordLength; j++) {
                if (!used[j] && guessArray[i] === targetArray[j]) {
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

    const submitGuess = useCallback(() => {
        if (currentGuess.length !== wordLength) {
            setMessage('5 ਅੱਖਰ ਭਰੋ')
            setTimeout(() => setMessage(''), 2000)
            return
        }

        const evaluation = evaluateGuess(currentGuess)
        const newGuesses = [...guesses, currentGuess]
        setGuesses(newGuesses)

        // Update keyboard states
        const newKeyStates = { ...keyStates }
        currentGuess.split('').forEach((char, index) => {
            const status = evaluation[index]
            const currentStatus = newKeyStates[char]
            
            if (status === 'correct' || 
                (status === 'present' && currentStatus !== 'correct') ||
                (status === 'absent' && !currentStatus)) {
                newKeyStates[char] = status
            }
        })
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
                const punjabiChars = PUNJABI_KEYBOARD.flat()
                if (punjabiChars.includes(e.key)) {
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
            return evaluation[col]
        }
        if (row === currentRow && col < currentGuess.length) {
            return 'filled'
        }
        return ''
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
                        const guess = guesses[row]
                        const char = row === currentRow && col < currentGuess.length 
                            ? currentGuess[col] 
                            : guess ? guess[col] : ''

                        return (
                            <div
                                key={`${row}-${col}`}
                                className={`tile ${state}`}
                            >
                                {char}
                            </div>
                        )
                    })
                )}
            </div>

            <div className="keyboard">
                {PUNJABI_KEYBOARD.map((row, rowIdx) => (
                    <div key={rowIdx} className="keyboard-row">
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

