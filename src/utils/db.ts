import { Diary } from '@/types/diary';

const DB_NAME = 'AnimPalDB';
const AVATAR_STORE_NAME = 'avatarStore';
const DIARY_STORE_NAME = 'diaryStore';
const VERSION = 2;

export interface AvatarData {
  id: string; 
  file: Blob;
  fileType: 'gif' | 'mp4';
}

let dbPromise: Promise<IDBDatabase> | null = null;

const openDB = (): Promise<IDBDatabase> => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        // SSR時にはindexedDBは利用できないため、エラーまたはダミーを返す
        console.warn('IndexedDB is not available during SSR.');
        // ここではエラーを発生させるか、処理をスキップするかを選択できます。
        // 簡単のため、ここではエラーを発生させます。
        return reject(new Error('IndexedDB not available on server'));
      }
      const request = indexedDB.open(DB_NAME, VERSION);

      request.onerror = (event) => {
        console.error("IndexedDB error:", (event.target as IDBOpenDBRequest).error);
        dbPromise = null; // エラー時はPromiseをリセットして再試行可能に
        reject("IndexedDB error");
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(AVATAR_STORE_NAME)) { // アバターストア作成ロジックを再追加
          db.createObjectStore(AVATAR_STORE_NAME, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(DIARY_STORE_NAME)) {
          db.createObjectStore(DIARY_STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }
  return dbPromise;
};

// アバター関連のDB関数を再追加
export const saveAvatarToDB = async (file: File, fileType: 'gif' | 'mp4'): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([AVATAR_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(AVATAR_STORE_NAME);
    const request = store.put({ id: 'current_avatar', file: file as Blob, fileType });

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('Error saving avatar to DB:', (event.target as IDBRequest).error);
      reject('Error saving avatar');
    };
  });
};

export const getAvatarFromDB = async (): Promise<AvatarData | null> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([AVATAR_STORE_NAME], 'readonly');
      const store = transaction.objectStore(AVATAR_STORE_NAME);
      const request = store.get('current_avatar');

      request.onsuccess = (event) => {
        resolve(((event.target as IDBRequest).result as AvatarData) || null);
      };
      request.onerror = (event) => {
        console.error('Error getting avatar from DB:', (event.target as IDBRequest).error);
        reject('Error getting avatar');
      };
    });
  } catch (error) {
    console.warn('Failed to open DB, likely during SSR:', error);
    return null;
  }
};

export const clearAvatarFromDB = async (): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([AVATAR_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(AVATAR_STORE_NAME);
    const request = store.delete('current_avatar');

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('Error clearing avatar from DB:', (event.target as IDBRequest).error);
      reject('Error clearing avatar');
    };
  });
};

// 日記用のDB操作関数を追加
export const saveDiaryToDB = async (diary: Diary): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([DIARY_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(DIARY_STORE_NAME);
    const request = store.put(diary);

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('Error saving diary to DB:', (event.target as IDBRequest).error);
      reject('Error saving diary');
    };
  });
};

export const getDiariesFromDB = async (): Promise<Diary[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DIARY_STORE_NAME], 'readonly');
      const store = transaction.objectStore(DIARY_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve(((event.target as IDBRequest).result as Diary[]) || []);
      };
      request.onerror = (event) => {
        console.error('Error getting diaries from DB:', (event.target as IDBRequest).error);
        reject('Error getting diaries');
      };
    });
  } catch (error) {
    console.warn('Failed to open DB for diaries, likely during SSR:', error);
    return []; // SSR時やエラー時は空配列を返す
  }
};

export const deleteDiaryFromDB = async (diaryId: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([DIARY_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(DIARY_STORE_NAME);
    const request = store.delete(diaryId);

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('Error deleting diary from DB:', (event.target as IDBRequest).error);
      reject('Error deleting diary');
    };
  });
}; 