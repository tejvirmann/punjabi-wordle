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

2. Set up environment variables (optional for local dev):
```bash
# Create .env.local file
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
   - `ADMIN_PASSWORD` - Password for admin panel access
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

**Default password**: `changeme` (change this in production via `ADMIN_PASSWORD` env variable)

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

## Browser Support

Works in all modern browsers that support Unicode and Gurmukhi script rendering.
