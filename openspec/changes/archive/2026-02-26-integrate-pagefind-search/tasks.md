## 1. 索引与依赖准备

- [x] 1.1 在 package.json 中加入 pagefind devDependency，并补充构建后索引脚本
- [x] 1.2 校验构建产物包含 dist/pagefind 目录与索引资源

## 2. 搜索页面与 UI

- [x] 2.1 新增 /search 页面并挂载 Pagefind UI 初始化代码
- [x] 2.2 为搜索页面补充终端风格样式，覆盖 Pagefind UI 视觉

## 3. 终端命令联动

- [x] 3.1 扩展终端命令集合，新增 grep 命令并输出提示
- [x] 3.2 grep 命令触发导航至 /search?q=<query>
