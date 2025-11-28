'use client'

import { motion } from 'framer-motion'
import { getCategoryColor } from '@/lib/utils'

interface MilestoneIndicatorProps {
    milestones: boolean[] // [task1, task2, task3]
    category: string
    className?: string
}

export function MilestoneIndicator({ milestones, category, className = '' }: MilestoneIndicatorProps) {
    const colors = getCategoryColor(category)

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {milestones.map((completed, index) => (
                <div key={index} className="flex items-center">
                    {/* Dot */}
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: completed ? 1 : 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="relative group"
                    >
                        {completed ? (
                            // Completed: Filled circle with color
                            <div className={`w-3 h-3 rounded-full ${colors.dot} ring-2 ring-offset-2 ring-offset-zinc-950 ${colors.border.replace('border-', 'ring-')}`} />
                        ) : (
                            // Incomplete: Empty circle with border
                            <div className="w-3 h-3 rounded-full border-2 border-zinc-700 bg-zinc-900" />
                        )}

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-zinc-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Task {index + 1}
                        </div>
                    </motion.div>

                    {/* Connecting line (except after last dot) */}
                    {index < milestones.length - 1 && (
                        <div className={`w-8 h-0.5 ${completed && milestones[index + 1] ? colors.dot : 'bg-zinc-800'}`} />
                    )}
                </div>
            ))}
        </div>
    )
}
