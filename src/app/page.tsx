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
import { saveAvatarToDB, getAvatarFromDB, clearAvatarFromDB, saveDiaryToDB, getDiariesFromDB, deleteAllDiariesFromDB, AvatarData, deleteDiaryFromDB } from '../utils/db'

export default function HomePage() {
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null)
  const [creating, setCreating] = useState<boolean>(false)
  const [selectedNavItem, setSelectedNavItem] = useState<NavItemKey>('diary')

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFileType, setAvatarFileType] = useState<'gif' | 'mp4' | null>(null)
  const [avatarName, setAvatarName] = useState<string | null>(null);
  const [avatarServerFileName, setAvatarServerFileName] = useState<string | null>(null);

  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const avatarData = await getAvatarFromDB();
        if (avatarData) {
          setAvatarUrl(avatarData.fileUrl);
          setAvatarFileType(avatarData.fileType);
          setAvatarName(avatarData.name || null);
          setAvatarServerFileName(avatarData.fileName);
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

  const handleDeleteDiary = async (diaryId: string) => {
    if (!window.confirm('この日記を削除しますか？この操作は取り消せません。')) {
      return;
    }
    try {
      await deleteDiaryFromDB(diaryId);
      setDiaries(diaries.filter(diary => diary.id !== diaryId));
      if (selectedDiary?.id === diaryId) {
        setSelectedDiary(null);
      }
    } catch (error) {
      console.error("Failed to delete diary", error);
      alert('日記の削除に失敗しました。');
    }
  }

  const handleRegenerateImage = async (diary: Diary) => {
    if (!window.confirm('この日記の画像を再生成しますか？')) {
      return;
    }
    try {
      const response = await fetch('/api/generateAvatarImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: diary.text,
          imageBase64: diary.imageUrl.split(',')[1]
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '画像の再生成に失敗しました');
      }

      const updatedDiary = {
        ...diary,
        imageUrl: data.imageUrl
      };

      await saveDiaryToDB(updatedDiary);
      setDiaries(diaries.map(d => d.id === diary.id ? updatedDiary : d));
      if (selectedDiary?.id === diary.id) {
        setSelectedDiary(updatedDiary);
      }
    } catch (error) {
      console.error("Failed to regenerate image", error);
      alert('画像の再生成に失敗しました。');
    }
  }

  const handleAvatarUpload = useCallback(async (file: File, fileType: 'gif' | 'mp4', name: string) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', name)
      formData.append('fileType', fileType)

      const response = await fetch('/api/uploadAvatar', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'アップロードに失敗しました')
      }

      const newAvatarData: AvatarData = {
        id: 'currentAvatar',
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileType: fileType,
        name: name,
      };

      await saveAvatarToDB(newAvatarData);

      setAvatarUrl(newAvatarData.fileUrl);
      setAvatarFileType(newAvatarData.fileType);
      setAvatarName(newAvatarData.name);
      setAvatarServerFileName(newAvatarData.fileName);
      alert('アバターが更新されました！')
    } catch (error) {
      alert('アバターの保存に失敗しました。' + (error instanceof Error ? error.message : ''))
      console.error("Failed to save avatar", error)
    }
  }, [])

  const handleClearAvatar = useCallback(async () => {
    try {
      if (avatarServerFileName) {
        const response = await fetch(`/api/deleteAvatar?fileName=${avatarServerFileName}`, {
          method: 'DELETE',
        })

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'サーバーからのアバター削除に失敗しました');
        }
      }
      
      await clearAvatarFromDB();
      
      setAvatarUrl(null)
      setAvatarFileType(null)
      setAvatarName(null)
      setAvatarServerFileName(null);
      alert('アバターをクリアしました。')
    } catch (error) {
      alert('アバターのクリアに失敗しました。' + (error instanceof Error ? error.message : ''))
      console.error("Failed to clear avatar", error)
    }
  }, [avatarServerFileName])

  const handleClearCache = useCallback(async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      alert('ブラウザキャッシュをクリアしました。');
    } catch (error) {
      console.error("Failed to clear browser cache", error);
      alert('ブラウザキャッシュのクリアに失敗しました。');
    }
  }, []);

  const handleDeleteAllData = useCallback(async () => {
    if (!window.confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
      return;
    }
    try {
      if (avatarServerFileName) {
        const response = await fetch(`/api/deleteAvatar?fileName=${avatarServerFileName}`, {
          method: 'DELETE',
        });
        if (!response.ok) console.warn("Server avatar deletion failed during delete all, but proceeding.")
      }
      await clearAvatarFromDB();
      
      await deleteAllDiariesFromDB();
      
      setAvatarUrl(null);
      setAvatarFileType(null);
      setAvatarName(null);
      setAvatarServerFileName(null);
      setDiaries([]);
      setSelectedDiary(null);
      
      alert('すべてのデータを削除しました。');
    } catch (error) {
      console.error("Failed to delete all data", error);
      alert('データの削除に失敗しました。');
    }
  }, [avatarServerFileName]);

  return (
    <div className="flex h-screen bg-neutral-950 text-white">
      <Sidebar 
        selectedNavItem={selectedNavItem} 
        onSelectNavItem={setSelectedNavItem} 
        onClearCache={handleClearCache}
        onDeleteAllData={handleDeleteAllData}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onNew={handleNewDiary} avatarName={avatarName} />

        {selectedNavItem === 'diary' && (
          <main className="flex-1 overflow-y-auto p-8">
            <AnimatePresence mode="wait">
              {creating ? (
                <motion.div
                  key="form-diary"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-2xl mx-auto"
                >
                  <DiaryForm 
                    onSave={handleSaveDiary} 
                    currentAvatarUrl={avatarUrl} 
                    currentAvatarFileType={avatarFileType}
                  />
                </motion.div>
              ) : !selectedDiary && (
                <motion.div
                  key="avatar-display"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-2xl mx-auto h-[calc(100vh-450px)] flex items-center justify-center"
                >
                  <AvatarDisplay avatarUrl={avatarUrl} fileType={avatarFileType} />
                </motion.div>
              )}
            </AnimatePresence>
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
              onAddNewDiary={handleNewDiary}
              onDeleteDiary={handleDeleteDiary}
              onRegenerateImage={handleRegenerateImage}
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
