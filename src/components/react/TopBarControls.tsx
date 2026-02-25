import React, { useEffect, useState } from 'react';
import LucideIcon from '@/components/react/LucideIcon';

const THEME_KEY = 'tsb:theme';
const A11Y_KEY = 'tsb:a11y';

type ThemeMode = 'dark' | 'light';

const getStoredTheme = (): ThemeMode | null => {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return null;
};

const getStoredA11y = (): boolean | null => {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(A11Y_KEY);
  if (stored === '1') return true;
  if (stored === '0') return false;
  return null;
};

export default function TopBarControls() {
  const [isDark, setIsDark] = useState(true);
  const [isA11yMode, setIsA11yMode] = useState(false);

  useEffect(() => {
    const storedTheme = getStoredTheme();
    if (storedTheme) {
      setIsDark(storedTheme === 'dark');
    } else if (window.matchMedia) {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    const storedA11y = getStoredA11y();
    if (storedA11y !== null) {
      setIsA11yMode(storedA11y);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    window.localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    document.body.classList.toggle('font-mode-system', isA11yMode);
    document.body.classList.toggle('font-mode-pixel', !isA11yMode);
    window.localStorage.setItem(A11Y_KEY, isA11yMode ? '1' : '0');
  }, [isA11yMode]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsA11yMode((prev) => !prev)}
        className={`p-1 rounded transition-colors cursor-pointer ${
          isA11yMode
            ? 'text-blue-600 dark:text-green-400 bg-gray-300 dark:bg-[#222]'
            : 'text-gray-500 hover:text-blue-600 dark:hover:text-green-400 hover:bg-gray-300 dark:hover:bg-[#222]'
        }`}
        title={isA11yMode ? 'Disable Accessibility Mode' : 'Enable Accessibility Mode'}
        aria-label="Toggle Accessibility Mode"
        aria-pressed={isA11yMode}
      >
        <LucideIcon name="accessibility" size={16} />
      </button>
      <button
        type="button"
        onClick={() => setIsDark((prev) => !prev)}
        className="p-1 rounded text-gray-500 hover:text-blue-600 dark:hover:text-green-400 hover:bg-gray-300 dark:hover:bg-[#222] transition-colors cursor-pointer"
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label="Toggle Theme"
      >
        <LucideIcon name="sun" size={16} />
        <span className="sr-only">Toggle Theme</span>
      </button>
    </>
  );
}
