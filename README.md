# Terminal Blog

[English](README.en.md) · [安装与配置](docs/getting-started.md) · [贡献指南](CONTRIBUTING.md) · [MIT](LICENSE)

[![CI](https://github.com/KiritoKing/term-style-blog/actions/workflows/ci.yml/badge.svg)](https://github.com/KiritoKing/term-style-blog/actions/workflows/ci.yml)

可复用的终端风格 Astro 博客主题，使用 **Astro 7、React 19、TypeScript 和 Tailwind CSS 4**。默认采用中性身份与合成示例文章；作者信息、终端用户名、About、Network、评论和跳转集中在 [`site.config.ts`](site.config.ts)。默认关闭评论，不继承原作者的历史 URL。

[免登录公开 demo](https://public-demo.term-style-blog-demo.pages.dev/) · [正文图片演示](https://public-demo.term-style-blog-demo.pages.dev/posts/image-lightbox-demo/)。专用 Pages 项目只托管中性合成内容；既有个人博客与 Access 配置独立保留。

![中性示例首页，深色主题](docs/images/terminal-blog.png)

## 功能

- `help`、`ls`、`cd`、`cat`、`grep` 等终端导航，也支持普通链接。
- 深浅主题、阅读模式、移动布局、文章目录、代码高亮和 Mermaid。
- 原生 dialog 正文图片查看器：键盘关闭、放大缩小、拖动和适配视图。
- Pagefind 搜索、分类、标签、归档、分页、RSS、sitemap 和 SEO。
- 类型化身份/About/Network 配置，可选 Giscus 与历史跳转。
- Markdown / Obsidian 风格内容及严格发布校验，无需 CMS 账号。

## 启动

使用 **Node.js 22.12+ 或 24**、**pnpm 10.28.0**。本地不需要 vault、Notion、Cloudflare 或密钥。

```sh
git clone https://github.com/KiritoKing/term-style-blog.git
cd term-style-blog
corepack enable
corepack prepare pnpm@10.28.0 --activate
pnpm install --frozen-lockfile
pnpm dev
```

打开 Astro 输出的地址，通常为 `http://localhost:4321`。没有 Corepack 时可使用已安装的 pnpm 10.28.0。

编辑 `site.config.ts` 的 `template`，替换 `src/content/blog/` 示例与 favicon。可配置 origin、作者公开链接、内容许可、终端身份及可选评论、远程图片和跳转表。`chlorine` profile 保留原作者设置，由其受保护发布 workflow 显式选择。

```sh
pnpm test
pnpm test:deployment
pnpm check
pnpm build
pnpm preview
```

搜索需要构建生成的 Pagefind 索引。浏览器测试用 Chromium，安装与命令见[贡献指南](CONTRIBUTING.md)。

## 内容与部署

文章格式见[内容约定](docs/content.md)。可通过 `CONTENT_DIR` 指定只包含准出 Markdown 的目录，不要把整个 vault 指向它。静态产物在 `dist/`；正式公开站点显式设置 `SITE_URL` 与 `PUBLIC_DEPLOYMENT_ENV=production`，预览使用 `preview` 并输出 noindex。详细命令见[安装与静态托管](docs/getting-started.md)。

原作者的不可变快照发布链仍限定在其仓库的 main；主题使用者不需要这套私人基础设施，也不应简单删除权限门禁。[原作者发布链](docs/publication-pipeline.md)。

## 演示与许可

截图仅含合成内容：[文章浅色](docs/images/article-light.png)、[移动深色](docs/images/mobile-dark.png)、[图片查看器浅色](docs/images/viewer-light.png)。[Astro Themes 投稿材料](docs/astro-theme-submission.md)说明当前 Portal 流程；受 Access 保护的验收预览不能当作免登录公开 demo。

原创代码、文档、示例文章与合成图片使用 [MIT](LICENSE)，保留原版权和第三方声明。[NOTICE](NOTICE.md)说明素材边界；真实文章遵循独立内容许可，源码许可不延伸到个人身份、商标或外部媒体。[贡献指南](CONTRIBUTING.md) · [安全报告](SECURITY.md)。

归档规格与 `.agent` 保留开发历史，旧 Notion 方案不是当前内容源。
