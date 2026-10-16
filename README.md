# 2026-pj_hxy — SVG CLI Editor (Phase 1)

TypeScript 面向对象 SVG 编辑器。实现六种图形、19 种命令、嵌套分组、撤销重做和 SVG 读写。

## 运行

需要 Node.js 22 或更新版本（本机验证为 Node.js 24.14.0）。

```sh
npm ci
npm run cli
```

在 `svg>` 后输入 `help`。Windows PowerShell 若拦截 `npm.ps1`，使用 `npm.cmd`。

```text
init 400 200
create g scene
create rect r 20 40 100 60 #4a90d9 in scene
create text label 40 75 "你好 SVG" in scene
move scene 10 0
undo
tree
save examples/my-drawing.svg
```

SVG 可直接拖入浏览器。退出交互模式使用 Ctrl+C；脚本模式读到 EOF 后退出。

## 验证与示例

```sh
npm run check
node tools/replay.mjs
```

第一条运行严格类型检查、行为测试和构建；第二条重新回放作业两组样例，覆盖 `examples/demo.svg`、`examples/flowchart.svg` 和 `doc/validation/*-output.txt`。

也可运行已构建入口 `node dist/main.js`。在支持重定向的 shell 中，`node dist/main.js < examples/flowchart.txt` 可直接回放脚本。PowerShell 可使用：

```powershell
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
Get-Content -Encoding UTF8 examples/flowchart.txt | npm.cmd run cli
```

- [作业提交文档：架构、过程、自查、质量保证](doc/README.md)
- [可替换树打印与 Adapter/Adaptee 对应](doc/tree-printing.md)
- [经审查的设计计划](plan.md)
- [实际开发与测试记录](doc/development-log.md)
- [浏览器预览](doc/validation/flowchart-browser.png)

本阶段仅支持规定的 SVG 子集，不支持任意 SVG/CSS/transform。生产仅注册 rect / circle / ellipse / line / text / g；box 与动态插件加载留给后续阶段。
