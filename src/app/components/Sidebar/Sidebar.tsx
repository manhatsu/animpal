'use client'

import { BookOpenIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

export type NavItemKey = 'diary'

interface SidebarProps {
  selectedNavItem: NavItemKey
  onSelectNavItem: (item: NavItemKey) => void
}

const navItems = [
  { key: 'diary', label: '日記', icon: BookOpenIcon },
]

export default function Sidebar({ selectedNavItem, onSelectNavItem }: SidebarProps) {
  return (
    <aside className="w-64 bg-neutral-900 border-r border-neutral-800 p-4 flex flex-col space-y-2">
      <div className="text-2xl font-semibold text-foreground mb-6">
        Anim<span className="text-sky-400">P</span>al
      </div>
      {navItems.map((item) => (
        <button
          key={item.key}
          onClick={() => onSelectNavItem(item.key as NavItemKey)}
          className={clsx(
            'flex items-center space-x-3 px-3 py-2.5 rounded-lg w-full text-left ',
            'transition-colors duration-150 ease-in-out',
            selectedNavItem === item.key
              ? 'bg-sky-500/20 text-sky-400'
              : 'text-neutral-400 hover:bg-neutral-700/50 hover:text-neutral-100'
          )}
        >
          <item.icon className="h-6 w-6" />
          <span className="text-sm font-medium">{item.label}</span>
        </button>
      ))}
    </aside>
  )
} 