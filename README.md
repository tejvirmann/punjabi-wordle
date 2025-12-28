# ਪੰਜਾਬੀ ਵਰਡਲ (Punjabi Wordle)

A Punjabi language version of the popular Wordle game, featuring the same visual design and gameplay mechanics. Built with Next.js and deployed on Vercel with serverless functions.

## Features

- Exact same UI as the original Wordle game
- Punjabi (Gurmukhi) script support
- On-screen Punjabi keyboard
- 6 guesses to find the 5-character Punjabi word
- Color-coded feedback:
  - 🟩 Green: Correct letter in correct position
  - 🟨 Yellow: Correct letter in wrong position
  - ⬜ Gray: Letter not in the word
- **Word of the Day** - Same word for everyone each day
- **Admin Panel** - Set words for specific dates at `/admin`

## Getting Started

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (optional):
```bash
# Create .env.local file in the project root
# ADMIN_PASSWORD is optional - if not set, admin panel has no password protection
ADMIN_PASSWORD=your-secure-password

# Optional: For persistent storage, add Vercel KV credentials
KV_REST_API_URL=your-kv-url
KV_REST_API_TOKEN=your-kv-token
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

5. Access admin panel at [http://localhost:3000/admin](http://localhost:3000/admin)

### Production Build

```bash
npm run build
npm start
```

## Deployment to Vercel

1. Push your code to GitHub

2. Connect your repository to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js

3. Set environment variables in Vercel dashboard:
   - `ADMIN_PASSWORD` (optional) - Password for admin panel access. If not set, admin panel is open without authentication
   - `KV_REST_API_URL` (optional) - Vercel KV URL for persistent storage
   - `KV_REST_API_TOKEN` (optional) - Vercel KV token

4. Deploy! Vercel will automatically build and deploy your app.

### Setting up Vercel KV (Optional but Recommended)

For persistent word storage across deployments:

1. In Vercel dashboard, go to your project
2. Navigate to Storage → Create Database → KV
3. Copy the `KV_REST_API_URL` and `KV_REST_API_TOKEN`
4. Add them as environment variables

If KV is not configured, the app will use fallback words (random selection).

## Admin Panel

Access the admin panel at `/admin` to:
- Set words for specific dates
- View all saved words
- Manage the word of the day

### Password Protection (Optional)

The admin panel is **password-protected only if `ADMIN_PASSWORD` is set**. If no password is configured:
- Admin panel is accessible without authentication
- No login required
- All admin functions work directly

**To enable password protection:**
1. Set `ADMIN_PASSWORD` environment variable:
   ```bash
   # In .env.local for local development
   ADMIN_PASSWORD=your-secure-password-here
   
   # Or in Vercel dashboard → Environment Variables
   ADMIN_PASSWORD=your-secure-password-here
   ```
2. Restart your development server or redeploy on Vercel
3. Access `/admin` and enter the password to login

**Note**: For production, it's recommended to set a strong password to protect the admin panel.

## Project Structure

```
punjabi-wordle/
├── app/
│   ├── api/
│   │   ├── word-of-day/      # API to get today's word
│   │   └── admin/            # Admin APIs (set-word, get-words)
│   ├── admin/                # Admin panel page
│   ├── components/           # React components
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx             # Main game page
├── package.json
├── next.config.js
└── vercel.json
```

## How to Play

1. Visit the game URL
2. Use the on-screen keyboard or type Punjabi characters
3. Guess 5-character Punjabi words
4. You have 6 attempts to find the word
5. The word is the same for everyone on the same day!

## Word Validation

The game validates that entered words are real Punjabi words before accepting guesses. This validation **does NOT use an external API** - it uses a local word list for fast, reliable validation.

### How It Works

1. **Word List**: `app/data/punjabiWords.ts`
   - Contains ~200+ Punjabi words
   - All words normalized to exactly 5 Unicode characters
   - Stored in a JavaScript Set for fast O(1) lookup

2. **Validation API**: `/api/validate-word` (serverless function)
   - Normalizes input word to 5 characters
   - Checks if word exists in the word list
   - Returns validation result instantly

3. **Why Local Validation?**
   - **Performance**: Instant validation (no network latency)
   - **Cost**: No API costs or rate limits
   - **Reliability**: Works offline, no external dependencies
   - **Privacy**: Word guesses stay on your server
   - **Control**: Easy to customize the word list

### Adding More Words

To add more words, edit `app/data/punjabiWords.ts`:
1. Add words to the `PUNJABI_VALID_WORDS` array
2. Words are automatically normalized to 5 characters
3. Duplicates are automatically removed
4. Restart server to apply changes

### Unicode & Matras Support

The validation properly handles Unicode characters including matras:
- Uses `Array.from()` to count Unicode code points correctly
- Matras like ਸਿੱਖ (Sikh) are handled properly
- Normalization ensures consistent comparison

## Admin Panel Troubleshooting

### Setting Up Vercel KV (Required for Persistent Storage)

The admin panel **requires Vercel KV** for persistent word storage. Without KV:
- Words will not be saved permanently
- You'll see a warning message
- Words will only work during the current session

**To set up Vercel KV:**

1. **In Vercel Dashboard:**
   - Go to your project
   - Navigate to **Storage** → **Create Database** → **KV**
   - Create a new KV database

2. **Get Credentials:**
   - Copy `KV_REST_API_URL`
   - Copy `KV_REST_API_TOKEN`

3. **Set Environment Variables:**
   - In Vercel project settings → Environment Variables
   - Add `KV_REST_API_URL`
   - Add `KV_REST_API_TOKEN`
   - Redeploy your application

### Common Issues

**"Unauthorized" Error**
- **Cause**: Wrong password (if password is set) or missing `ADMIN_PASSWORD` env variable
- **Fix**: Check environment variable is set correctly, or leave it unset to disable password protection

**"KV not configured" Warning**
- **Cause**: Vercel KV not set up
- **Fix**: Set up KV database and add credentials (see above)

**Words Not Saving**
- **Cause**: KV not configured or network error
- **Fix**: Check KV credentials, check browser console for errors

**Words Not Loading**
- **Cause**: Authentication issue (if password set) or KV connection problem
- **Fix**: Re-login (if password required), check KV is accessible

### API Endpoints

**GET `/api/admin/get-words`**
- **Auth**: Bearer token (only if `ADMIN_PASSWORD` is set)
- **Returns**: `{ words: { "2024-01-15": "ਸੱਚਾ", ... } }`

**POST `/api/admin/set-word`**
- **Auth**: Bearer token (only if `ADMIN_PASSWORD` is set)
- **Body**: `{ word: "ਸੱਚਾ", date: "2024-01-15" }` (date optional, defaults to today)
- **Returns**: `{ success: true, word: "ਸੱਚਾ", date: "2024-01-15" }`

## Browser Support

Works in all modern browsers that support Unicode and Gurmukhi script rendering.
