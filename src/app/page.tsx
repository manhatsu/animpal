'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Diary } from '@/types/diary'
import Header from './components/Header/Header'
import DiaryForm from './components/Diary/DiaryForm'
import DiaryListArea from './components/Diary/DiaryList'
import DiaryViewer from './components/Diary/DiaryViewer'
import Sidebar, { NavItemKey } from './components/Sidebar/Sidebar'
import AvatarDisplay from './components/AvatarDisplay/AvatarDisplay'
import AvatarUploadForm from './components/AvatarUpload/AvatarUploadForm'
import { saveAvatarToDB, getAvatarFromDB, clearAvatarFromDB, saveDiaryToDB, getDiariesFromDB } from '../utils/db'

export default function HomePage() {
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null)
  const [creating, setCreating] = useState<boolean>(false)
  const [selectedNavItem, setSelectedNavItem] = useState<NavItemKey>('diary')

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFileType, setAvatarFileType] = useState<'gif' | 'mp4' | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarName, setAvatarName] = useState<string | null>(null);
  const [previousObjectUrl, setPreviousObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const avatarData = await getAvatarFromDB();
        if (avatarData && avatarData.file) {
          if (previousObjectUrl) URL.revokeObjectURL(previousObjectUrl);
          const url = URL.createObjectURL(avatarData.file);
          setAvatarUrl(url);
          setAvatarFileType(avatarData.fileType);
          setAvatarName(avatarData.name || null);
          setPreviousObjectUrl(url);
        }
      } catch (error) {
        console.error("Failed to load avatar from DB", error);
      }
    };
    if (typeof window !== 'undefined') {
      loadAvatar();
    }
  }, []);

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

  useEffect(() => {
    return () => {
      if (avatarUrl && avatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [avatarUrl]);

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

  const handleAvatarUpload = useCallback(async (file: File, fileType: 'gif' | 'mp4', name: string) => {
    try {
      await saveAvatarToDB(file, fileType, name);
      if (previousObjectUrl) URL.revokeObjectURL(previousObjectUrl);
      
      const newUrl = URL.createObjectURL(file);
      setAvatarUrl(newUrl);
      setAvatarFileType(fileType);
      setAvatarFile(file);
      setAvatarName(name);
      setPreviousObjectUrl(newUrl);
      alert('アバターが更新されました！');
    } catch (error) {
      alert('アバターの保存に失敗しました。');
      console.error("Failed to save avatar", error);
    }
  }, [previousObjectUrl]);

  const handleClearAvatar = useCallback(async () => {
    try {
      await clearAvatarFromDB();
      if (avatarUrl && avatarUrl.startsWith('blob:')) URL.revokeObjectURL(avatarUrl);
      setAvatarUrl(null);
      setAvatarFileType(null);
      setAvatarFile(null);
      setAvatarName(null);
      setPreviousObjectUrl(null);
      alert('アバターをクリアしました。');
    } catch (error) {
      alert('アバターのクリアに失敗しました。');
      console.error("Failed to clear avatar", error);
    }
  }, [avatarUrl]);

  return (
    <div className="flex h-screen bg-neutral-950 text-white">
      <Sidebar selectedNavItem={selectedNavItem} onSelectNavItem={setSelectedNavItem} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onNew={handleNewDiary} avatarName={avatarName} />

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
              <AvatarDisplay avatarUrl={avatarUrl} fileType={avatarFileType} />
            )}
          </main>
        )}

        {selectedNavItem === 'avatar_settings' && (
          <main className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
            <AvatarUploadForm 
              onAvatarUpload={handleAvatarUpload} 
              currentAvatarUrl={avatarUrl} 
              currentFileType={avatarFileType} 
              currentName={avatarName}
              onClearAvatar={handleClearAvatar}
            />
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
