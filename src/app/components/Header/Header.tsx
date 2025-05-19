import { PlusIcon } from '@heroicons/react/24/outline'

interface HeaderProps {
  onNew: () => void
}

export default function Header({ onNew }: HeaderProps) {
  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          Anim<span className="text-sky-400">P</span>al
        </h1>
        <button
          onClick={onNew}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 px-4 py-2 bg-primary text-primary-foreground shadow hover:bg-primary/90"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          新規作成
        </button>
      </div>
    </div>
  )
} 