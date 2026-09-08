# 全量博客视觉验收

此命令会向配置的 Midscene 模型服务发送真实博客页面截图。仅在当前批次的截图发送范围获得授权后运行；不要把未准出的 vault 页面放入该构建。

从生产构建产物枚举所有 HTML，跳过重定向占位页，对每个渲染页面以 1440×1000 和 390×844 检查。逐屏滚动覆盖整个阅读区域，并补充富文本元素附近的截图。独立记录 AI 断言、浏览器异常、破图、容器越界和局部滚动可达性；首屏还要求标题首尾完整可见。

需要 Node.js、Chrome 和 @midscene/web 1.12.3（可使用包含该版本的 @midscene/cli 1.12.3 安装目录）。通过 MIDSCENE_RUNTIME_DIR 指向安装根目录；不把模型凭据写入仓库。MIDSCENE_MODEL_* 按所用模型提供商配置在进程环境中。

```bash
MIDSCENE_RUNTIME_DIR=/path/to/midscene-runtime \
AUDIT_DIST=/path/to/frozen/dist \
AUDIT_ORIGIN=http://127.0.0.1:4324 \
AUDIT_OUTPUT=/path/to/private-audit-output \
AUDIT_CONCURRENCY=6 \
node scripts/visual-audit/sweep.mjs
```

默认浅色；AUDIT_THEME=dark 可检查深色。AUDIT_FILTER 是路径子串；AUDIT_ROUTES 是逗号分隔的完整路由，两者仅用于定位和修复后复测，不能单独声称全站覆盖。完整遍历后若只修复局部行为，可保留原全站证据，并附代码影响范围证明、所有受影响页面的复测及最终全站几何检查。AUDIT_GEOMETRY_ONLY=1 跳过模型调用，报告明确标为 geometry-only，不能算作视觉断言通过。失败/未完成时退出 1；summary.json 保存完整清单与截图位置。模型可能误判内嵌图片或正常滚动边缘：保留原失败，另写证据分类，不可把失败静默改成通过。重定向还需 HTTP 遍历检查，不能将跳过占位页等同于重定向已验证。

验收报告必须绑定冻结构建的代码版本/工作树指纹、内容指纹、页面清单、所有失败的处理方式。截图与模型报告默认不提交 Git。

```bash
AUDIT_DIST=/path/to/frozen/dist \
AUDIT_ORIGIN=http://127.0.0.1:4324 \
AUDIT_OUTPUT=/path/to/private-audit-output \
node scripts/visual-audit/redirects.mjs
```

明确在源 CMS 中撤回的内容，可通过 `AUDIT_RETIRED_TARGETS=/posts/retired-slug` 声明本批预期 404。该结果单独标记 `retired-404`，不得把未知坏链加入列表来掩盖错误；报告需保留撤回依据。
