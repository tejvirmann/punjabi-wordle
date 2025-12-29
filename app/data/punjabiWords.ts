// Comprehensive Punjabi word list for validation
// All words normalized to exactly 5 character units (consonant + matra = 1 unit)

// Helper functions for character unit counting
function isMatra(char: string): boolean {
    const matras = ['ਿ', 'ੀ', 'ੁ', 'ੂ', 'ੇ', 'ੈ', 'ੋ', 'ੌ', 'ਾ', 'ੰ', 'ੱ', 'ਂ', '਼']
    return matras.includes(char)
}

// Virama (੍) is a combining character that creates conjuncts - it doesn't count as a separate unit
function isVirama(char: string): boolean {
    return char === '੍' // U+0A4D GURMUKHI SIGN VIRAMA
}

function countCharacterUnits(str: string): number {
    const chars = Array.from(str)
    let count = 0
    let i = 0
    
    while (i < chars.length) {
        if (isMatra(chars[i])) {
            // Matra belongs to previous unit, skip it
            i++
        } else if (isVirama(chars[i])) {
            // Virama creates a conjunct - the previous consonant + virama + next consonant = 1 unit
            // We already counted the previous consonant, so just skip the virama
            // The next consonant will be part of this same unit
            i++
            // Skip the next consonant too (it's part of the conjunct)
            if (i < chars.length && !isMatra(chars[i]) && !isVirama(chars[i])) {
                i++
            }
        } else {
            // Regular consonant or vowel - check if it's followed by virama
            if (i + 1 < chars.length && isVirama(chars[i + 1])) {
                // This is the start of a conjunct - count it as 1 unit
                count++
                i += 2 // Skip this consonant and the virama
                // Skip the next consonant (part of conjunct) and any matras
                while (i < chars.length && (isMatra(chars[i]) || (!isMatra(chars[i]) && !isVirama(chars[i])))) {
                    if (!isMatra(chars[i]) && !isVirama(chars[i])) {
                        i++ // Skip the second consonant of conjunct
                        break
                    }
                    i++ // Skip matras
                }
            } else {
                // Regular consonant/vowel
                count++
                i++
            }
        }
    }
    
    return count
}

function normalizeTo5Units(word: string): string {
    const cleaned = word.replace(/\s/g, '')
    const originalUnitCount = countCharacterUnits(cleaned)
    
    // If word is already exactly 5 units, return as-is
    if (originalUnitCount === 5) {
        return cleaned
    }
    
    // If word has more than 5 units, truncate to 5
    // If word has less than 5 units, we'll filter it out (handled in filter)
    const chars = Array.from(cleaned)
    let result = ''
    let unitCount = 0
    
    for (let i = 0; i < chars.length && unitCount < 5; i++) {
        if (isMatra(chars[i])) {
            // Matra belongs to previous unit, add it
            result += chars[i]
        } else if (isVirama(chars[i])) {
            // Virama creates conjuncts - add it to the previous consonant
            result += chars[i]
        } else {
            // New unit (consonant or vowel)
            if (unitCount < 5) {
                result += chars[i]
                unitCount++
                // Collect following virama, then matras
                let j = i + 1
                // First collect virama if present (for conjuncts)
                if (j < chars.length && isVirama(chars[j])) {
                    result += chars[j]
                    j++
                    // After virama, there's usually another consonant
                    if (j < chars.length && !isMatra(chars[j]) && !isVirama(chars[j])) {
                        result += chars[j]
                        j++
                    }
                }
                // Then collect following matras
                while (j < chars.length && isMatra(chars[j]) && unitCount <= 5) {
                    result += chars[j]
                    j++
                }
                i = j - 1 // Skip processed characters
            }
        }
    }
    
    return result
}

