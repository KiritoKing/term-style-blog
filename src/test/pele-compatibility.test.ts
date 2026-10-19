import { readFileSync } from 'node:fs';
import { detectType, render, supports } from 'pele';
import { describe, expect, it } from 'vitest';

const realBlogFlowcharts = JSON.parse(
  readFileSync(new URL('../../tests/fixtures/mermaid/real-blog-flowcharts.json', import.meta.url), 'utf8'),
) as string[];

const compatibilityExamples = [
  {
    name: 'sequence notes, activations, and long tokens',
    type: 'sequence',
    source: `sequenceDiagram
      participant 用户
      participant API
      用户->>API: 请求 supercalifragilisticexpialidocious
      activate API
      Note right of API: 需要保留的中文说明
      API-->>用户: 返回成功
      deactivate API`,
  },
  {
    name: 'class definitions and a C4 keyword used as a label',
    type: 'class',
    source: `classDiagram
      class User {
        +string name
        +login()
      }
      class Isolated
      class C4Context
      User --> C4Context`,
  },
  {
    name: 'state transitions',
    type: 'state',
    source: `stateDiagram-v2
      [*] --> 草稿
      草稿 --> 已发布: 审核通过
      已发布 --> [*]`,
  },
  {
    name: 'entity relations and attributes',
    type: 'er',
    source: `erDiagram
      USER ||--o{ POST : authors
      USER {
        string name
        int id PK
      }`,
  },
  {
    name: 'user journey',
    type: 'journey',
    source: `journey
      title 阅读中文文章
      section 阅读
      打开文章: 5: 用户
      阅读图表: 4: 用户`,
  },
  {
    name: 'gantt schedule',
    type: 'gantt',
    source: `gantt
      title 发布计划
      dateFormat YYYY-MM-DD
      section 开发
      设计: a1, 2026-01-01, 2d
      实现: after a1, 3d`,
  },
  {
    name: 'pie chart',
    type: 'pie',
    source: `pie showData
      title 工作分布
      "研究": 40
      "开发": 60`,
  },
  {
    name: 'mindmap',
    type: 'mindmap',
    source: `mindmap
      root((认知劳动))
        研究
        开发
        规划`,
  },
  {
    name: 'xy chart with Chinese axes',
    type: 'xychart',
    source: `xychart-beta
      title "每月任务"
      x-axis ["一月", "二月", "三月"]
      y-axis "任务数" 0 --> 10
      line [3, 6, 9]`,
  },
];

describe('Pele Mermaid compatibility', () => {
  it('renders every flowchart from the public blog article fixture with Chinese labels', () => {
    expect(realBlogFlowcharts).toHaveLength(4);

    for (const source of realBlogFlowcharts) {
      expect(detectType(source)).toBe('flowchart');
      expect(supports(source)).toBe(true);

      const diagram = render(source, { fontFamily: 'monospace', autoDirection: false, images: false });

      expect(diagram.type).toBe('flowchart');
      expect(diagram.svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(diagram.width).toBeGreaterThan(0);
      expect(diagram.height).toBeGreaterThan(0);
    }
  });

  it.each(compatibilityExamples)('renders $name', ({ source, type }) => {
    expect(detectType(source)).toBe(type);
    expect(supports(source)).toBe(true);

    const diagram = render(source, { fontFamily: 'monospace', images: false });

    expect(diagram.type).toBe(type);
    expect(diagram.svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(diagram.width).toBeGreaterThan(0);
    expect(diagram.height).toBeGreaterThan(0);
  });

  it('preserves safe external links and blocks javascript URLs and SVG script injection', () => {
    const linked = render(
      `flowchart LR
        A[Safe link] --> B[Done]
        click A "https://example.com"`,
      { images: false },
    );
    expect(linked.links).toEqual([{ id: 'A', href: 'https://example.com/', internal: false }]);
    expect(linked.svg).toContain('https://example.com/');

    const unsafe = render(
      `flowchart LR
        A[Open] --> B[Done]
        click A "javascript:alert(1)"`,
      { images: false },
    );
    expect(unsafe.svg).not.toMatch(/javascript:|<script|onload=/i);
  });

  it('detects flowcharts before C4-like words in ordinary labels', () => {
    const source = `flowchart LR
      A["C4Context is regular label text"] --> B["C4 is not the chart type"]`;

    expect(detectType(source)).toBe('flowchart');
    expect(render(source).type).toBe('flowchart');
  });
});
