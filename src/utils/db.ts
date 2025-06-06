import { Diary } from '@/types/diary';

const DB_NAME = 'AnimPalDB';
const AVATAR_STORE_NAME = 'avatarStore';
const DIARY_STORE_NAME = 'diaryStore';
const VERSION = 4;

export interface AvatarData {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: 'gif' | 'mp4';
  name: string;
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
        if (!db.objectStoreNames.contains(AVATAR_STORE_NAME)) {
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

// アバター情報をDBに保存（サーバーのURLなどを保存）
export const saveAvatarToDB = async (avatarData: AvatarData): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([AVATAR_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(AVATAR_STORE_NAME);
    // 常に同じIDで保存し、現在のアバター情報を上書きする
    const request = store.put({ ...avatarData, id: 'currentAvatar' }); 

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('Error saving avatar to DB:', (event.target as IDBRequest).error);
      reject('Error saving avatar data');
    };
  });
};

// アバター情報をDBから取得
export const getAvatarFromDB = async (): Promise<AvatarData | null> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([AVATAR_STORE_NAME], 'readonly');
      const store = transaction.objectStore(AVATAR_STORE_NAME);
      const request = store.get('currentAvatar'); // 常に 'currentAvatar' IDで取得

      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result as AvatarData | null);
      };
      request.onerror = (event) => {
        console.error('Error getting avatar from DB:', (event.target as IDBRequest).error);
        reject('Error getting avatar data');
      };
    });
  } catch (error) {
    console.warn('Failed to open DB for avatar, likely during SSR:', error);
    return null; 
  }
};

// アバター情報をDBから削除
export const clearAvatarFromDB = async (): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([AVATAR_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(AVATAR_STORE_NAME);
    const request = store.delete('currentAvatar'); // 常に 'currentAvatar' IDで削除

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('Error clearing avatar from DB:', (event.target as IDBRequest).error);
      reject('Error clearing avatar data');
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

export const deleteAllDiariesFromDB = async (): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([DIARY_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(DIARY_STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('Error clearing diaries from DB:', (event.target as IDBRequest).error);
      reject('Error clearing diaries');
    };
  });
}; 