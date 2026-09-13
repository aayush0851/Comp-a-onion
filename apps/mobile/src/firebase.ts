import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBymrOlNsEWP1ja38tl2--qRtvnzTWPtHI',
  authDomain: 'companion-assets.firebaseapp.com',
  projectId: 'companion-assets',
  storageBucket: 'companion-assets.firebasestorage.app',
  messagingSenderId: '289553300282',
  appId: '1:289553300282:web:a796c73a6d1f092699ee03',
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const MIME_BY_EXT: Record<string, string> = {
  png: 'image/png',
  webp: 'image/webp',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
};

export async function uploadMedia(uri: string): Promise<string> {
  const filename = uri.split('/').pop() ?? 'upload';
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const type = MIME_BY_EXT[ext] ?? 'image/jpeg';

  const rawBlob = await fetch(uri).then((r) => r.blob());
  const blob = rawBlob.type ? rawBlob : new Blob([rawBlob], { type });

  const path = `media/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext || 'jpg'}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType: blob.type || type });
  return getDownloadURL(storageRef);
}
