'use client'

import { useEffect, useState } from 'react'
import PunjabiWordleGame from './components/WordleGame'

export default function Home() {
  const [targetWord, setTargetWord] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get word of the day
    const getWordOfDay = async () => {
      try {
        const response = await fetch('/api/word-of-day')
        const data = await response.json()
        setTargetWord(data.word)
      } catch (error) {
        console.error('Error fetching word:', error)
        // Fallback to a default word
        setTargetWord('ਸੱਚਾ')
      } finally {
        setLoading(false)
      }
    }

    getWordOfDay()
  }, [])

  if (loading) {
    return (
      <div className="container">
        <header>
          <h1>ਪੰਜਾਬੀ ਵਰਡਲ</h1>
        </header>
        <div>Loading...</div>
      </div>
    )
  }

  if (!targetWord) {
    return (
      <div className="container">
        <header>
          <h1>ਪੰਜਾਬੀ ਵਰਡਲ</h1>
        </header>
        <div>Error loading word</div>
      </div>
    )
  }

  return <PunjabiWordleGame targetWord={targetWord} />
}

