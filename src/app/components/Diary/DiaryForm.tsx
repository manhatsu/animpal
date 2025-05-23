'use client'
import React, { useState } from 'react'
import { detectEmotionPredefined, emotionToImage } from '@/utils/emotion'
import { Diary } from '@/types/diary'

type ImageGenerationMethod = 'predefined' | 'gemini';

type Props = {
  onSave: (diary: Diary) => void;
  currentAvatarUrl: string | null;
  currentAvatarFileType: 'gif' | 'mp4' | null;
}

const DiaryForm: React.FC<Props> = ({ onSave, currentAvatarUrl, currentAvatarFileType }) => {
  const [text, setText] = useState('')
  const [imageGenerationMethod, setImageGenerationMethod] = useState<ImageGenerationMethod>('predefined')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const extractFrameFromVideo = (videoFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = () => {
        video.currentTime = 0;
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context could not be created for video frame extraction'));
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frameBase64 = canvas.toDataURL('image/jpeg', 0.8);
        // ヘッダー部分を削除
        resolve(frameBase64.split(',')[1]);
        URL.revokeObjectURL(video.src); // メモリ解放
      };

      video.onerror = (e) => {
        reject(new Error('Failed to load video for frame extraction'));
        URL.revokeObjectURL(video.src); // メモリ解放
      };

      video.src = URL.createObjectURL(videoFile);
      video.play().catch(reject); // Safariでplay()が必要な場合があるため
    });
  };

  // 画像をリサイズしてBase64に変換する関数
  const resizeAndConvertToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // CORSエラーを防ぐ

        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 1024;
            let width = img.width;
            let height = img.height;

            if (width > height && width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            } else if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Canvas context could not be created'));
              return;
            }

            ctx.drawImage(img, 0, 0, width, height);
            const base64 = canvas.toDataURL('image/jpeg', 0.8);
            // Base64データからヘッダー部分を削除
            const base64Data = base64.split(',')[1];
            resolve(base64Data);
          } catch (error) {
            reject(new Error('Image processing failed: ' + (error instanceof Error ? error.message : 'Unknown error')));
          }
        };

        img.onerror = (eventOrMessage) => {
          console.error('Image loading failed. Event/Message:', eventOrMessage);
          reject(new Error('Failed to load image. Original file type: ' + file.type));
        };

        const result = e.target?.result;
        if (typeof result !== 'string') {
          reject(new Error('Invalid image data'));
          return;
        }
        img.src = result;
      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('日記の内容を入力してください。');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      let imageUrl = null;
      let base64Data: string | null = null;

      if (imageGenerationMethod === 'gemini' && currentAvatarUrl) {
        try {
          const response = await fetch(currentAvatarUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch avatar: ${response.status} ${response.statusText}`);
          }
          const blob = await response.blob();

          if (currentAvatarFileType === 'mp4') {
            const videoFile = new File([blob], 'avatar.mp4', { type: 'video/mp4' });
            base64Data = await extractFrameFromVideo(videoFile);
          } else {
            const extension = blob.type.split('/')[1] || 'bin';
            const imageFile = new File([blob], `avatar.${extension}`, { type: blob.type });
            if (!imageFile.type.startsWith('image/')) {
              console.error(`Attempted to process non-image file type: ${imageFile.type}`);
              throw new Error(`アバターは画像ファイルではありません (${imageFile.type})。Geminiでの画像生成には画像またはMP4ファイルを使用してください。`);
            }
            base64Data = await resizeAndConvertToBase64(imageFile);
          }

          if (!base64Data) {
            throw new Error('アバターからの画像データの取得に失敗しました。');
          }

          const geminiResponse = await fetch('/api/generateAvatarImage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: text,
              imageBase64: base64Data
            }),
          });

          const data = await geminiResponse.json();

          if (!geminiResponse.ok) {
            const errorDetails = data.details || (data.error ? `${data.error} (API)` : '画像の生成に失敗しました');
            const geminiErrorDetails = data.gemini_error_details ? `Gemini Details: ${JSON.stringify(data.gemini_error_details, null, 2)}` : null;
            const stack = data.stack ? `Stack: ${data.stack}` : null;
            
            let fullErrorMessage = errorDetails;
            if (geminiErrorDetails) fullErrorMessage += `\n${geminiErrorDetails}`;
            if (stack && process.env.NODE_ENV === 'development') fullErrorMessage += `\n${stack}`;

            console.error('Gemini API response error:', data);
            throw new Error(fullErrorMessage);
          }

          imageUrl = data.imageUrl;
        } catch (error) {
          console.error('Gemini API processing error in DiaryForm:', error);
          let errorMessage = error instanceof Error ? error.message : '画像の生成またはアバター処理に失敗しました';
          // エラーメッセージに詳細情報が含まれているか確認し、表示を調整
          if (error instanceof Error && error.message.includes('Gemini Details:')) {
            // 詳細情報が長い場合があるため、主要なメッセージのみを初期表示し、詳細はコンソールで確認を促すなど検討
            // ここでは一旦そのまま表示
          }
          setError(errorMessage);
          setIsGenerating(false);
          return;
        }
      } else {
        // Predefinedの画像生成処理
        const emotion = detectEmotionPredefined(text);
        imageUrl = emotionToImage(emotion);
      }

      const newDiary: Diary = {
        id: Date.now().toString(),
        text,
        imageUrl,
        createdAt: new Date().toISOString(),
      };

      onSave(newDiary);
      setText('');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit}
    >
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-neutral-300">画像生成方法:</label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="predefined"
                checked={imageGenerationMethod === 'predefined'}
                onChange={(e) => setImageGenerationMethod(e.target.value as ImageGenerationMethod)}
                className="form-radio text-sky-500"
              />
              <span className="ml-2 text-sm text-neutral-300">プリセット</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="gemini"
                checked={imageGenerationMethod === 'gemini'}
                onChange={(e) => setImageGenerationMethod(e.target.value as ImageGenerationMethod)}
                className="form-radio text-sky-500"
                disabled={!currentAvatarUrl}
              />
              <span className="ml-2 text-sm text-neutral-300">Gemini AI</span>
            </label>
          </div>
        </div>

        <textarea
          className="w-full bg-neutral-900 text-white p-4 rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition resize-none"
          rows={7}
          placeholder="今日の気持ちや出来事を記入しましょう"
          value={text}
          onChange={e => setText(e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 transition-colors text-white px-6 py-2 rounded-lg font-medium shadow disabled:opacity-50"
          disabled={!text.trim() || isGenerating}
        >
          {isGenerating ? '生成中...' : '保存'}
        </button>
      </div>
    </form>
  )
}

export default DiaryForm 