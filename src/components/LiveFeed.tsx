'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { Activity, CheckCircle2 } from 'lucide-react'
import useSWR from 'swr'
import { getCategoryColor } from '@/lib/utils'

interface ActivityItem {
    id: string
    category: string
    message: string
    points: number // Task number (1, 2, or 3)
    timestamp: string
    team: {
        name: string
    }
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function LiveFeed() {
    const { data: activities = [] } = useSWR<ActivityItem[]>('/api/activity', fetcher, {
        refreshInterval: 5000, // Refresh every 5 seconds
    })

    return (
        <div className="glass-strong rounded-xl p-6 h-[600px] flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-zinc-400" />
                <h2 className="text-lg font-semibold text-white">Live Activity</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                <AnimatePresence mode="popLayout">
                    {activities.map((activity, index) => {
                        const colors = getCategoryColor(activity.category)

                        return (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ delay: index * 0.03 }}
                                className="glass rounded-lg p-3 border-l-2 border-white/10 hover:border-white/20 transition-all"
                            >
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.text}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-white text-sm">
                                                {activity.team.name}
                                            </span>
                                            <span className={`text-xs ${colors.text}`}>
                                                {activity.category}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-400 mb-1">
                                            {activity.message}
                                        </p>
                                        <div className="text-xs text-zinc-600">
                                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>

                {activities.length === 0 && (
                    <div className="text-center text-zinc-500 py-12">
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No activity yet</p>
                        <p className="text-xs mt-1">Waiting for task completions...</p>
                    </div>
                )}
            </div>
        </div>
    )
}
