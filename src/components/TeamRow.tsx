'use client'

import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { Trophy } from 'lucide-react'
import Image from 'next/image'
import { MilestoneIndicator } from './MilestoneIndicator'

interface TeamRowProps {
    team: {
        id: string
        name: string
        avatar: string
        tasksCompleted: number
        milestones: boolean[]
        completionPercentage: number
        lastActive: Date | string
    }
    rank: number
    category: string
}

export function TeamRow({ team, rank, category }: TeamRowProps) {
    const getRankColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-400'
        if (rank === 2) return 'text-zinc-300'
        if (rank === 3) return 'text-amber-600'
        return 'text-zinc-500'
    }

    const getRankIcon = (rank: number) => {
        if (rank <= 3) {
            return <Trophy className={`w-5 h-5 ${getRankColor(rank)}`} />
        }
        return null
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="glass rounded-lg p-4 mb-2 hover:border-white/20 transition-all duration-200"
        >
            <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex items-center justify-center w-10 h-10">
                    {getRankIcon(rank) || (
                        <span className={`text-xl font-semibold ${getRankColor(rank)}`}>
                            {rank}
                        </span>
                    )}
                </div>

                {/* Avatar */}
                <div className="relative w-10 h-10 rounded-full overflow-hidden ring-1 ring-white/10">
                    <Image
                        src={team.avatar}
                        alt={team.name}
                        fill
                        className="object-cover"
                    />
                </div>

                {/* Team Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white truncate">
                        {team.name}
                    </h3>
                    <div className="text-xs text-zinc-500">
                        {formatDistanceToNow(new Date(team.lastActive), { addSuffix: true })}
                    </div>
                </div>

                {/* Milestones */}
                <div className="hidden sm:flex items-center gap-4">
                    <MilestoneIndicator
                        milestones={team.milestones}
                        category={category}
                    />
                </div>

                {/* Progress */}
                <div className="text-right min-w-[80px]">
                    <div className="text-2xl font-bold text-white">
                        {team.completionPercentage}%
                    </div>
                    <div className="text-xs text-zinc-500">
                        {team.tasksCompleted}/3 tasks
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${team.completionPercentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500"
                />
            </div>
        </motion.div>
    )
}
