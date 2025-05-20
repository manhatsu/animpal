'use client'

import { BookOpenIcon, Cog6ToothIcon, TrashIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

export type NavItemKey = 'diary' | 'avatar_settings'

type SidebarProps = {
  selectedNavItem: NavItemKey
  onSelectNavItem: (key: NavItemKey) => void
  onClearCache: () => Promise<void>
  onDeleteAllData: () => Promise<void>
}

const navItems = [
  { key: 'diary', label: '日記', icon: BookOpenIcon },
  { key: 'avatar_settings', label: 'アバター設定', icon: Cog6ToothIcon },
]

export default function Sidebar({ selectedNavItem, onSelectNavItem, onClearCache, onDeleteAllData }: SidebarProps) {
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
      
      <div className="flex-1" />
      
      <div className="space-y-2 pt-4 border-t border-neutral-800">
        <button
          onClick={onClearCache}
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg w-full text-left text-neutral-400 hover:bg-neutral-700/50 hover:text-neutral-100 transition-colors duration-150 ease-in-out"
        >
          <Cog6ToothIcon className="h-6 w-6" />
          <span className="text-sm font-medium">キャッシュをクリア</span>
        </button>
        
        <button
          onClick={onDeleteAllData}
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg w-full text-left text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors duration-150 ease-in-out"
        >
          <TrashIcon className="h-6 w-6" />
          <span className="text-sm font-medium">すべてのデータを削除</span>
        </button>
      </div>
    </aside>
  )
} 