import { execSync } from 'child_process';
import { existsSync, writeFileSync, statSync, readFileSync, readdirSync } from 'fs';
import { readdir } from 'fs/promises';
import { join, basename, extname, relative } from 'path';

const SONGS_REPO_URL = 'https://github.com/KanG98/songs.git';
const ZIP_PREFIX = 'songs';
const EXTRACTED_MARKER = '.guitarmaster_extracted';

const MIME_TYPES: Record<string, string> = {
  '.gp5': 'application/x-guitar-pro-5',
  '.gp4': 'application/x-guitar-pro-4',
  '.gp3': 'application/x-guitar-pro-3',
  '.gpx': 'application/x-guitar-pro-6',
  '.gp': 'application/x-guitar-pro',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.txt': 'text/plain',
  '.mid': 'audio/midi',
  '.midi': 'audio/midi',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ptb': 'application/x-power-tab',
  '.tef': 'application/x-tabledit',
  '.tab': 'text/plain',
};

function getMimeType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function getProjectRoot(): string {
  return process.cwd();
}

export function getSongsDirectoryPath(): string {
  return join(getProjectRoot(), 'songs');
}

function getOpenCCVariants(query: string): string[] {
  const variants: string[] = [query];

  try {
    const sanitized = query.replace(/'/g, "'\\''");
    const s2t = execSync(`printf '%s' '${sanitized}' | opencc -c s2t.json 2>/dev/null`, {
      encoding: 'utf-8',
    }).trim();
    if (s2t && s2t !== query) {
      variants.push(s2t);
    }
  } catch {
    // opencc not available
  }

  try {
    const sanitized = query.replace(/'/g, "'\\''");
    const t2s = execSync(`printf '%s' '${sanitized}' | opencc -c t2s.json 2>/dev/null`, {
      encoding: 'utf-8',
    }).trim();
    if (t2s && t2s !== query && !variants.includes(t2s)) {
      variants.push(t2s);
    }
  } catch {
    // opencc not available
  }

  return variants;
}

async function walkDir(dir: string): Promise<string[]> {
  const results: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await walkDir(fullPath);
      results.push(...subFiles);
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }
  return results;
}

export interface SongFileInfo {
  relativePath: string;
  fileName: string;
  size: number;
  type: string;
}

function getZipFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(
    (f: string) => f.startsWith(ZIP_PREFIX) && f.endsWith('.zip')
  );
}

export async function isSongsDirectoryReady(): Promise<boolean> {
  const songsDir = getSongsDirectoryPath();
  if (!existsSync(songsDir)) return false;
  const zips = getZipFiles(songsDir);
  if (zips.length === 0) return true;
  return existsSync(join(songsDir, EXTRACTED_MARKER));
}

export function hasSongFolders(): boolean {
  const songsDir = getSongsDirectoryPath();
  if (!existsSync(songsDir)) return false;
  return existsSync(join(songsDir, 'songs1')) && existsSync(join(songsDir, 'songs2'));
}

export async function ensureSongsDirectoryReady(): Promise<{
  ready: boolean;
  message: string;
}> {
  const songsDir = getSongsDirectoryPath();

  if (!existsSync(songsDir)) {
    try {
      execSync(`git clone ${SONGS_REPO_URL} "${songsDir}"`, {
        encoding: 'utf-8',
        timeout: 120_000,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { ready: false, message: `Failed to clone songs repo: ${msg}` };
    }
  }

  const zips = getZipFiles(songsDir);
  const markerPath = join(songsDir, EXTRACTED_MARKER);

  if (zips.length > 0 && !existsSync(markerPath)) {
    for (const zipFile of zips) {
      try {
        execSync(`unzip -o "${zipFile}"`, {
          cwd: songsDir,
          encoding: 'utf-8',
          timeout: 60_000,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { ready: false, message: `Failed to unzip ${zipFile}: ${msg}` };
      }
    }
    writeFileSync(markerPath, '');
  }

  return { ready: true, message: 'Songs directory is ready' };
}

export async function searchSongFiles(query: string): Promise<SongFileInfo[]> {
  const songsDir = getSongsDirectoryPath();

  if (!existsSync(songsDir)) {
    return [];
  }

  const variants = getOpenCCVariants(query);
  const uniqueVariants = [...new Set(variants)];

  const allFiles = await walkDir(songsDir);

  const matched = new Map<string, SongFileInfo>();

  for (const filePath of allFiles) {
    const relPath = relative(songsDir, filePath);
    if (matched.has(relPath)) continue;

    for (const v of uniqueVariants) {
      if (relPath.toLowerCase().includes(v.toLowerCase())) {
        try {
          const stats = statSync(filePath);
          matched.set(relPath, {
            relativePath: relPath,
            fileName: basename(filePath),
            size: stats.size,
            type: getMimeType(filePath),
          });
        } catch {
          matched.set(relPath, {
            relativePath: relPath,
            fileName: basename(filePath),
            size: 0,
            type: getMimeType(filePath),
          });
        }
        break;
      }
    }
  }

  return Array.from(matched.values());
}

export function getSongFileBuffer(
  relativePath: string
): { buffer: Buffer; mimeType: string; fileName: string } {
  const songsDir = getSongsDirectoryPath();
  const fullPath = join(songsDir, relativePath);

  // Prevent path traversal
  const resolved = join(songsDir, relativePath);
  if (!resolved.startsWith(songsDir)) {
    throw new Error('Invalid file path');
  }

  if (!existsSync(fullPath)) {
    throw new Error('File not found');
  }

  return {
    buffer: readFileSync(fullPath),
    mimeType: getMimeType(fullPath),
    fileName: basename(fullPath),
  };
}
