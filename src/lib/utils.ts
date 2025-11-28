import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Detect task number from commit message
 * Looks for patterns like "Task 1 Done", "Completed Task 2", "Task 3 Complete"
 */
export function detectTaskFromCommit(message: string): number | null {
    const patterns = [
        /task\s*(\d+)\s*(done|complete|completed|finished)/i,
        /(done|complete|completed|finished)\s*task\s*(\d+)/i,
        /task\s*(\d+)/i,
    ]

    for (const pattern of patterns) {
        const match = message.match(pattern)
        if (match) {
            const taskNum = parseInt(match[1] || match[2])
            if (taskNum >= 1 && taskNum <= 3) {
                return taskNum
            }
        }
    }

    return null
}

/**
 * Calculate completion percentage based on tasks completed (0-3)
 */
export function calculateCompletionPercentage(tasksCompleted: number): number {
    if (tasksCompleted <= 0) return 0
    if (tasksCompleted >= 3) return 100
    return Math.round((tasksCompleted / 3) * 100)
}

/**
 * Get subtle color for category (Premium SaaS style)
 */
export function getCategoryColor(category: string): {
    text: string
    bg: string
    border: string
    dot: string
} {
    const colors: Record<string, { text: string; bg: string; border: string; dot: string }> = {
        Web: {
            text: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            dot: 'bg-blue-500',
        },
        Android: {
            text: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            dot: 'bg-emerald-500',
        },
        Core: {
            text: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
            dot: 'bg-purple-500',
        },
        Global: {
            text: 'text-zinc-400',
            bg: 'bg-zinc-500/10',
            border: 'border-zinc-500/20',
            dot: 'bg-zinc-500',
        },
    }

    return colors[category] || colors.Global
}

/**
 * Check if a file path matches task completion pattern
 * Pattern: team{name}/{category}/task{number}_*.{ext}
 * Example: team1/web/task1_solution.js, team-alpha/android/task2.kt
 */
export function detectTaskFromFilePath(filePath: string): {
    team: string | null
    category: string | null
    taskNumber: number | null
} {
    // Pattern: team{name}/{category}/task{number}
    const match = filePath.match(/^(team[\w-]+)\/(web|android|core)\/task(\d+)/i)

    if (match) {
        const taskNum = parseInt(match[3])
        if (taskNum >= 1 && taskNum <= 3) {
            return {
                team: match[1],
                category: match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase(),
                taskNumber: taskNum,
            }
        }
    }

    return { team: null, category: null, taskNumber: null }
}

/**
 * Format milestone array for display
 * Returns [true, true, false] for 2 tasks completed
 */
export function getMilestoneArray(tasksCompleted: number): boolean[] {
    return [
        tasksCompleted >= 1,
        tasksCompleted >= 2,
        tasksCompleted >= 3,
    ]
}
