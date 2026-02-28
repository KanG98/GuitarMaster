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
  Timestamp,
} from "firebase/firestore";
import { db, storage } from "./firebase";

// --- Firestore document interfaces ---

interface SongDocument {
  name: string;
  artist: string;
  totalPracticeSeconds: number;
  youtubeVideoId: string | null;
  createdAt: Timestamp;
}

interface FileDocument {
  name: string;
  type: string;
  size: number;
  url: string;
  storagePath: string;
  order: number;
  createdAt: Timestamp;
}

// --- Public types ---

export interface SongRecord {
  id: string;
  name: string;
  artist: string;
  totalPracticeSeconds: number;
  youtubeVideoId: string | null;
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
    youtubeVideoId: null,
    createdAt: new Date(),
  };
}

export async function getSongs(): Promise<SongRecord[]> {
  const snapshot = await getDocs(collection(db, SONGS_COLLECTION));

  const songs = snapshot.docs.map((d) => {
    const data = d.data() as SongDocument;
    return {
      id: d.id,
      name: data.name,
      artist: data.artist ?? "",
      totalPracticeSeconds: data.totalPracticeSeconds ?? 0,
      youtubeVideoId: data.youtubeVideoId ?? null,
      createdAt: data.createdAt?.toDate() ?? new Date(),
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

export async function updateSongVideo(songId: string, videoId: string | null): Promise<void> {
  await updateDoc(doc(db, SONGS_COLLECTION, songId), {
    youtubeVideoId: videoId,
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
    const data = d.data() as FileDocument;
    return {
      id: d.id,
      name: data.name,
      type: data.type,
      size: data.size,
      url: data.url,
      order: data.order ?? 0,
      createdAt: data.createdAt?.toDate() ?? new Date(),
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