export const PUNJABI_VALID_WORDS = [
    // Common 5-character words
    'ਸੱਚਾ', 'ਪਿਆਰ', 'ਖੁਸ਼ੀ', 'ਸੁੰਦਰ', 'ਮਿੱਠਾ',
    'ਬਹਾਦਰ', 'ਸਾਫ਼', 'ਤਾਜ਼ਾ', 'ਗਰਮ', 'ਠੰਡਾ',
    'ਵੱਡਾ', 'ਛੋਟਾ', 'ਨਵਾਂ', 'ਪੁਰਾਣਾ', 'ਸੁਣਹਿਰੀ',
    'ਕਾਲਾ', 'ਸਫ਼ੈਦ', 'ਲਾਲ', 'ਹਰਾ', 'ਨੀਲਾ',
    'ਖਾਣਾ', 'ਪੀਣਾ', 'ਸੌਣਾ', 'ਉਠਣਾ', 'ਚੱਲਣਾ',
    'ਬੋਲਣਾ', 'ਸੁਣਣਾ', 'ਦੇਖਣਾ', 'ਸੋਚਣਾ', 'ਕਰਣਾ',
    'ਰੋਟੀ', 'ਦਾਲ', 'ਸਬਜ਼ੀ', 'ਫਲ', 'ਪਾਣੀ',
    'ਸੂਰਜ', 'ਚੰਦ', 'ਤਾਰਾ', 'ਬੱਦਲ', 'ਬਾਰਿਸ਼',
    'ਪੰਛੀ', 'ਕੁੱਤਾ', 'ਬਿੱਲੀ', 'ਘੋੜਾ', 'ਗਾਂ',
    'ਕਿਤਾਬ', 'ਕਲਮ', 'ਮੇਜ਼', 'ਕੁਰਸੀ', 'ਖਿੜਕੀ',
    'ਦਰਵਾਜ਼ਾ', 'ਲਾਲਟੈਨ', 'ਚਾਹ', 'ਦੁੱਧ', 'ਸ਼ੱਕਰ',
    'ਮਿੱਟੀ', 'ਪੱਥਰ', 'ਲੱਕੜ', 'ਲੋਹਾ', 'ਸੋਨਾ',
    'ਚਾਂਦੀ', 'ਤਾਂਬਾ', 'ਕੱਪੜਾ', 'ਜੁੱਤੀ', 'ਟੋਪੀ',
    'ਬਸਤਾ', 'ਕਾਗਜ਼', 'ਸਿਆਹੀ', 'ਰਬੜ', 'ਪੈਨਸਿਲ',
    'ਸਕੂਲ', 'ਕਲਾਸ', 'ਅਧਿਆਪਕ', 'ਵਿਦਿਆਰਥੀ', 'ਮਿੱਤਰ',
    'ਦੋਸਤ', 'ਪਰਿਵਾਰ', 'ਮਾਤਾ', 'ਪਿਤਾ', 'ਭਰਾ',
    'ਭੈਣ', 'ਚਾਚਾ', 'ਤਾਇਆ', 'ਮਾਮਾ', 'ਚਾਚੀ',
    'ਤਾਈ', 'ਮਾਮੀ', 'ਦਾਦਾ', 'ਦਾਦੀ', 'ਨਾਨਾ',
    'ਨਾਨੀ', 'ਪੋਤਾ', 'ਪੋਤੀ', 'ਧੀ', 'ਪੁੱਤਰ',
    'ਬੇਟਾ', 'ਬੇਟੀ', 'ਪਤਨੀ', 'ਪਤੀ', 'ਭੂਖ',
    'ਪਿਆਸ', 'ਥਕਾਵਟ', 'ਨੀਂਦ', 'ਸੁਪਨਾ', 'ਖੁਸ਼ੀ',
    'ਦੁੱਖ', 'ਗੁੱਸਾ', 'ਡਰ', 'ਪਿਆਰ', 'ਸ਼ਾਂਤੀ',
    'ਆਰਾਮ', 'ਸੁਖ', 'ਆਨੰਦ', 'ਖੇਡ', 'ਕੰਮ',
    'ਪੜ੍ਹਾਈ', 'ਸਿਖਲਾਈ', 'ਸਫਲਤਾ', 'ਅਸਫਲਤਾ', 'ਯਤਨ',
    'ਮਿਹਨਤ', 'ਸਾਧਨ', 'ਸਾਧਨਾ', 'ਪ੍ਰਯਾਸ', 'ਕੋਸ਼ਿਸ਼',
    'ਜਿੱਤ', 'ਹਾਰ', 'ਜੰਗ', 'ਸ਼ਾਂਤੀ', 'ਯੁੱਧ',
    'ਦੇਸ਼', 'ਰਾਸ਼ਟਰ', 'ਸਰਕਾਰ', 'ਕਾਨੂੰਨ', 'ਨਿਆਂ',
    'ਨਿਆਂਪਾਲਿਕਾ', 'ਪੁਲਿਸ', 'ਸਿਪਾਹੀ', 'ਫੌਜ', 'ਸੈਨਾ',
    'ਗੁਰੂ', 'ਸਿਖ', 'ਧਰਮ', 'ਪੂਜਾ', 'ਅਰਦਾਸ',
    'ਗੁਰਦੁਆਰਾ',
    'ਭਗਤੀ', 'ਸੇਵਾ', 'ਦਾਨ', 'ਪੁੰਨ',
    'ਕਰਮ', 'ਧਰਮ', 'ਕਰਤਾ', 'ਕਰਮਾ', 'ਫਲ',
    'ਪਾਪ', 'ਪੁੰਨ', 'ਸਵਰਗ', 'ਨਰਕ', 'ਮੋਕਸ਼',
    'ਜਨਮ', 'ਮੌਤ', 'ਜੀਵਨ', 'ਜੀਵ', 'ਪ੍ਰਾਣ',
    'ਸਾਹ', 'ਖੂਨ', 'ਦਿਲ', 'ਦਿਮਾਗ', 'ਅਕਲ',
    'ਬੁੱਧ', 'ਸਮਝ', 'ਗਿਆਨ', 'ਵਿਦਿਆ', 'ਸਿੱਖਿਆ',
    'ਪੜ੍ਹਾਈ', 'ਲਿਖਾਈ', 'ਪੜ੍ਹਨਾ', 'ਲਿਖਣਾ', 'ਸੁਣਨਾ',
    'ਦੇਖਣਾ', 'ਬੋਲਣਾ', 'ਕਹਿਣਾ', 'ਸੁਣਾਉਣਾ', 'ਦਿਖਾਉਣਾ',
    'ਸਮਝਾਉਣਾ', 'ਸਿਖਾਉਣਾ', 'ਪੜ੍ਹਾਉਣਾ', 'ਲਿਖਾਉਣਾ', 'ਕਰਾਉਣਾ',
    'ਕਰਨਾ', 'ਕਰਾਉਣਾ', 'ਹੋਣਾ', 'ਹੋਵਣਾ', 'ਰਹਿਣਾ',
    'ਰਹਾਉਣਾ', 'ਜਾਣਾ', 'ਜਾਉਣਾ', 'ਆਉਣਾ', 'ਆਵਣਾ',
    'ਖਾਣਾ', 'ਖਿਲਾਉਣਾ', 'ਪੀਣਾ', 'ਪਿਲਾਉਣਾ', 'ਸੌਣਾ',
    'ਸੁਆਉਣਾ', 'ਉਠਣਾ', 'ਉਠਾਉਣਾ', 'ਚੱਲਣਾ', 'ਚਲਾਉਣਾ',
    'ਦੌੜਣਾ', 'ਦੌੜਾਉਣਾ', 'ਖੇਡਣਾ', 'ਖਿਲਾਉਣਾ', 'ਹੱਸਣਾ',
    'ਹਸਾਉਣਾ', 'ਰੋਣਾ', 'ਰੁਲਾਉਣਾ', 'ਗਾਉਣਾ', 'ਗਵਾਉਣਾ',
    'ਨੱਚਣਾ', 'ਨਚਾਉਣਾ', 'ਗਾਣਾ', 'ਸੁਣਨਾ', 'ਸੁਣਾਉਣਾ',
    'ਦੇਖਣਾ', 'ਦਿਖਾਉਣਾ', 'ਸੋਚਣਾ', 'ਸਮਝਾਉਣਾ', 'ਜਾਣਨਾ',
    'ਜਤਾਉਣਾ', 'ਯਾਦ', 'ਭੁੱਲ', 'ਸਮਰਥਾ', 'ਯਾਦ',
    'ਯਾਦ', 'ਭੁੱਲ', 'ਸਮਰਥਾ', 'ਯਾਦ', 'ਭੁੱਲ'
].filter((word, index, self) => {
    // First, check if word has exactly 5 character units BEFORE normalization
    // This ensures we only keep words that are naturally 5 units
    const originalUnitCount = countCharacterUnits(word.replace(/\s/g, ''))
    if (originalUnitCount !== 5) {
        return false // Skip words that aren't exactly 5 units
    }
    // Remove duplicates
    return self.indexOf(word) === index
}).map(normalizeTo5Units).filter((word, index, self) => {
    // Final check after normalization - ensure it's still 5 units
    const unitCount = countCharacterUnits(word)
    return self.indexOf(word) === index && unitCount === 5
})

// Create a Set for fast lookup - only include words that are exactly 5 units
export const PUNJABI_WORD_SET = new Set(
    PUNJABI_VALID_WORDS.filter(word => countCharacterUnits(word) === 5)
)

// Export countCharacterUnits for use in API
export { countCharacterUnits }

