'use client'

import React from 'react'

interface AvatarDisplayProps {
  avatarUrl: string | null
  fileType: 'gif' | 'mp4' | null
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ avatarUrl, fileType }) => {
  if (!avatarUrl || !fileType) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-500">
        <span className="text-6xl mb-4">🐾</span>
        <p className="text-center">
          アバターが設定されていません。
          <br />
          左のメニューから「アバター設定」を選択して、
          <br />
          お気に入りのGIFまたはMP4動画をアップロードしてください。
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-full w-full">
      {fileType === 'mp4' ? (
        <video src={avatarUrl} className="max-w-full max-h-full object-contain" autoPlay loop muted playsInline />
      ) : (
        <img src={avatarUrl} alt="Avatar" className="max-w-full max-h-full object-contain" />
      )}
    </div>
  )
}

export default AvatarDisplay 