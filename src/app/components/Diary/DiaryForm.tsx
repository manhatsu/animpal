'use client'
import React, { useState } from 'react'
import { detectEmotionPredefined, emotionToImage } from '@/utils/emotion'
import { Diary } from '@/types/diary'

type Props = {
  onSave: (diary: Diary) => void
}

const DiaryForm: React.FC<Props> = ({ onSave }) => {
  const [text, setText] = useState('')

  const handleSubmit = () => {
    if (!text.trim()) return
    const emotion = detectEmotionPredefined(text)
    const image = emotionToImage(emotion)
    const newDiary: Diary = {
      id: Date.now().toString(),
      text,
      emotion,
      image,
      createdAt: new Date().toISOString(),
    }
    onSave(newDiary)
    setText('')
  }

  return (
    <form
      className="space-y-6"
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <textarea
        className="w-full bg-neutral-900 text-white p-4 rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition resize-none"
        rows={7}
        placeholder="今日の気持ちや出来事を記入しましょう"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 transition-colors text-white px-6 py-2 rounded-lg font-medium shadow disabled:opacity-50"
          disabled={!text.trim()}
        >
          保存
        </button>
      </div>
    </form>
  )
}

export default DiaryForm 