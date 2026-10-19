/** Read localStorage without allowing browser privacy or quota errors to break UI. */
export const safeStorageGet = (key: string): string | null => {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

/** Persist localStorage state on a best-effort basis. */
export const safeStorageSet = (key: string, value: string): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};
