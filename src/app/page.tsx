'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { LeaderboardCard } from '@/components/LeaderboardCard'
import { TeamRow } from '@/components/TeamRow'
import { LiveFeed } from '@/components/LiveFeed'
import { CategoryTabs } from '@/components/CategoryTabs'

interface Team {
  id: string
  name: string
  avatar: string
  tasksCompleted: number
  milestones: boolean[]
  completionPercentage: number
  lastActive: Date | string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function Dashboard() {
  const [activeCategory, setActiveCategory] = useState('Web')

  const { data: teams = [], isLoading } = useSWR<Team[]>(
    `/api/leaderboard?category=${activeCategory}`,
    fetcher,
    {
      refreshInterval: 5000, // Refresh every 5 seconds for real-time updates
    }
  )

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Engineering Leaderboard
          </h1>
          <p className="text-zinc-400 text-sm">
            Real-time tracking of team progress via GitHub commits
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <LeaderboardCard className="min-h-[600px]">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-zinc-400" />
                <h2 className="text-xl font-semibold text-white">
                  {activeCategory} Rankings
                </h2>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-pulse glass-strong rounded-full p-6">
                    <TrendingUp className="w-8 h-8 text-zinc-400" />
                  </div>
                </div>
              ) : teams.length === 0 ? (
                <div className="text-center py-20">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
                  <p className="text-zinc-400 text-base">No teams yet</p>
                  <p className="text-zinc-600 text-sm mt-2">
                    Waiting for task completions to start tracking...
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {teams.map((team, index) => (
                    <TeamRow
                      key={team.id}
                      team={team}
                      rank={index + 1}
                      category={activeCategory}
                    />
                  ))}
                </AnimatePresence>
              )}
            </LeaderboardCard>
          </div>

          {/* Live Feed */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <LiveFeed />
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-zinc-600 text-xs"
        >
          <p>Updates every 5 seconds • Powered by GitHub Webhooks</p>
        </motion.div>
      </div>
    </div>
  )
}
