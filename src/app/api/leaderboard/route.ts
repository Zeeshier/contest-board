import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getMilestoneArray, calculateCompletionPercentage } from '@/lib/utils'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category') || 'Global'

        // Fetch teams with their category data
        const categories = await prisma.category.findMany({
            where: {
                name: category,
            },
            include: {
                team: true,
            },
            orderBy: [
                { tasksCompleted: 'desc' },  // Most tasks first
                { lastActive: 'asc' },        // Earliest completion wins ties
            ],
        })

        // Transform data for frontend
        const leaderboard = categories.map((cat) => ({
            id: cat.team.id,
            name: cat.team.name,
            avatar: cat.team.avatar,
            tasksCompleted: cat.tasksCompleted,
            milestones: getMilestoneArray(cat.tasksCompleted),
            completionPercentage: calculateCompletionPercentage(cat.tasksCompleted),
            lastActive: cat.lastActive,
        }))

        return NextResponse.json(leaderboard)
    } catch (error) {
        console.error('Leaderboard API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard' },
            { status: 500 }
        )
    }
}
