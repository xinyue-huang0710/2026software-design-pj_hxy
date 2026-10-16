# 架构图源文件与预览

当前图表为 `architecture.puml`（分层组件图）、`command-pattern.puml`（Command 类图）、`shape-providers.puml`（Shape 行为多态、Provider 与受检工厂边界，非 GoF Adapter 模式）。原 `shape-adapters.*` 已更名为 `shape-providers.*`，请打开新文件。`visitor-pattern.puml` 是已弃用的历史讨论方案，图中已注明，不作为实现依据。对应 PNG 和 SVG 均由 PlantUML 实际导出，`plan.md` 直接引用本地 PNG，因此查看计划不需要安装 PlantUML 插件或联网。

## 为什么原来显示错误

截图中的 `plantuml.jar file not found: ""` 表示 Markdown Preview Enhanced 没有配置可用的 PlantUML jar 路径。当前机器已有 Java，本项目已在 `.vscode/settings.json` 中配置项目内 jar 的绝对路径。刷新 Markdown 预览；如果插件未重新加载配置，可执行 VS Code 的 Reload Window。

正文现在使用静态图片，不受插件即时渲染配置影响；修改源图后需要重新导出。

## 重新导出

在项目根目录用 PowerShell 执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\render-diagrams.ps1
```

该脚本只导出本目录 `.puml` 对应的 PNG/SVG，不修改系统执行策略；`-ExecutionPolicy Bypass` 仅用于这次脚本进程。脚本通过 Java 的无界面模式运行，图中选用 Smetana 布局引擎，无需额外安装 Graphviz。

## 换电脑后的准备

PNG/SVG 随项目提交即可直接看图。只有重新生成或使用 PlantUML 代码块即时预览时才需要以下配置：

1. 安装可运行本 jar 的 Java，并确保 `java` 命令可用；当前已用本机 Java 21 配置此流程。
2. 下载固定版本 PlantUML 1.2025.4 到 `tools/plantuml/plantuml.jar`（该二进制已在 `.gitignore` 中排除）。此版本用于可重复生成，不表示最新版本。
3. 如使用 Markdown Preview Enhanced 的 PlantUML 代码块，将工作区设置中的 `markdown-preview-enhanced.plantumlJarPath` 改成新机器上的绝对路径。普通图片预览无需改此设置。

[官方发布的 jar](https://github.com/plantuml/plantuml/releases/download/v1.2025.4/plantuml-1.2025.4.jar)；[官方命令行文档](https://plantuml.com/command-line)；[官方 Smetana/Graphviz 说明](https://plantuml.com/graphviz-dot)。

可在项目根目录下载：

```powershell
New-Item -ItemType Directory -Path tools/plantuml -Force
Invoke-WebRequest -Uri 'https://github.com/plantuml/plantuml/releases/download/v1.2025.4/plantuml-1.2025.4.jar' -OutFile 'tools/plantuml/plantuml.jar'
```

不要手动编辑导出的 SVG 或 PNG 来改变架构；修改 `.puml`，再运行导出脚本，以保证图片与源文件一致。迁入最终 `doc/README.md` 时，将图片链接改成相对该文件的 `diagrams/architecture.png` 等路径。
