/**
 * Firestore service for practice sessions.
 * Stores individual practice sessions for analytics.
 */

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { PracticeSession } from "./practiceStats";

const SESSIONS_COLLECTION = "practiceSessions";

interface SessionDocument {
  songId: string;
  songName: string;
  seconds: number;
  date: string; // YYYY-MM-DD
  createdAt: Timestamp;
}

/**
 * Log a practice session to Firestore.
 */
export async function logPracticeSession(
  songId: string,
  songName: string,
  seconds: number
): Promise<void> {
  if (seconds <= 0) return;
  const date = new Date().toISOString().slice(0, 10);
  await addDoc(collection(db, SESSIONS_COLLECTION), {
    songId,
    songName,
    seconds,
    date,
    createdAt: serverTimestamp(),
  });
}

/**
 * Fetch all practice sessions, optionally filtered by date range.
 */
export async function getPracticeSessions(
  sinceDate?: string
): Promise<PracticeSession[]> {
  let q;
  if (sinceDate) {
    q = query(
      collection(db, SESSIONS_COLLECTION),
      where("date", ">=", sinceDate)
    );
  } else {
    q = collection(db, SESSIONS_COLLECTION);
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data() as SessionDocument;
    return {
      songId: data.songId,
      songName: data.songName,
      seconds: data.seconds,
      date: data.date,
    };
  });
}
