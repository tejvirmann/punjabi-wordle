// Punjabi Wordle Game
// Gurmukhi keyboard layout for Punjabi
const PUNJABI_KEYBOARD = [
    ['ੳ', 'ਅ', 'ੲ', 'ਸ', 'ਹ', 'ਕ', 'ਖ', 'ਗ', 'ਘ', 'ਙ'],
    ['ਚ', 'ਛ', 'ਜ', 'ਝ', 'ਞ', 'ਟ', 'ਠ', 'ਡ', 'ਢ', 'ਣ'],
    ['ਤ', 'ਥ', 'ਦ', 'ਧ', 'ਨ', 'ਪ', 'ਫ', 'ਬ', 'ਭ', 'ਮ'],
    ['ਯ', 'ਰ', 'ਲ', 'ਵ', 'ੜ', 'ਸ਼', 'ਖ਼', 'ਗ਼', 'ਜ਼', 'ਫ਼', 'ਲ਼']
];

// Punjabi words list - words that are 5+ characters (we'll normalize to 5)
const PUNJABI_WORDS = [
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
    'ਬਸਤਾ', 'ਕਿਤਾਬ', 'ਕਾਗਜ਼', 'ਸਿਆਹੀ', 'ਰਬੜ',
    'ਪੈਨਸਿਲ', 'ਸਕੂਲ', 'ਕਲਾਸ', 'ਅਧਿਆਪਕ', 'ਵਿਦਿਆਰਥੀ',
    'ਮਿੱਤਰ', 'ਦੋਸਤ', 'ਪਰਿਵਾਰ', 'ਮਾਤਾ', 'ਪਿਤਾ',
    'ਭਰਾ', 'ਭੈਣ', 'ਚਾਚਾ', 'ਤਾਇਆ', 'ਮਾਮਾ',
    'ਚਾਚੀ', 'ਤਾਈ', 'ਮਾਮੀ', 'ਦਾਦਾ', 'ਦਾਦੀ',
    'ਨਾਨਾ', 'ਨਾਨੀ', 'ਪੋਤਾ', 'ਪੋਤੀ', 'ਧੀ',
    'ਪੁੱਤਰ', 'ਬੇਟਾ', 'ਬੇਟੀ', 'ਪਤਨੀ', 'ਪਤੀ'
];

// Normalize words to exactly 5 characters
function normalizeWord(word) {
    // Remove spaces and take first 5 characters
    const cleaned = word.replace(/\s/g, '');
    if (cleaned.length >= 5) {
        return cleaned.substring(0, 5);
    }
    // If shorter, pad with spaces (though ideally we'd want real 5-char words)
    return cleaned.padEnd(5, ' ');
}

// Create normalized word list
const ALL_VALID_WORDS = PUNJABI_WORDS
    .filter(word => word.replace(/\s/g, '').length >= 5)
    .map(normalizeWord);

class PunjabiWordle {
    constructor() {
        this.wordLength = 5;
        this.maxGuesses = 6;
        this.currentGuess = '';
        this.guesses = [];
        this.currentRow = 0;
        this.gameOver = false;
        this.targetWord = this.getRandomWord();
        this.allGuessedLetters = new Set();
        
        this.init();
    }
    
    getRandomWord() {
        if (ALL_VALID_WORDS.length === 0) {
            // Fallback: create a simple 5-character word
            return 'ਸੱਚਾ';
        }
        return ALL_VALID_WORDS[Math.floor(Math.random() * ALL_VALID_WORDS.length)];
    }
    
    init() {
        this.createGameBoard();
        this.createKeyboard();
        this.setupEventListeners();
    }
    
    createGameBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        for (let i = 0; i < this.maxGuesses; i++) {
            for (let j = 0; j < this.wordLength; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.id = `tile-${i}-${j}`;
                gameBoard.appendChild(tile);
            }
        }
    }
    
    createKeyboard() {
        const keyboard = document.getElementById('keyboard');
        keyboard.innerHTML = '';
        
        // Create keyboard from Punjabi characters
        const allKeys = [];
        PUNJABI_KEYBOARD.forEach(row => {
            row.forEach(key => allKeys.push(key));
        });
        
        // Create rows of keys
        const keysPerRow = 10;
        for (let i = 0; i < allKeys.length; i += keysPerRow) {
            const row = document.createElement('div');
            row.className = 'keyboard-row';
            
            const rowKeys = allKeys.slice(i, i + keysPerRow);
            rowKeys.forEach(keyChar => {
                const key = document.createElement('button');
                key.className = 'key';
                key.textContent = keyChar;
                key.dataset.key = keyChar;
                key.addEventListener('click', () => this.handleKeyPress(keyChar));
                row.appendChild(key);
            });
            
            keyboard.appendChild(row);
        }
        
        // Add Enter and Backspace buttons
        const bottomRow = document.createElement('div');
        bottomRow.className = 'keyboard-row';
        
        const enterBtn = document.createElement('button');
        enterBtn.className = 'key wide';
        enterBtn.textContent = 'Enter';
        enterBtn.addEventListener('click', () => this.submitGuess());
        bottomRow.appendChild(enterBtn);
        
        const backspaceBtn = document.createElement('button');
        backspaceBtn.className = 'key wide';
        backspaceBtn.textContent = '⌫';
        backspaceBtn.addEventListener('click', () => this.handleBackspace());
        bottomRow.appendChild(backspaceBtn);
        
        keyboard.appendChild(bottomRow);
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            if (e.key === 'Enter') {
                this.submitGuess();
            } else if (e.key === 'Backspace') {
                this.handleBackspace();
            } else if (e.key.length === 1) {
                // Check if it's a Punjabi character
                const punjabiChars = PUNJABI_KEYBOARD.flat();
                if (punjabiChars.includes(e.key)) {
                    this.handleKeyPress(e.key);
                }
            }
        });
    }
    
    handleKeyPress(key) {
        if (this.gameOver || this.currentGuess.length >= this.wordLength) return;
        
        this.currentGuess += key;
        this.updateDisplay();
    }
    
    handleBackspace() {
        if (this.currentGuess.length > 0) {
            this.currentGuess = this.currentGuess.slice(0, -1);
            this.updateDisplay();
        }
    }
    
    updateDisplay() {
        for (let i = 0; i < this.wordLength; i++) {
            const tile = document.getElementById(`tile-${this.currentRow}-${i}`);
            if (i < this.currentGuess.length) {
                tile.textContent = this.currentGuess[i];
                tile.classList.add('filled');
            } else {
                tile.textContent = '';
                tile.classList.remove('filled');
            }
        }
    }
    
    submitGuess() {
        if (this.currentGuess.length !== this.wordLength) {
            this.showMessage('5 ਅੱਖਰ ਭਰੋ');
            this.shakeRow();
            return;
        }
        
        // Validate word (simplified - in real game, check against dictionary)
        const guess = this.currentGuess;
        this.guesses.push(guess);
        
        // Evaluate guess
        const evaluation = this.evaluateGuess(guess);
        this.animateGuess(evaluation);
        
        // Update keyboard colors
        this.updateKeyboard(evaluation);
        
        // Check win condition
        if (guess === this.targetWord) {
            this.gameOver = true;
            setTimeout(() => {
                this.showGameOver(true);
            }, 2000);
            return;
        }
        
        // Check lose condition
        if (this.currentRow >= this.maxGuesses - 1) {
            this.gameOver = true;
            setTimeout(() => {
                this.showGameOver(false);
            }, 2000);
            return;
        }
        
        this.currentRow++;
        this.currentGuess = '';
    }
    
    evaluateGuess(guess) {
        const evaluation = [];
        const targetArray = this.targetWord.split('');
        const guessArray = guess.split('');
        const used = new Array(this.wordLength).fill(false);
        
        // First pass: mark correct positions
        for (let i = 0; i < this.wordLength; i++) {
            if (guessArray[i] === targetArray[i]) {
                evaluation[i] = 'correct';
                used[i] = true;
            }
        }
        
        // Second pass: mark present letters
        for (let i = 0; i < this.wordLength; i++) {
            if (evaluation[i]) continue;
            
            for (let j = 0; j < this.wordLength; j++) {
                if (!used[j] && guessArray[i] === targetArray[j]) {
                    evaluation[i] = 'present';
                    used[j] = true;
                    break;
                }
            }
            
            if (!evaluation[i]) {
                evaluation[i] = 'absent';
            }
        }
        
        return evaluation;
    }
    
    animateGuess(evaluation) {
        const tiles = [];
        for (let i = 0; i < this.wordLength; i++) {
            tiles.push(document.getElementById(`tile-${this.currentRow}-${i}`));
        }
        
        tiles.forEach((tile, index) => {
            setTimeout(() => {
                tile.classList.add('flip');
                setTimeout(() => {
                    tile.classList.add(evaluation[index]);
                    tile.classList.remove('flip');
                }, 300);
            }, index * 100);
        });
    }
    
    updateKeyboard(evaluation) {
        const guess = this.guesses[this.guesses.length - 1];
        const guessArray = guess.split('');
        
        guessArray.forEach((char, index) => {
            const key = document.querySelector(`[data-key="${char}"]`);
            if (!key) return;
            
            const status = evaluation[index];
            const currentStatus = key.classList.contains('correct') ? 'correct' :
                                 key.classList.contains('present') ? 'present' :
                                 key.classList.contains('absent') ? 'absent' : null;
            
            // Only update if new status is better
            if (status === 'correct' || 
                (status === 'present' && currentStatus !== 'correct') ||
                (status === 'absent' && !currentStatus)) {
                key.classList.remove('correct', 'present', 'absent');
                key.classList.add(status);
            }
        });
    }
    
    shakeRow() {
        for (let i = 0; i < this.wordLength; i++) {
            const tile = document.getElementById(`tile-${this.currentRow}-${i}`);
            tile.classList.add('wrong');
            setTimeout(() => {
                tile.classList.remove('wrong');
            }, 500);
        }
    }
    
    showMessage(text) {
        const message = document.getElementById('message');
        message.textContent = text;
        setTimeout(() => {
            message.textContent = '';
        }, 2000);
    }
    
    showGameOver(won) {
        const modal = document.getElementById('game-over-modal');
        const title = document.getElementById('modal-title');
        const message = document.getElementById('modal-message');
        
        if (won) {
            title.textContent = 'ਤੁਸੀਂ ਜਿੱਤ ਗਏ!';
            message.textContent = `ਸ਼ਬਦ ਸੀ: ${this.targetWord}`;
        } else {
            title.textContent = 'ਤੁਸੀਂ ਹਾਰ ਗਏ';
            message.textContent = `ਸ਼ਬਦ ਸੀ: ${this.targetWord}`;
        }
        
        modal.classList.remove('hidden');
    }
    
    reset() {
        this.currentGuess = '';
        this.guesses = [];
        this.currentRow = 0;
        this.gameOver = false;
        this.targetWord = this.getRandomWord();
        this.allGuessedLetters.clear();
        
        this.createGameBoard();
        this.createKeyboard();
        
        const modal = document.getElementById('game-over-modal');
        modal.classList.add('hidden');
    }
}

// Initialize game
let game = new PunjabiWordle();

// Play again button
document.getElementById('play-again-btn').addEventListener('click', () => {
    game.reset();
});

