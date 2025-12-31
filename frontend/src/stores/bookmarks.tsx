import { persistentAtom } from '@nanostores/persistent';

export const bookmarks = persistentAtom<any[]>(
  'persistentBookmarks', // storage key
  [],                   // initial value
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
    },
  }
);
