import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db, storage } from "./firebase";

// --- Song types ---

export interface SongRecord {
  id: string;
  name: string;
  artist: string;
  totalPracticeSeconds: number;
  createdAt: Date;
}

export interface FileRecord {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  order: number;
  createdAt: Date;
}

const SONGS_COLLECTION = "songs";

// --- Song CRUD ---

export async function createSong(name: string, artist: string): Promise<SongRecord> {
  const docRef = await addDoc(collection(db, SONGS_COLLECTION), {
    name,
    artist,
    totalPracticeSeconds: 0,
    createdAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    name,
    artist,
    totalPracticeSeconds: 0,
    createdAt: new Date(),
  };
}

export async function getSongs(): Promise<SongRecord[]> {
  const snapshot = await getDocs(collection(db, SONGS_COLLECTION));

  const songs = snapshot.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    return {
      id: d.id,
      name: data.name as string,
      artist: (data.artist as string) ?? "",
      totalPracticeSeconds: (data.totalPracticeSeconds as number) ?? 0,
      createdAt: (data.createdAt as { toDate(): Date })?.toDate() ?? new Date(),
    };
  });

  return songs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function deleteSong(songId: string): Promise<void> {
  const filesSnapshot = await getDocs(
    collection(db, SONGS_COLLECTION, songId, "files")
  );
  const deletes = filesSnapshot.docs.map((d) =>
    deleteDoc(doc(db, SONGS_COLLECTION, songId, "files", d.id))
  );
  await Promise.all(deletes);

  await deleteDoc(doc(db, SONGS_COLLECTION, songId));
}

export async function updatePracticeTime(songId: string, additionalSeconds: number): Promise<void> {
  if (additionalSeconds <= 0) return;
  await updateDoc(doc(db, SONGS_COLLECTION, songId), {
    totalPracticeSeconds: increment(additionalSeconds),
  });
}

// --- File CRUD (scoped to a song) ---

export async function uploadFile(songId: string, file: File): Promise<FileRecord> {
  const timestamp = Date.now();
  const storagePath = `songs/${songId}/${timestamp}_${file.name}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  // Get current file count to set order
  const existing = await getDocs(
    collection(db, SONGS_COLLECTION, songId, "files")
  );
  const order = existing.size;

  const docRef = await addDoc(
    collection(db, SONGS_COLLECTION, songId, "files"),
    {
      name: file.name,
      type: file.type,
      size: file.size,
      url,
      storagePath,
      order,
      createdAt: serverTimestamp(),
    }
  );

  return {
    id: docRef.id,
    name: file.name,
    type: file.type,
    size: file.size,
    url,
    order,
    createdAt: new Date(),
  };
}

export async function getFiles(songId: string): Promise<FileRecord[]> {
  const snapshot = await getDocs(
    collection(db, SONGS_COLLECTION, songId, "files")
  );

  const files = snapshot.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    return {
      id: d.id,
      name: data.name as string,
      type: data.type as string,
      size: data.size as number,
      url: data.url as string,
      order: (data.order as number) ?? 0,
      createdAt: (data.createdAt as { toDate(): Date })?.toDate() ?? new Date(),
    };
  });

  return files.sort((a, b) => a.order - b.order);
}

export async function updateFileOrder(songId: string, fileIds: string[]): Promise<void> {
  const updates = fileIds.map((fileId, index) =>
    updateDoc(doc(db, SONGS_COLLECTION, songId, "files", fileId), { order: index })
  );
  await Promise.all(updates);
}

export async function deleteFile(songId: string, fileId: string): Promise<void> {
  await deleteDoc(doc(db, SONGS_COLLECTION, songId, "files", fileId));
}
