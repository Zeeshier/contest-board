'use client'

import { motion } from 'framer-motion'
import { Globe, Smartphone, Code, Layers } from 'lucide-react'

interface CategoryTabsProps {
    activeCategory: string
    onCategoryChange: (category: string) => void
}

const categories = [
    { name: 'Web', icon: Code },
    { name: 'Android', icon: Smartphone },
    { name: 'Core', icon: Layers },
]

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
    return (
        <div className="glass rounded-xl p-1.5 inline-flex gap-1">
            {categories.map((category) => {
                const isActive = activeCategory === category.name
                const Icon = category.icon

                return (
                    <button
                        key={category.name}
                        onClick={() => onCategoryChange(category.name)}
                        className={`
              relative px-5 py-2.5 rounded-lg font-medium transition-all duration-200
              flex items-center gap-2 text-sm
              ${isActive
                                ? 'text-white bg-white/5'
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                            }
            `}
                    >
                        <Icon className="w-4 h-4" />
                        <span>{category.name}</span>

                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-white/5 rounded-lg border border-white/10"
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        )}
                    </button>
                )
            })}
        </div>
    )
}
