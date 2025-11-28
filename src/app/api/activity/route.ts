import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        // Fetch recent activity logs with team information
        const activities = await prisma.activityLog.findMany({
            take: 50,
            orderBy: {
                timestamp: 'desc',
            },
            include: {
                team: true,
            },
        })

        // Transform data - points field now contains task number
        const formattedActivities = activities.map((activity) => ({
            id: activity.id,
            category: activity.category,
            message: activity.message, // Already formatted as "Completed Task X"
            points: activity.points, // Task number (1, 2, or 3)
            timestamp: activity.timestamp,
            team: {
                name: activity.team.name,
            },
        }))

        return NextResponse.json(formattedActivities)
    } catch (error) {
        console.error('Activity API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch activity' },
            { status: 500 }
        )
    }
}
