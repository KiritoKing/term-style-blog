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

  it('maps renamed historical articles to their current publication slugs', () => {
    const rules = compileRedirectRules(map);
    expect(rules.find(rule => rule.from === '/20岁随笔')?.to).toBe('/posts/birthday-20th');
    expect(rules.find(rule => rule.from === '/评好逸恶劳大学生')?.to)
      .toBe('/posts/评-不能继续助长部分中国大学生的好逸恶劳思潮');
  });

  it('normalizes inherited aliases to leading-slash paths', () => {
    const rules = compileRedirectRules({ slug: ['2024/01/01/Tech/slug'] });
    expect(rules).toEqual([{ from: '/2024/01/01/Tech/slug', to: '/posts/slug', status: 301 }]);
  });
});

