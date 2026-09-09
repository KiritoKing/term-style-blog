# Contributing / 参与贡献

欢迎通过 Issue 和 Pull Request 改善这个个人博客。中文或英文都可以。适合的贡献包括可复现的渲染错误、键盘与移动端体验、内容校验、测试和文档修正。大型功能先开 Issue 讨论；项目不承诺扩展为通用 CMS。

## 本地验证

使用 Node.js 22 或 24、pnpm 10.28.0。默认示例内容不需要任何服务凭据：

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm test:deployment
pnpm check
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
git diff --check
```

Linux CI 使用 `pnpm exec playwright install --with-deps chromium` 安装系统依赖。浏览器测试使用端口 4321，运行前请关闭占用它的本地服务。

## 提交修改

1. 从 `main` 创建分支，保持 PR 聚焦一个问题。
2. 先阅读相关 `openspec/specs/`。行为变更补充规格和有意义的回归测试；文档修正无需编写镜像测试。
3. 使用严格 TypeScript；Astro 负责静态页面，React 用于必要的交互。保持现有终端风格。
4. 描述触发问题的场景、修改效果和验证结果；视觉变更附桌面及手机截图。
5. 不提交 `.env`、API token、私钥、个人 vault、草稿、构建产物或含私人数据的测试报告。

PR CI 只读取仓库中的演示内容，不使用生产部署密钥。维护者可能要求进一步缩小范围；提交 PR 不意味着会自动合并或部署。

你提交的原创贡献按本仓库 MIT 许可提供。引入第三方文件时保留其原始许可与版权声明。讨论和评审遵守 [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md)。漏洞通过 [SECURITY](SECURITY.md) 私密报告。

## English

Focused fixes and documentation improvements are welcome. Discuss substantial changes before implementation. Follow the commands above using the bundled Markdown collection, include a regression test for behavioral fixes, and preserve the terminal design. Never include private content or credentials. Contributions are provided under the repository's MIT license; retain third-party notices. Use the private security-reporting channel for vulnerabilities.
