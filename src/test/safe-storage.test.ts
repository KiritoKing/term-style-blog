import { afterEach, describe, expect, it, vi } from 'vitest';
import { safeStorageGet, safeStorageSet } from '../lib/safe-storage';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('safeStorageGet', () => {
  it('returns a stored value', () => {
    vi.stubGlobal('window', { localStorage: { getItem: () => 'saved' } });
    expect(safeStorageGet('key')).toBe('saved');
  });

  it('returns null when storage has no value', () => {
    vi.stubGlobal('window', { localStorage: { getItem: () => null } });
    expect(safeStorageGet('missing')).toBeNull();
  });

  it('returns null when storage access is denied', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => {
          throw new DOMException('Denied', 'SecurityError');
        },
      },
    });
    expect(safeStorageGet('key')).toBeNull();
  });
});

describe('safeStorageSet', () => {
  it('returns true when a value is persisted', () => {
    const setItem = vi.fn();
    vi.stubGlobal('window', { localStorage: { setItem } });
    expect(safeStorageSet('key', 'value')).toBe(true);
    expect(setItem).toHaveBeenCalledWith('key', 'value');
  });

  it('returns false when the storage quota is exhausted', () => {
    vi.stubGlobal('window', {
      localStorage: {
        setItem: () => {
          throw new DOMException('Full', 'QuotaExceededError');
        },
      },
    });
    expect(safeStorageSet('key', 'value')).toBe(false);
  });

  it('returns false during server rendering', () => {
    vi.stubGlobal('window', undefined);
    expect(safeStorageSet('key', 'value')).toBe(false);
    expect(safeStorageGet('key')).toBeNull();
  });
});
