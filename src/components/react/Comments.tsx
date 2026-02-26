import React, { useEffect, useMemo, useRef } from 'react';

type GiscusBoolean = '0' | '1';
type GiscusMapping = 'pathname' | 'url' | 'title' | 'og:title' | 'specific';
type GiscusInputPosition = 'top' | 'bottom';

type CommentsProps = {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping?: GiscusMapping;
  strict?: GiscusBoolean;
  reactionsEnabled?: GiscusBoolean;
  emitMetadata?: GiscusBoolean;
  inputPosition?: GiscusInputPosition;
  lang?: string;
  themeLight: string;
  themeDark: string;
};

const GISCUS_SCRIPT_SRC = 'https://giscus.app/client.js';

const isNonEmpty = (value: string) => value.trim().length > 0;

const toAbsoluteTheme = (value: string) =>
  value.startsWith('/') ? `${window.location.origin}${value}` : value;

const toGiscusThemeValue = (value: string, fallback: string) => {
  const absolute = toAbsoluteTheme(value);
  if (absolute.startsWith('https://')) return absolute;
  return fallback;
};

const getTheme = (light: string, dark: string) =>
  document.documentElement.classList.contains('dark')
    ? toGiscusThemeValue(dark, 'dark')
    : toGiscusThemeValue(light, 'light');

export default function Comments({
  repo,
  repoId,
  category,
  categoryId,
  mapping = 'pathname',
  strict = '1',
  reactionsEnabled = '1',
  emitMetadata = '0',
  inputPosition = 'bottom',
  lang = 'zh-CN',
  themeLight,
  themeDark,
}: CommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const isReady = useMemo(
    () =>
      [repo, repoId, category, categoryId, themeLight, themeDark].every(isNonEmpty),
    [repo, repoId, category, categoryId, themeLight, themeDark],
  );

  useEffect(() => {
    if (!isReady) return;
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';
    const script = document.createElement('script');
    script.src = GISCUS_SCRIPT_SRC;
    script.async = true;
    script.setAttribute('data-repo', repo);
    script.setAttribute('data-repo-id', repoId);
    script.setAttribute('data-category', category);
    script.setAttribute('data-category-id', categoryId);
    script.setAttribute('data-mapping', mapping);
    script.setAttribute('data-strict', strict);
    script.setAttribute('data-reactions-enabled', reactionsEnabled);
    script.setAttribute('data-emit-metadata', emitMetadata);
    script.setAttribute('data-input-position', inputPosition);
    script.setAttribute('data-lang', lang);
    script.setAttribute('data-theme', getTheme(themeLight, themeDark));
    script.setAttribute('crossorigin', 'anonymous');
    container.appendChild(script);

    const updateTheme = () => {
      const theme = getTheme(themeLight, themeDark);
      const iframe = container.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
      if (iframe?.src) {
        const next = new URL(iframe.src);
        next.searchParams.set('theme', theme);
        if (iframe.src !== next.toString()) {
          iframe.src = next.toString();
        }
      }
    };

    const observer = new MutationObserver(updateTheme);
    const frameObserver = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    frameObserver.observe(container, { childList: true, subtree: true });
    updateTheme();
    return () => {
      observer.disconnect();
      frameObserver.disconnect();
    };
  }, [
    repo,
    repoId,
    category,
    categoryId,
    mapping,
    strict,
    reactionsEnabled,
    emitMetadata,
    inputPosition,
    lang,
    themeLight,
    themeDark,
    isReady,
  ]);

  if (!isReady) {
    return (
      <div className="font-console text-sm text-gray-500 dark:text-gray-400">
        Comments are not configured yet.
      </div>
    );
  }

  return <div ref={containerRef} className="giscus" />;
}
