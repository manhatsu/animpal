'use client'

import React, { useState, useCallback } from 'react'
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'

interface AvatarUploadFormProps {
  onAvatarUpload: (file: File, fileType: 'gif' | 'mp4', name: string) => void
  currentAvatarUrl?: string | null
  currentFileType?: 'gif' | 'mp4' | null
  currentName?: string | null
  onClearAvatar?: () => Promise<void>
}

const AvatarUploadForm: React.FC<AvatarUploadFormProps> = ({ onAvatarUpload, currentAvatarUrl, currentFileType, currentName, onClearAvatar }) => {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState<string>(currentName || '')

  React.useEffect(() => {
    if (currentName) {
      setName(currentName)
    }
  }, [currentName])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }, [])

  const processFile = (file: File) => {
    setError(null)
    if (!name.trim()) {
      setError('名前を入力してください。')
      return
    }
    if (file.type === 'image/gif' || file.type === 'video/mp4') {
      const fileType = file.type === 'image/gif' ? 'gif' : 'mp4'
      if (file.size > 10 * 1024 * 1024) { // 10MB size limit
        setError('ファイルサイズは10MB以下にしてください。')
        return
      }
      onAvatarUpload(file, fileType, name)
    } else {
      setError('GIFまたはMP4ファイルを選択してください。')
    }
  }

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setDragging(false)
  }, [])

  return (
    <div className="max-w-xl mx-auto p-8 bg-neutral-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">アバターを設定</h2>
      
      <div className="mb-6">
        <label htmlFor="avatarName" className="block text-sm font-medium text-neutral-300 mb-1.5">
          アバターの名前
        </label>
        <input
          type="text"
          id="avatarName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: マイパル"
          className="w-full px-4 py-2.5 bg-neutral-700/60 border border-neutral-600 rounded-lg text-foreground placeholder-neutral-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
          required
        />
      </div>

      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                    ${dragging ? 'border-sky-500 bg-sky-500/10' : 'border-neutral-600 hover:border-neutral-500'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('avatar-upload-input')?.click()}
      >
        <input 
          type="file" 
          id="avatar-upload-input" 
          className="hidden" 
          accept=".gif,.mp4" 
          onChange={handleFileChange} 
        />
        <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-neutral-500 mb-3" />
        <p className="text-neutral-400">
          ここにGIFまたはMP4ファイルをドラッグ＆ドロップ
          <br />またはクリックしてファイルを選択
        </p>
        <p className="text-xs text-neutral-500 mt-1">（最大10MB）</p>
      </div>

      {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

      {currentAvatarUrl && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-foreground mb-3 text-center">現在のアバター</h3>
          <div className="flex items-center justify-center h-48 w-full bg-neutral-700/50 rounded overflow-hidden">
            {currentFileType === 'mp4' ? (
              <video src={currentAvatarUrl} className="max-w-full max-h-full object-contain" autoPlay loop muted playsInline />
            ) : (
              <img src={currentAvatarUrl} alt="Current Avatar" className="max-w-full max-h-full object-contain" />
            )}
          </div>
          {onClearAvatar && (
            <button
              onClick={async () => {
                if(confirm('現在のアバターを削除しますか？（この操作は元に戻せません）')) {
                  try {
                    await onClearAvatar();
                  } catch (e) {
                    console.error("Avatar clear failed from component", e);
                    // エラー処理が必要であればここで行う
                  }
                }
              }}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-800"
            >
              アバターを削除
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default AvatarUploadForm 