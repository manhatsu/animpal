import React from 'react'
import { Diary } from '@/types/diary'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

type Props = {
  diary: Diary | null
  onClose: () => void
}

const DiaryViewer: React.FC<Props> = ({ diary, onClose }) => {
  if (!diary) {
    return null // モーダルなので、diaryがなければ何も表示しない
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl space-y-4 w-full max-w-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-300 transition-colors"
          aria-label="閉じる"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <div className="flex flex-col gap-4">
          <div className="text-xs text-neutral-500">{new Date(diary.createdAt).toLocaleString()}</div>
          {diary.imageUrl && (
            <div className="w-full aspect-video rounded-lg overflow-hidden">
              <img
                src={diary.imageUrl}
                alt="生成された画像"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <p className="text-lg whitespace-pre-wrap text-white max-h-[40vh] overflow-y-auto">{diary.text}</p>
        </div>
      </motion.div>
    </div>
  )
}

export default DiaryViewer 