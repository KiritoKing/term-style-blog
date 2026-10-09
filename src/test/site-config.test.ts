import { describe, expect, it } from 'vitest';
import { getSiteConfig } from '../../site.config';

describe('reusable theme configuration', () => {
  it('boots a neutral template with comments and inherited redirects disabled', () => {
    const config = getSiteConfig();
    expect(config.site.author).toBe('Demo Author');
    expect(config.site.origin).toBe('https://example.com');
    expect(config.terminal).toEqual({ username: 'guest', hostname: 'blog' });
    expect(config.giscus).toBeNull();
    expect(config.redirectsFile).toBeNull();
    expect(JSON.stringify(config)).not.toMatch(/chlorine|KiritoKing|notion-astro-rev/i);
  });
  it('preserves the existing owner profile and exact Discussions mapping', () => {
    const config = getSiteConfig('chlorine');
    expect(config.site).toMatchObject({ origin: 'https://chlorinec.top', title: "ChlorineC's Blog", author: 'ChlorineC', language: 'zh-CN', github: 'https://github.com/KiritoKing' });
    expect(config.site.license.name).toBe('CC BY-NC-SA 4.0');
    expect(config.terminal).toEqual({ username: 'chlorinec', hostname: 'blog' });
    expect(config.giscus).toEqual({ repo: 'KiritoKing/notion-astro-rev', repoId: 'R_kgDONmCW3w', category: 'Announcements', categoryId: 'DIC_kwDONmCW384CpTzw', lang: 'zh-CN' });
    expect(config.redirectsFile).toBe('./scripts/historical-url-map.json');
    expect(config.about.paragraphs[0]).toBe('这里是 ChlorineC 随便写写的地方。');
    expect(config.network[0].href).toBe('https://github.com/KiritoKing');
  });
  it('overrides origin without mutating the owner profile', () => {
    expect(getSiteConfig('chlorine', 'https://demo.example.org/').site.origin).toBe('https://demo.example.org');
    expect(getSiteConfig('chlorine').site.origin).toBe('https://chlorinec.top');
    expect(getSiteConfig('template', 'http://localhost:4321').site.origin).toBe('http://localhost:4321');
  });
  it('rejects unknown profiles', () => {
    expect(() => getSiteConfig('production')).toThrow(/SITE_PROFILE/);
  });
  it.each(['javascript:alert(1)', 'https://user:password@example.com', 'https://example.com/path', 'https://example.com?q=1', 'https://example.com/#hash', 'http://example.com'])('rejects a non-origin or insecure remote URL %s', (origin) => {
    expect(() => getSiteConfig('template', origin)).toThrow(/SITE_URL/);
  });
});
