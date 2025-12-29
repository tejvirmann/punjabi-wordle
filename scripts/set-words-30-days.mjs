// Script to set words for the next 30 days
// Run with: node scripts/set-words-30-days.mjs
// Make sure your server is running on localhost:3000

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '..', '.env.local');
let ADMIN_PASSWORD = 'password';
let BASE_URL = 'http://localhost:3000';

try {
    const envContent = readFileSync(envPath, 'utf-8');
    const passwordMatch = envContent.match(/ADMIN_PASSWORD=(.+)/);
    if (passwordMatch) {
        ADMIN_PASSWORD = passwordMatch[1].trim();
    }
} catch (error) {
    console.log('Using default password');
}

// Get valid words from the word list
// We'll use the deterministic word selection from the API
async function getWordForDate(dateKey) {
    try {
        const response = await fetch(`${BASE_URL}/api/word-of-day?date=${dateKey}`);
        const data = await response.json();
        return data.word;
    } catch (error) {
        console.error(`Error getting word for ${dateKey}:`, error.message);
        return null;
    }
}

async function setWordForDate(dateKey, word) {
    try {
        const response = await fetch(`${BASE_URL}/api/admin/set-word`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ADMIN_PASSWORD}`
            },
            body: JSON.stringify({
                date: dateKey,
                word: word
            })
        });

        const data = await response.json();
        return { success: response.ok, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function setWordsForNext30Days() {
    const today = new Date();
    const results = [];
    
    console.log('🚀 Setting words for the next 30 days...\n');
    
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        
        // Get the deterministic word for this date
        const word = await getWordForDate(dateKey);
        
        if (!word) {
            console.error(`❌ ${dateKey}: Failed to get word`);
            results.push({ date: dateKey, success: false, error: 'Failed to get word' });
            continue;
        }
        
        // Set the word for this date
        const result = await setWordForDate(dateKey, word);
        
        if (result.success) {
            console.log(`✅ ${dateKey}: ${word}`);
            results.push({ date: dateKey, word, success: true });
        } else {
            console.error(`❌ ${dateKey}: ${result.error || result.data?.error || 'Failed'}`);
            results.push({ date: dateKey, word, success: false, error: result.error || result.data?.error });
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 Summary:');
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (failed > 0) {
        console.log('\n❌ Failed dates:');
        results.filter(r => !r.success).forEach(r => {
            console.log(`   ${r.date}: ${r.error || 'Unknown error'}`);
        });
    }
    
    return results;
}

// Run the script
console.log(`Using password: ${ADMIN_PASSWORD ? '***' : 'none'}`);
console.log(`Base URL: ${BASE_URL}\n`);

setWordsForNext30Days()
    .then(() => {
        console.log('\n✨ Done!');
        process.exit(0);
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });

