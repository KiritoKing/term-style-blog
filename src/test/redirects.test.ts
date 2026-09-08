import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { compileRedirectRules, type HistoricalUrlMap } from '@/lib/redirects';

const mapPath = fileURLToPath(
  new URL('../../scripts/historical-url-map.json', import.meta.url),
);
const map = JSON.parse(readFileSync(mapPath, 'utf8')) as HistoricalUrlMap;

describe('historical redirects', () => {
  it('retains all 162 inherited aliases as permanent redirects', () => {
    const rules = compileRedirectRules(map);
    expect(rules).toHaveLength(162);
    expect(new Set(rules.map((rule) => rule.from)).size).toBe(162);
    expect(rules.every((rule) => rule.status === 301)).toBe(true);
  });

  it('preserves exact canonical slug case', () => {
    const keepass = compileRedirectRules(map).filter((rule) => rule.to === '/posts/KeePass');
    expect(keepass).toHaveLength(4);
    expect(keepass.some((rule) => rule.from === '/post/technology/keepass')).toBe(true);
  });

  it('normalizes inherited aliases to leading-slash paths', () => {
    const rules = compileRedirectRules({ slug: ['2024/01/01/Tech/slug'] });
    expect(rules).toEqual([{ from: '/2024/01/01/Tech/slug', to: '/posts/slug', status: 301 }]);
  });
});

