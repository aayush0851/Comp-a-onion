import { randomUUID } from 'node:crypto';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

function bucket() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
  return getStorage().bucket();
}

export async function uploadMedia(buffer: Buffer, mimetype: string): Promise<string> {
  const ext = mimetype.split('/')[1] ?? 'bin';
  const file = bucket().file(`media/${randomUUID()}.${ext}`);
  await file.save(buffer, { metadata: { contentType: mimetype } });
  await file.makePublic();
  return file.publicUrl();
}
