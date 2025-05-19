'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Diary } from '@/types/diary'
import Header from './components/Header/Header'
import DiaryForm from './components/Diary/DiaryForm'
import DiaryListArea from './components/Diary/DiaryList'
import DiaryViewer from './components/Diary/DiaryViewer'
import Sidebar, { NavItemKey } from './components/Sidebar/Sidebar'
import { saveDiaryToDB, getDiariesFromDB } from '../utils/db'

export default function HomePage() {
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null)
  const [creating, setCreating] = useState<boolean>(false)
  const [selectedNavItem, setSelectedNavItem] = useState<NavItemKey>('diary')

  useEffect(() => {
    const loadDiaries = async () => {
      try {
        const storedDiaries = await getDiariesFromDB();
        storedDiaries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setDiaries(storedDiaries);
      } catch (error) {
        console.error("Failed to load diaries from DB", error);
      }
    };
    if (typeof window !== 'undefined') {
      loadDiaries();
    }
  }, []);

  useEffect(() => {
    if (selectedDiary && selectedNavItem === 'diary') {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [selectedDiary, selectedNavItem])

  const handleSaveDiary = async (newDiary: Diary) => {
    const newDiaries = [newDiary, ...diaries]
    newDiaries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setDiaries(newDiaries)
    setSelectedDiary(newDiary)
    setCreating(false)
    try {
      await saveDiaryToDB(newDiary);
    } catch (error) {
      console.error("Failed to save diary to DB", error);
      alert("日記の保存に失敗しました。");
    }
  }

  const handleNewDiary = () => {
    setSelectedDiary(null)
    setCreating(true)
  }

  const handleSelectDiary = (diary: Diary) => {
    setSelectedDiary(diary)
    setCreating(false)
  }

  const handleCloseViewer = () => {
    setSelectedDiary(null)
  }

  return (
    <div className="flex h-screen bg-neutral-950 text-white">
      <Sidebar selectedNavItem={selectedNavItem} onSelectNavItem={setSelectedNavItem} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onNew={handleNewDiary} /> 

        {selectedNavItem === 'diary' && (
          <main className="flex-1 overflow-y-auto p-8">
            {creating && (
              <motion.div
                key="form-diary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="max-w-2xl mx-auto"
              >
                <DiaryForm onSave={handleSaveDiary} />
              </motion.div>
            )}
            {!creating && !selectedDiary && (
              <div className="text-center text-neutral-500 p-8">日記を作成するか、下から選択してください。</div>
            )}
          </main>
        )}

        {selectedNavItem === 'diary' && (
          <motion.aside
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="h-1/2 max-h-[450px] bg-neutral-800/50 border-t border-neutral-700 shadow-lg z-40"
          >
            <DiaryListArea
              diaries={diaries}
              onSelect={handleSelectDiary}
              selectedDiary={selectedDiary}
            />
          </motion.aside>
        )}
      </div>

      <AnimatePresence>
        {selectedNavItem === 'diary' && selectedDiary && !creating && (
          <DiaryViewer diary={selectedDiary} onClose={handleCloseViewer} />
        )}
      </AnimatePresence>
    </div>
  )
}
