import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { prisma } from '@/lib/db'
import { generateTeamAvatar } from '@/lib/avatar-generator'
import { detectTaskFromCommit, detectTaskFromFilePath } from '@/lib/utils'

/**
 * GitHub Webhook Handler
 * Listens for push events and detects task completions
 * 
 * Task Detection Methods:
 * 1. Commit messages with keywords: "Task 1 Done", "Completed Task 2", etc.
 * 2. File patterns: team{name}/{category}/task{number}_*.{ext}
 */

// Verify GitHub webhook signature
function verifySignature(payload: string, signature: string): boolean {
    if (!process.env.GITHUB_WEBHOOK_SECRET) {
        console.error('GITHUB_WEBHOOK_SECRET is not set')
        return false
    }

    const hmac = createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
    const digest = 'sha256=' + hmac.update(payload).digest('hex')

    return digest === signature
}

// Map branch ref to category name
function mapBranchToCategory(ref: string): string {
    const branch = ref.replace('refs/heads/', '')

    const categoryMap: Record<string, string> = {
        'web': 'Web',
        'android': 'Android',
        'core': 'Core',
    }

    return categoryMap[branch.toLowerCase()] || 'Global'
}

// Extract team name from file path
function extractTeamFromPath(filePath: string): string | null {
    // Match patterns like: team1/, team-alpha/, teamX/
    const match = filePath.match(/^(team[\w-]+)\//i)
    return match ? match[1] : null
}

export async function POST(request: NextRequest) {
    try {
        // Get raw body for signature verification
        const body = await request.text()
        const signature = request.headers.get('x-hub-signature-256')

        if (!signature) {
            return NextResponse.json(
                { error: 'Missing signature' },
                { status: 401 }
            )
        }

        // Verify signature
        if (!verifySignature(body, signature)) {
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            )
        }

        // Parse payload
        const payload = JSON.parse(body)

        // Only process push events
        if (!payload.ref || !payload.commits) {
            return NextResponse.json(
                { message: 'Not a push event' },
                { status: 200 }
            )
        }

        const category = mapBranchToCategory(payload.ref)

        // Skip Global category for task detection (only Web, Android, Core have tasks)
        if (category === 'Global') {
            return NextResponse.json(
                { message: 'Global category does not have tasks' },
                { status: 200 }
            )
        }

        const commits = payload.commits as Array<{
            id: string
            message: string
            added: string[]
            modified: string[]
            removed: string[]
        }>

        // Track task completions: Map<teamName, Set<taskNumber>>
        const taskCompletions = new Map<string, Set<number>>()

        // Process each commit
        for (const commit of commits) {
            // Method 1: Detect from commit message
            const taskFromMessage = detectTaskFromCommit(commit.message)

            const allFiles = [
                ...commit.added,
                ...commit.modified,
            ]

            // Extract teams from file paths
            const teamsInCommit = new Set<string>()
            for (const file of allFiles) {
                const team = extractTeamFromPath(file)
                if (team) {
                    teamsInCommit.add(team)
                }
            }

            // If task detected from message, apply to all teams in commit
            if (taskFromMessage && teamsInCommit.size > 0) {
                for (const teamName of teamsInCommit) {
                    if (!taskCompletions.has(teamName)) {
                        taskCompletions.set(teamName, new Set())
                    }
                    taskCompletions.get(teamName)!.add(taskFromMessage)
                }
            }

            // Method 2: Detect from file patterns
            for (const file of allFiles) {
                const detection = detectTaskFromFilePath(file)
                if (detection.team && detection.category === category && detection.taskNumber) {
                    if (!taskCompletions.has(detection.team)) {
                        taskCompletions.set(detection.team, new Set())
                    }
                    taskCompletions.get(detection.team)!.add(detection.taskNumber)
                }
            }
        }

        // Update database for each team
        const results = []

        for (const [teamName, taskNumbers] of taskCompletions.entries()) {
            // Find or create team
            let team = await prisma.team.findUnique({
                where: { name: teamName }
            })

            if (!team) {
                team = await prisma.team.create({
                    data: {
                        name: teamName,
                        avatar: generateTeamAvatar(teamName),
                    }
                })
            }

            // Process each task completion
            for (const taskNumber of taskNumbers) {
                // Check if task already completed (idempotency)
                const existing = await prisma.taskStatus.findUnique({
                    where: {
                        teamId_category_taskNumber: {
                            teamId: team.id,
                            category: category,
                            taskNumber: taskNumber,
                        }
                    }
                })

                if (!existing) {
                    // Create task completion record
                    await prisma.taskStatus.create({
                        data: {
                            teamId: team.id,
                            category: category,
                            taskNumber: taskNumber,
                            commitHash: commits[0]?.id,
                        }
                    })

                    // Update category tasks completed count
                    let categoryRecord = await prisma.category.findUnique({
                        where: {
                            teamId_name: {
                                teamId: team.id,
                                name: category,
                            }
                        }
                    })

                    if (!categoryRecord) {
                        categoryRecord = await prisma.category.create({
                            data: {
                                teamId: team.id,
                                name: category,
                                tasksCompleted: 1,
                                lastActive: new Date(),
                            }
                        })
                    } else {
                        await prisma.category.update({
                            where: { id: categoryRecord.id },
                            data: {
                                tasksCompleted: { increment: 1 },
                                lastActive: new Date(),
                            }
                        })
                    }

                    // Update Global category
                    let globalCategory = await prisma.category.findUnique({
                        where: {
                            teamId_name: {
                                teamId: team.id,
                                name: 'Global',
                            }
                        }
                    })

                    if (!globalCategory) {
                        globalCategory = await prisma.category.create({
                            data: {
                                teamId: team.id,
                                name: 'Global',
                                tasksCompleted: 1,
                                lastActive: new Date(),
                            }
                        })
                    } else {
                        await prisma.category.update({
                            where: { id: globalCategory.id },
                            data: {
                                tasksCompleted: { increment: 1 },
                                lastActive: new Date(),
                            }
                        })
                    }

                    // Create activity log
                    await prisma.activityLog.create({
                        data: {
                            teamId: team.id,
                            category: category,
                            message: `Completed Task ${taskNumber}`,
                            points: taskNumber, // Reuse points field to store task number
                        }
                    })

                    results.push({
                        team: teamName,
                        category: category,
                        task: taskNumber,
                        status: 'completed'
                    })
                } else {
                    results.push({
                        team: teamName,
                        category: category,
                        task: taskNumber,
                        status: 'already_completed'
                    })
                }
            }
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            results: results,
        })

    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
