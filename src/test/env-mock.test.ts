import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isLocalValidation,
  hasValidNotionCredentials,
  shouldUseFixtures,
  getContentSourceMode,
} from './env-mock';

describe('Environment Mock Utilities', () => {
  const originalArgv = process.argv;
  const originalEnv = process.env;

  beforeEach(() => {
    // Save original values
    vi.stubGlobal('process', {
      ...process,
      argv: ['node', 'script.js'],
      env: { ...originalEnv },
    });
  });

  afterEach(() => {
    // Restore original values
    vi.stubGlobal('process', {
      ...originalProcess,
      argv: originalArgv,
      env: originalEnv,
    });
  });

  describe('isLocalValidation', () => {
    it('should return false for generic commands', () => {
      vi.stubGlobal('process', {
        ...process,
        argv: ['node', 'script.js', 'build'],
      });
      expect(isLocalValidation()).toBe(false);
    });

    it('should return true for validate:local command', () => {
      vi.stubGlobal('process', {
        ...process,
        argv: ['node', 'pnpm', 'validate:local'],
      });
      expect(isLocalValidation()).toBe(true);
    });

    it('should return true for check command', () => {
      vi.stubGlobal('process', {
        ...process,
        argv: ['node', 'astro', 'check'],
      });
      expect(isLocalValidation()).toBe(true);
    });

    it('should return true for test:fixtures command', () => {
      vi.stubGlobal('process', {
        ...process,
        argv: ['node', 'pnpm', 'test:fixtures'],
      });
      expect(isLocalValidation()).toBe(true);
    });
  });

  describe('hasValidNotionCredentials', () => {
    it('should return false when NOTION_TOKEN is missing', () => {
      vi.stubGlobal('process', {
        ...process,
        env: { ...originalEnv, NOTION_TOKEN: '', NOTION_DATABASE_ID: 'valid-db' },
      });
      expect(hasValidNotionCredentials()).toBe(false);
    });

    it('should return false when NOTION_DATABASE_ID is missing', () => {
      vi.stubGlobal('process', {
        ...process,
        env: { ...originalEnv, NOTION_TOKEN: 'valid-token', NOTION_DATABASE_ID: '' },
      });
      expect(hasValidNotionCredentials()).toBe(false);
    });

    it('should return false for placeholder values', () => {
      vi.stubGlobal('process', {
        ...process,
        env: { ...originalEnv, NOTION_TOKEN: '***', NOTION_DATABASE_ID: 'invalid' },
      });
      expect(hasValidNotionCredentials()).toBe(false);
    });

    it('should return false for empty string credentials', () => {
      vi.stubGlobal('process', {
        ...process,
        env: { ...originalEnv, NOTION_TOKEN: '', NOTION_DATABASE_ID: '' },
      });
      expect(hasValidNotionCredentials()).toBe(false);
    });
  });

  describe('shouldUseFixtures', () => {
    it('should return true when local validation is detected', () => {
      vi.stubGlobal('process', {
        ...process,
        argv: ['node', 'validate:local'],
        env: { ...originalEnv },
      });
      expect(shouldUseFixtures()).toBe(true);
    });

    it('should return true when credentials are invalid', () => {
      vi.stubGlobal('process', {
        ...process,
        argv: ['node', 'build'],
        env: { ...originalEnv, NOTION_TOKEN: '', NOTION_DATABASE_ID: '' },
      });
      expect(shouldUseFixtures()).toBe(true);
    });

    it('should return false when credentials are valid and not local validation', () => {
      vi.stubGlobal('process', {
        ...process,
        argv: ['node', 'build'],
        env: { ...originalEnv, NOTION_TOKEN: 'real-token', NOTION_DATABASE_ID: 'real-db' },
      });
      expect(shouldUseFixtures()).toBe(false);
    });
  });

  describe('getContentSourceMode', () => {
    it('should return "fixtures" for local validation', () => {
      vi.stubGlobal('process', {
        ...process,
        argv: ['node', 'validate:local'],
        env: { ...originalEnv },
      });
      expect(getContentSourceMode()).toBe('fixtures');
    });

    it('should return "fixtures" when credentials are invalid', () => {
      vi.stubGlobal('process', {
        ...process,
        argv: ['node', 'build'],
        env: { ...originalEnv, NOTION_TOKEN: '', NOTION_DATABASE_ID: '' },
      });
      expect(getContentSourceMode()).toBe('fixtures');
    });

    it('should return "notion" when credentials are valid and not local validation', () => {
      vi.stubGlobal('process', {
        ...process,
        argv: ['node', 'build'],
        env: { ...originalEnv, NOTION_TOKEN: 'real-token', NOTION_DATABASE_ID: 'real-db' },
      });
      expect(getContentSourceMode()).toBe('notion');
    });
  });
});

// Store original process for restoration
const originalProcess = process;