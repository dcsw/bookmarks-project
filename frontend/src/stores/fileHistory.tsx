import { persistentAtom } from '@nanostores/persistent'

export interface FileHistoryItem {
  filename: string;
  lastUsed: string;
}

export const fileHistory = persistentAtom<FileHistoryItem[]>(
  'fileHistory',
  [],
  {
    encode: JSON.stringify,
    decode(value) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
        return [];
      } catch {
        return [];
      }
    }
  }
);
