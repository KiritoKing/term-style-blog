import type { LucideIconName } from './src/components/icons/lucide';

export interface SiteConfig {
  site: {
    origin: string;
    title: string;
    subtitle: string;
    description: string;
    author: string;
    /** Public author URL, used in structured data (not necessarily GitHub). */
    github: string;
    language: string;
    license: { name: string; url: string };
  };
  terminal: { username: string; hostname: string };
  about: { heading: string; paragraphs: string[]; skills: string[] };
  network: { icon: LucideIconName; label: string; href: string }[];
  giscus: { repo: string; repoId: string; category: string; categoryId: string; lang: string } | null;
  /** Path relative to the repository root; null emits no historical redirects. */
  redirectsFile: string | null;
  remoteImages: { protocol: 'https'; hostname: string }[];
}

/** Forks: customize this profile. No credentials are needed for local builds. */
const template: SiteConfig = {
  site: {
    origin: 'https://example.com',
    title: 'Terminal Blog',
    subtitle: 'Notes from the command line',
    description: 'A terminal-inspired Astro blog with Markdown, search and an interactive shell.',
    author: 'Demo Author',
    github: 'https://example.com/about',
    language: 'en',
    license: { name: 'MIT (demo content)', url: 'https://opensource.org/license/mit' },
  },
  terminal: { username: 'guest', hostname: 'blog' },
  about: {
    heading: 'ABOUT_ME',
    paragraphs: ['Welcome to this synthetic demo blog.', 'Replace these notes and the public Markdown collection with your own writing.'],
    skills: ['Astro', 'TypeScript', 'Markdown', 'Web'],
  },
  network: [{ icon: 'terminal', label: 'Astro documentation', href: 'https://docs.astro.build' }],
  giscus: null,
  redirectsFile: null,
  remoteImages: [],
};

/** Preserved owner settings. Selected explicitly by the protected publication build. */
const chlorine: SiteConfig = {
  site: {
    origin: 'https://chlorinec.top',
    title: "ChlorineC's Blog",
    subtitle: 'Coding With Passion',
    description: 'ChlorineC 随便写写的地方：前端、工程化、AI 与生活。',
    author: 'ChlorineC',
    github: 'https://github.com/KiritoKing',
    language: 'zh-CN',
    license: { name: 'CC BY-NC-SA 4.0', url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/' },
  },
  terminal: { username: 'chlorinec', hostname: 'blog' },
  about: {
    heading: 'ABOUT_ME',
    paragraphs: ['这里是 ChlorineC 随便写写的地方。', '记录前端、工程化、AI 与生活，也保留一点终端和像素风格。'],
    skills: ['Frontend', 'TypeScript', 'Engineering', 'AI'],
  },
  network: [{ icon: 'github', label: 'github/KiritoKing', href: 'https://github.com/KiritoKing' }],
  giscus: { repo: 'KiritoKing/notion-astro-rev', repoId: 'R_kgDONmCW3w', category: 'Announcements', categoryId: 'DIC_kwDONmCW384CpTzw', lang: 'zh-CN' },
  redirectsFile: './scripts/historical-url-map.json',
  remoteImages: [{ protocol: 'https', hostname: 'img.chlorinec.top' }, { protocol: 'https', hostname: '**.amazonaws.com' }],
};

export function getSiteConfig(profile = 'template', originOverride?: string): SiteConfig {
  if (profile !== 'template' && profile !== 'chlorine') throw new Error(`Unknown SITE_PROFILE: ${profile}`);
  const config = structuredClone(profile === 'chlorine' ? chlorine : template);
  const rawOrigin = originOverride ?? config.site.origin;
  let origin: URL;
  try { origin = new URL(rawOrigin); } catch { throw new Error('SITE_URL must be a valid origin URL.'); }
  const localHttp = origin.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname);
  if ((!localHttp && origin.protocol !== 'https:') || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) {
    throw new Error('SITE_URL must be an HTTPS origin, or HTTP localhost, without a path, credentials, query or fragment.');
  }
  config.site.origin = origin.origin;
  if (!/^[a-z0-9_-]+$/i.test(config.terminal.username) || !/^[a-z0-9.-]+$/i.test(config.terminal.hostname)) {
    throw new Error('Terminal username/hostname must use simple shell-safe characters.');
  }
  if (config.giscus && Object.values(config.giscus).some((value) => !value.trim())) {
    throw new Error('Enabled giscus requires complete repository and category settings.');
  }
  return config;
}

// Server/build only. Client islands receive only the values they need as props.
export const siteConfig = getSiteConfig(process.env.SITE_PROFILE, process.env.SITE_URL);
