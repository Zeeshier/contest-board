# Engineering Leaderboard 🏆

A real-time contest leaderboard that automatically tracks programming teams' progress via GitHub Webhooks. Built with Next.js, TypeScript, Prisma, and featuring a premium SaaS design inspired by Vercel, Linear, and Stripe.

## Features

- **3-Task Milestone System**: Track completion of 3 tasks per category (Web, Android, Core)
- **Real-time Tracking**: Automatically updates leaderboard every 5 seconds
- **GitHub Integration**: Webhook-based task detection with signature verification
- **Smart Task Detection**: Detects task completions from commit messages or file patterns
- **Live Activity Feed**: See task completions as they happen
- **Premium SaaS UI**: Clean zinc/slate design with glassmorphism and smooth animations
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 16 (App Router) with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
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
│   │   ├── task1_solution.js
│   │   ├── task2_solution.js
│   │   └── task3_solution.js
│   ├── team2/        # Team 2's web code
│   └── ...
├── android/          # Branch for android category
│   ├── team1/        # Team 1's android code
│   │   ├── task1_solution.kt
│   │   └── ...
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

Use the included test script:
```bash
node test-webhook.js
```

## How It Works

### Task Detection System

The system detects task completions using two methods:

#### 1. Commit Message Keywords
Include keywords in your commit messages:
- "Task 1 Done"
- "Completed Task 2"
- "Task 3 Complete"
- "Finished task 1"

Example:
```bash
git commit -m "Task 1 Done - Implemented login page"
```

#### 2. File Pattern Matching
Create files following this pattern:
```
team{name}/{category}/task{number}_*.{ext}
```

Examples:
- `team1/web/task1_solution.js`
- `team-alpha/android/task2_implementation.kt`
- `team2/core/task3_final.py`

### Category Mapping

- `refs/heads/web` → **Web** category
- `refs/heads/android` → **Android** category
- `refs/heads/core` → **Core** category

Each category has **3 tasks** that teams must complete.

### Team Detection

Teams are identified by folder structure. Any folder matching the pattern `team*` (e.g., `team1/`, `team-alpha/`, `teamX/`) is recognized as a team.

### Ranking System

Teams are ranked by:
1. **Tasks Completed** (descending) - More tasks = higher rank
2. **Last Active Time** (ascending) - Earlier completion wins ties

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
- `tasksCompleted`: Number of tasks completed (0-3)
- `lastActive`: Last task completion timestamp

### TaskStatus
- `id`: Unique identifier
- `teamId`: Reference to team
- `category`: Category name (Web/Android/Core)
- `taskNumber`: Task number (1, 2, or 3)
- `completedAt`: Completion timestamp
- `commitHash`: Git commit hash (optional)

### ActivityLog
- `id`: Unique identifier
- `teamId`: Reference to team
- `category`: Category name
- `message`: Activity message ("Completed Task X")
- `points`: Task number (reused field)
- `timestamp`: Activity timestamp

## API Endpoints

### GET `/api/leaderboard?category={category}`
Fetch leaderboard for a specific category.

**Query Parameters:**
- `category`: `Web` | `Android` | `Core` (default: `Web`)

**Response:**
```json
[
  {
    "id": "team-id",
    "name": "team1",
    "avatar": "data:image/svg+xml;base64,...",
    "tasksCompleted": 2,
    "milestones": [true, true, false],
    "completionPercentage": 66,
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
    "message": "Completed Task 1",
    "points": 1,
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
3. Add category to tabs in `src/components/CategoryTabs.tsx`:
   ```typescript
   const categories = [
     { name: 'Web', icon: Code },
     { name: 'Android', icon: Smartphone },
     { name: 'Core', icon: Layers },
     { name: 'Backend', icon: Server }, // Add new category
   ]
   ```

### Change Theme Colors

Edit `src/app/globals.css`:

```css
:root {
  --background: #09090b;        /* Zinc-950 */
  --foreground: #fafafa;         /* Zinc-50 */
  --accent-blue: #3b82f6;        /* Change to your color */
  --accent-emerald: #10b981;
  --accent-purple: #8b5cf6;
}
```

### Modify Task Detection

Edit task detection patterns in `src/lib/utils.ts`:

```typescript
// Customize commit message patterns
const patterns = [
  /task\s*(\d+)\s*(done|complete|completed|finished)/i,
  /your-custom-pattern/i,
]

// Customize file path pattern
const match = filePath.match(/^(team[\w-]+)\/(web|android|core)\/task(\d+)/i)
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `DATABASE_URL`
   - `GITHUB_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_API_URL`
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
5. Test locally with `node test-webhook.js`

### Task not being detected

1. Verify commit message includes keywords like "Task 1 Done"
2. Check file path matches pattern: `team{name}/{category}/task{number}_*`
3. Ensure branch name matches category (web/android/core)
4. Review webhook payload in GitHub delivery logs

### Database connection issues

1. Verify `DATABASE_URL` is correct
2. Ensure database is accessible from your deployment
3. Run `npx prisma db push` to sync schema
4. Check Prisma logs for connection errors

### Real-time updates not showing

1. Check browser console for errors
2. Verify API endpoints are accessible
3. Ensure SWR is configured correctly (5-second refresh interval)
4. Check network tab for failed requests

## Components

### UI Components

- **CategoryTabs**: Pill-shaped segmented control for category selection
- **LeaderboardCard**: Clean glass card container
- **TeamRow**: Team ranking with milestone indicators and progress bar
- **MilestoneIndicator**: 3-dot visualization of task completion (○━━●━━○)
- **LiveFeed**: Real-time activity timeline

### Utility Functions

- `detectTaskFromCommit()`: Parse task number from commit messages
- `detectTaskFromFilePath()`: Extract team, category, and task from file paths
- `calculateCompletionPercentage()`: Convert tasks (0-3) to percentage
- `getCategoryColor()`: Return category-specific colors
- `getMilestoneArray()`: Generate boolean array for milestone visualization

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

Built with ❤️ using Next.js, Prisma, and Tailwind CSS
