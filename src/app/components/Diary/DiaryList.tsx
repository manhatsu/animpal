import React from 'react'
import { Diary } from '@/types/diary'
import { motion } from 'framer-motion'

type Props = {
  diaries: Diary[]
  onSelect: (diary: Diary) => void
  selectedDiary: Diary | null
}

const DiaryList: React.FC<Props> = ({ diaries, onSelect, selectedDiary }) => {
  return (
    <div className="p-4 h-full flex flex-col">
      <SectionLabel>日記一覧</SectionLabel>
      
      {/* ▼▼▼ テスト用のボックス ▼▼▼ */}
      {/* <div className="w-80 h-80 bg-red-500 my-4"> */}
      {/*   <p className="text-white p-2">これはテストボックスです。サイズが320px x 320pxになりますか？</p> */}
      {/* </div> */}
      {/* ▲▲▲ テスト用のボックス ▲▲▲ */}

      {diaries.length === 0 && (
        <div className="text-muted-foreground p-4 text-sm text-center flex-1 flex items-center justify-center">
          まだ日記がありません
        </div>
      )}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
        <div className="flex flex-wrap gap-4">
          {diaries.map((diary) => (
            <motion.div
              key={diary.id}
              whileHover={{ scale: 1.03, transition: { duration: 0.1 } }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(diary)}
              className={`
                w-52 h-52 p-3 rounded-xl cursor-pointer
                border-2 border-border bg-neutral-800 aspect-square
                transition-colors duration-150 flex flex-col justify-between
                ${ 
                  selectedDiary && selectedDiary.id === diary.id
                    ? 'bg-primary/10 ring-2 ring-primary border-primary'
                    : 'hover:bg-neutral-700 hover:border-accent'
                }
              `}
            >
              <div className="text-xs text-muted-foreground mb-1" suppressHydrationWarning>
                {new Date(diary.createdAt).toLocaleDateString('ja-JP')}
              </div>
              <p className="text-sm line-clamp-3 text-foreground/80 flex-1">
                {diary.text || '(本文なし)'}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-medium text-muted-foreground mb-2 shrink-0">
      {children}
    </h2>
  )
}

export default DiaryList 