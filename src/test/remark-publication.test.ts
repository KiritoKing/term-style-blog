import { describe, expect, it } from 'vitest';
import { remarkPublicationAssets } from '@/lib/remark-obsidian-wikilinks.mjs';

describe('publication image rendering', () => {
  it('renders public remote images without a build-time asset request', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'image',
              url: 'https://img.chlorinec.top/post/image.png',
              alt: '示例图',
              title: null,
            },
          ],
        },
      ],
    };

    remarkPublicationAssets()(tree);

    expect(tree.children[0].children[0]).toEqual({
      type: 'html',
      value:
        '<img src="https://img.chlorinec.top/post/image.png" alt="示例图" loading="lazy" decoding="async">',
    });
  });

  it('does not expose a local image path in preview HTML', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'image', url: '../private.png', alt: '私有图', title: null }],
        },
      ],
    };

    remarkPublicationAssets()(tree);

    expect(tree.children[0].children[0]).toEqual({
      type: 'text',
      value: '[图片待迁移：私有图]',
    });
  });
});
