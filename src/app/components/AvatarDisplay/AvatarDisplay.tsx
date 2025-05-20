'use client'

import React from 'react'

type Props = {
  avatarUrl: string | null;
  fileType: 'gif' | 'mp4' | null;
}

export default function AvatarDisplay({ avatarUrl, fileType }: Props) {
  if (!avatarUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-500">
        <span className="text-2xl mb-2">🎭</span>
        <span className="text-base">アバターを設定してください</span>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      {fileType === 'gif' ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="max-w-full max-h-full object-contain"
        />
      ) : (
        <video
          src={avatarUrl}
          autoPlay
          loop
          muted
          playsInline
          className="max-w-full max-h-full object-contain"
        />
      )}
    </div>
  )
} 