# Contest Leaderboard Portal 🏆

A real-time contest leaderboard that automatically tracks programming teams' progress via GitHub Webhooks. Built with Next.js, TypeScript, Prisma, and featuring a stunning cyberpunk/hacker aesthetic.

## Features

- **Real-time Tracking**: Automatically updates leaderboard every 5 seconds
- **GitHub Integration**: Webhook-based commit tracking with signature verification
- **Scoring System**: +10 points per commit, +5 points per file changed
- **Category-based Rankings**: Track progress across Web, Android, Core, and Global categories
- **Live Activity Feed**: See commits as they happen
- **Cyberpunk UI**: Dark mode with neon gradients, glassmorphism, and smooth animations
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: PostgreSQL + Prisma ORM
- **Real-time**: SWR for data fetching
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Supabase, Neon, or local)
- GitHub repository for the contest

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd contest-board
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database"
   GITHUB_WEBHOOK_SECRET="your-secure-secret-here"
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   ```

   Generate a secure webhook secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the leaderboard.

## GitHub Webhook Setup

### Repository Structure

Your contest repository should follow this structure:

```
contest-repo/
├── web/              # Branch for web category
│   ├── team1/        # Team 1's web code
│   ├── team2/        # Team 2's web code
│   └── ...
├── android/          # Branch for android category
│   ├── team1/        # Team 1's android code
│   └── ...
└── core/             # Branch for core category
    └── ...
```

### Configure Webhook

1. Go to your GitHub repository settings
2. Navigate to **Settings** → **Webhooks** → **Add webhook**
3. Configure:
   - **Payload URL**: `https://your-domain.com/api/github-webhook`
   - **Content type**: `application/json`
   - **Secret**: Use the same secret from your `.env` file
   - **Events**: Select "Just the push event"
4. Click **Add webhook**

### Test the Webhook

Send a test payload:
```bash
curl -X POST http://localhost:3000/api/github-webhook \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=$(echo -n '{"ref":"refs/heads/web","commits":[]}' | openssl dgst -sha256 -hmac 'your-secret' | cut -d' ' -f2)" \
  -d '{"ref":"refs/heads/web","commits":[]}'
```

## How It Works

### Scoring Algorithm

- **+10 points** for each commit
- **+5 points** for each file changed

### Category Mapping

- `refs/heads/web` → **Web** category
- `refs/heads/android` → **Android** category
- `refs/heads/core` → **Core** category
- All commits also count toward **Global** rankings

### Team Detection

Teams are identified by folder structure. Any folder matching the pattern `team*` (e.g., `team1/`, `team-alpha/`, `teamX/`) is recognized as a team.

## Database Schema

### Team
- `id`: Unique identifier
- `name`: Team name (extracted from folder)
- `avatar`: Auto-generated SVG avatar
- `createdAt`: Timestamp

### Category
- `id`: Unique identifier
- `name`: Category name (Web/Android/Core/Global)
- `teamId`: Reference to team
- `commitCount`: Number of commits
- `totalScore`: Calculated score
- `lastActive`: Last commit timestamp

### ActivityLog
- `id`: Unique identifier
- `teamId`: Reference to team
- `category`: Category name
- `message`: Commit message
- `points`: Points awarded
- `timestamp`: Activity timestamp

## API Endpoints

### GET `/api/leaderboard?category={category}`
Fetch leaderboard for a specific category.

**Query Parameters:**
- `category`: `Global` | `Web` | `Android` | `Core` (default: `Global`)

**Response:**
```json
[
  {
    "id": "team-id",
    "name": "team1",
    "avatar": "data:image/svg+xml;base64,...",
    "commitCount": 15,
    "totalScore": 225,
    "lastActive": "2024-01-01T12:00:00Z"
  }
]
```

### GET `/api/activity`
Fetch recent activity logs (last 50 entries).

**Response:**
```json
[
  {
    "id": "activity-id",
    "category": "Web",
    "message": "Fixed navigation bug",
    "points": 15,
    "timestamp": "2024-01-01T12:00:00Z",
    "team": {
      "name": "team1"
    }
  }
]
```

### POST `/api/github-webhook`
GitHub webhook endpoint (secured with signature verification).

## Customization

### Modify Scoring Algorithm

Edit `src/app/api/github-webhook/route.ts`:

```typescript
// Current: +10 per commit, +5 per file
current.points += 10 + (current.fileCount * 5)

// Example: +20 per commit, +3 per file
current.points += 20 + (current.fileCount * 3)
```

### Add More Categories

1. Create new branches in your contest repository
2. Update category mapping in `src/app/api/github-webhook/route.ts`:
   ```typescript
   const categoryMap: Record<string, string> = {
     'web': 'Web',
     'android': 'Android',
     'core': 'Core',
     'backend': 'Backend', // Add new category
   }
   ```
3. Add category to tabs in `src/components/CategoryTabs.tsx`

### Change Theme Colors

Edit `src/app/globals.css`:

```css
:root {
  --neon-purple: #a855f7;  /* Change to your color */
  --neon-blue: #3b82f6;
  --neon-green: #10b981;
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Other Platforms

Works on any platform that supports Next.js:
- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify

## Troubleshooting

### Webhook not working

1. Check webhook secret matches in both GitHub and `.env`
2. Verify webhook URL is publicly accessible
3. Check webhook delivery logs in GitHub settings
4. Review server logs for errors

### Database connection issues

1. Verify `DATABASE_URL` is correct
2. Ensure database is accessible from your deployment
3. Run `npx prisma db push` to sync schema

### Real-time updates not showing

1. Check browser console for errors
2. Verify API endpoints are accessible
3. Ensure SWR is configured correctly (5-second refresh interval)

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

Built with ❤️ using Next.js and Prisma
