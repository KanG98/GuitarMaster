// Mock firebase/firestore
export const mockAddDoc = jest.fn();
export const mockGetDocs = jest.fn();
export const mockDeleteDoc = jest.fn();
export const mockUpdateDoc = jest.fn();
export const mockDoc = jest.fn();
export const mockCollection = jest.fn();
export const mockServerTimestamp = jest.fn(() => new Date());

// Mock firebase/storage
export const mockRef = jest.fn();
export const mockUploadBytes = jest.fn();
export const mockGetDownloadURL = jest.fn();

export const mockIncrement = jest.fn((n: number) => n);

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: (...args: unknown[]) => mockCollection(...args),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  increment: (n: number) => mockIncrement(n),
  serverTimestamp: () => mockServerTimestamp(),
}));

jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(),
  ref: (...args: unknown[]) => mockRef(...args),
  uploadBytes: (...args: unknown[]) => mockUploadBytes(...args),
  getDownloadURL: (...args: unknown[]) => mockGetDownloadURL(...args),
}));

jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
}));

jest.mock("@/lib/firebase", () => ({
  db: {},
  storage: {},
}));
