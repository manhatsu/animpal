import React from 'react'
import { Diary } from '@/types/diary'
import { motion } from 'framer-motion'
import { PlusIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

type Props = {
  diaries: Diary[]
  onSelect: (diary: Diary) => void
  selectedDiary: Diary | null
  onAddNewDiary: () => void
  onDeleteDiary: (diaryId: string) => Promise<void>
  onRegenerateImage: (diary: Diary) => Promise<void>
}

const DiaryList: React.FC<Props> = ({ diaries, onSelect, selectedDiary, onAddNewDiary, onDeleteDiary, onRegenerateImage }) => {
  const handleDelete = async (e: React.MouseEvent, diaryId: string) => {
    e.stopPropagation(); // クリックイベントの伝播を停止
    await onDeleteDiary(diaryId);
  };

  const handleRegenerate = async (e: React.MouseEvent, diary: Diary) => {
    e.stopPropagation(); // クリックイベントの伝播を停止
    await onRegenerateImage(diary);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <SectionLabel>日記一覧</SectionLabel>
      
      {/* ▼▼▼ テスト用のボックス ▼▼▼ */}
      {/* <div className="w-80 h-80 bg-red-500 my-4"> */}
      {/*   <p className="text-white p-2">これはテストボックスです。サイズが320px x 320pxになりますか？</p> */}
      {/* </div> */}
      {/* ▲▲▲ テスト用のボックス ▲▲▲ */}

      {diaries.length === 0 && !onAddNewDiary && (
        <div className="text-muted-foreground p-4 text-sm text-center flex-1 flex items-center justify-center">
          まだ日記がありません
        </div>
      )}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
        <div className="flex flex-wrap gap-4">
          <motion.div
            whileHover={{ scale: 1.03, transition: { duration: 0.1 } }}
            whileTap={{ scale: 0.97 }}
            onClick={onAddNewDiary}
            className={`
              w-52 h-52 p-3 rounded-xl cursor-pointer
              border-2 border-border bg-neutral-800 aspect-square
              transition-colors duration-150 flex flex-col justify-center items-center
              hover:bg-neutral-700 hover:border-accent
            `}
          >
            <PlusIcon className="h-12 w-12 text-neutral-500 mb-2" />
            <p className="text-sm text-neutral-400">新規作成</p>
          </motion.div>

          {diaries.map((diary) => (
            <motion.div
              key={diary.id}
              whileHover={{ scale: 1.03, transition: { duration: 0.1 } }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(diary)}
              className={`
                w-52 h-52 rounded-xl cursor-pointer
                border-2 border-border bg-neutral-800 aspect-square
                transition-colors duration-150 overflow-hidden relative
                ${ 
                  selectedDiary && selectedDiary.id === diary.id
                    ? 'bg-primary/10 ring-2 ring-primary border-primary'
                    : 'hover:bg-neutral-700 hover:border-accent'
                }
              `}
            >
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <button
                  onClick={(e) => handleRegenerate(e, diary)}
                  className="p-1 rounded-full bg-neutral-900/80 hover:bg-blue-500/80 transition-colors"
                  aria-label="画像を再生成"
                >
                  <ArrowPathIcon className="h-4 w-4 text-neutral-400 hover:text-white" />
                </button>
                <button
                  onClick={(e) => handleDelete(e, diary.id)}
                  className="p-1 rounded-full bg-neutral-900/80 hover:bg-red-500/80 transition-colors"
                  aria-label="日記を削除"
                >
                  <TrashIcon className="h-4 w-4 text-neutral-400 hover:text-white" />
                </button>
              </div>
              <div className="h-[30%] p-3 flex flex-col">
                <div className="text-xs text-muted-foreground mb-1" suppressHydrationWarning>
                  {new Date(diary.createdAt).toLocaleDateString('ja-JP')}
                </div>
                <p className="text-sm line-clamp-2 text-foreground/80">
                  {diary.text || '(本文なし)'}
                </p>
              </div>
              {diary.imageUrl && (
                <div className="h-[70%] relative">
                  <img
                    src={diary.imageUrl}
                    alt="日記の画像"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
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