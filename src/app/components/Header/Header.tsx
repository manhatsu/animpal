import { PlusIcon } from '@heroicons/react/24/outline'

type HeaderProps = {
  onNew: () => void;
  avatarName: string | null;
}

export default function Header({ onNew, avatarName }: HeaderProps) {
  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          {avatarName ? (
            <>
              Your <span className="text-sky-400">P</span>al: {avatarName}
            </>
          ) : (
            <>
              Your <span className="text-sky-400">P</span>al: ?
            </>
          )}
        </h1>
      </div>
    </div>
  )
} 