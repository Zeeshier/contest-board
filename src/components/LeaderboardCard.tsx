'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface LeaderboardCardProps {
    children: ReactNode
    className?: string
}

export function LeaderboardCard({
    children,
    className,
}: LeaderboardCardProps) {
    return (
        <div
            className={cn(
                'glass rounded-xl p-6 transition-all duration-200',
                className
            )}
        >
            {children}
        </div>
    )
}
