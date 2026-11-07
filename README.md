# SVG CLI Editor — PJ1 Phase 2

TypeScript SVG 编辑器：保留 Phase 1 的六种图形、19 条命令、分组、撤销重做和 SVG 读写；Phase 2 增加插件内核、stats/dir、box、树标签及 VS Code SVG 标记/大纲扩展。

## 运行

需要 Node.js >=22。在仓库根执行：

~~~sh
npm ci
npm run build
npm run cli
~~~

在 svg> 后输入 help。Windows PowerShell 若拦截 npm.ps1，使用 npm.cmd。

~~~text
dir
init
create box n1 120 100 160 60 "开始"
set n1 fill #f5a623
set n1 label "处理数据"
tree
stats
undo
save examples/my-box.svg
~~~

默认使用代码装配。配置装配：npm run cli -- --config plugins.config.json；只用 Phase 1 默认能力：npm run cli -- --builtin-only。编译入口：node packages/host/dist/main.js。退出用 Ctrl+C，脚本输入 EOF 后退出。

## VS Code 扩展

VS Code 打开仓库，选择调试配置 PJ1 SVG Tools，点击“运行 → 启动调试”（F5 或 Fn+F5），会先构建扩展再打开开发宿主。SVG 若显示为图片，右键标签页选择“重新打开编辑器的方式 → 文本编辑器”，展开左下角“大纲”。

[扩展说明](extensions/svg-tools/README.md) · [人工验证](doc/validation/vscode-manual.md)

## 验证与文档

~~~sh
npm run check
npm run extension:test
node tools/replay-phase2.mjs
node tools/verify-plugin-diffs.mjs
~~~

- [Phase 2 完整报告、扩展点清单、ADR 与 AI 交互记录](doc/README.md)
- [自动源码指标与文件职责清单](docs/metrics/README.md)
- [Phase 2 开发计划](plan-phase2.md)
- [Phase 1 报告归档](doc/phase1-README.md)
- [树排版接口与 Adapter 对应](doc/tree-printing.md)

保留 final；本阶段最终交付标签为 p2。两条 box 接入证明分支为 phase2/box-code、phase2/box-config。仅支持作业规定的 SVG 子集，不是完整浏览器 SVG/CSS/transform 引擎。
