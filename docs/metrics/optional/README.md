# Git 历史指标（自动生成）

生成命令：node tools/metrics/generate.mjs p2 fd98ffd4902b8c0626b69a5d75f7a29d6c2cb65d docs/metrics/optional

基线代码提交：e2fa573fa72f882e398178bf5c199531fd9810ed

目标代码提交：fd98ffd4902b8c0626b69a5d75f7a29d6c2cb65d

目标生产源码 SHA-256：973b552bd9c32b711b1773dc320190c6548f3df3e4698652ebb16a6f58ac226e

报告提交本身不计入生产源码；对同一基线和最终交付引用重跑时，数值及源码哈希应一致。

Nonempty physical TypeScript lines including comments. CC summed per function: 1 + if/conditional/loops/catch/case/&&/||/??; nested functions counted separately. Production CLI only in kernel/host/plugin; VS Code listed separately. Phase 1 future-plugin implementations classified consistently by responsibility, not claimed to be preexisting plugins. Generated from git objects, not working tree.

| 分类 | 原文件数 | 新文件数 | 原行数 | 新行数 | 行数增量 | 原 CC | 新 CC | CC 增量 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| kernel | 33 | 33 | 785 | 785 | 0 | 309 | 309 | 0 |
| host | 15 | 15 | 394 | 396 | 2 | 194 | 194 | 0 |
| plugin | 58 | 62 | 639 | 729 | 90 | 268 | 309 | 41 |
| vscode | 4 | 4 | 69 | 69 | 0 | 26 | 26 | 0 |

## 目标文件清单与职责

| 文件 | 分类 | 非空行 | CC | 职责 |
|---|---|---:|---:|---|
| extensions/svg-tools/src/SvgFileDecorator.ts | vscode | 15 | 9 | 装配入口或公共导出：SvgFileDecorator |
| extensions/svg-tools/src/SvgOutlineParser.ts | vscode | 25 | 8 | 装配入口或公共导出：OutlineElement, BuildingElement, SvgOutlineParser |
| extensions/svg-tools/src/SvgSymbolProvider.ts | vscode | 17 | 5 | 装配入口或公共导出：SvgSymbolProvider |
| extensions/svg-tools/src/extension.ts | vscode | 12 | 4 | 装配入口或公共导出 |
| packages/core/src/application/AttributeService.ts | kernel | 16 | 7 | 应用事务、历史和查询：AttributeService |
| packages/core/src/application/CommandInvoker.ts | kernel | 19 | 6 | 应用事务、历史和查询：CommandInvoker |
| packages/core/src/application/CommandRegistry.ts | kernel | 18 | 8 | 应用事务、历史和查询：CommandRegistry |
| packages/core/src/application/EditorSession.ts | kernel | 112 | 50 | 应用事务、历史和查询：EditorSession |
| packages/core/src/application/ExtensionRegistry.ts | kernel | 58 | 46 | 应用事务、历史和查询：ExtensionRegistry |
| packages/core/src/application/TreeDecorationService.ts | kernel | 27 | 17 | 应用事务、历史和查询：TreeDecorationService |
| packages/core/src/application/commands/Command.ts | kernel | 10 | 0 | 命令语法与请求转发：CommandResult, Command |
| packages/core/src/application/commands/EditCommand.ts | kernel | 28 | 12 | 命令语法与请求转发：EditCommand |
| packages/core/src/application/history/HistoryEntry.ts | kernel | 4 | 0 | 应用事务、历史和查询：HistoryEntry |
| packages/core/src/application/history/HistoryManager.ts | kernel | 25 | 9 | 应用事务、历史和查询：HistoryManager |
| packages/core/src/application/ports/DocumentCodec.ts | kernel | 4 | 0 | 应用事务、历史和查询：ImportResult, DocumentReader, DocumentWriter |
| packages/core/src/application/ports/DocumentStore.ts | kernel | 4 | 0 | 应用事务、历史和查询：DocumentStore |
| packages/core/src/application/providers/ShapeFactory.ts | kernel | 52 | 24 | 图形创建和输入输出映射：Entry, ShapeFactory |
| packages/core/src/application/providers/ShapeProvider.ts | kernel | 24 | 0 | 图形创建和输入输出映射：SvgElementData, ShapeView, ShapeProvider |
| packages/core/src/application/queries/ShapeQueryService.ts | kernel | 19 | 6 | 应用事务、历史和查询：TreeNode, TreeView, DetailView, ShapeQueryService |
| packages/core/src/contracts/AttributeHandler.ts | kernel | 10 | 0 | 公开扩展契约：AttributeTarget, AttributeEditContext, AttributeHandler |
| packages/core/src/contracts/CommandRegistration.ts | kernel | 9 | 0 | 公开扩展契约：Token, CommandContext, CommandRegistration |
| packages/core/src/contracts/DirectoryReader.ts | kernel | 5 | 0 | 公开扩展契约：DirectoryEntry, DirectoryReader |
| packages/core/src/contracts/DocumentSnapshot.ts | kernel | 8 | 0 | 公开扩展契约：NodeSnapshot, DocumentSnapshot, DocumentEvent, QueryPort |
| packages/core/src/contracts/EditorActions.ts | kernel | 19 | 0 | 公开扩展契约：EditorActions, HistoryPort |
| packages/core/src/contracts/Plugin.ts | kernel | 23 | 0 | 公开扩展契约：ShapeCreation, PluginContext, Plugin, PluginManifest, PluginConstructor |
| packages/core/src/contracts/ShapeAction.ts | kernel | 2 | 0 | 公开扩展契约：ShapeAction, EditFeedback |
| packages/core/src/contracts/TreeDecorator.ts | kernel | 7 | 0 | 公开扩展契约：TreeLine, TreeDecorator |
| packages/core/src/domain/ContainerShape.ts | kernel | 33 | 20 | 领域模型与不变量：ContainerShape |
| packages/core/src/domain/DocumentRoot.ts | kernel | 8 | 3 | 领域模型与不变量：DocumentRoot |
| packages/core/src/domain/Numbers.ts | kernel | 21 | 9 | 领域模型与不变量：Numbers |
| packages/core/src/domain/NumericShape.ts | kernel | 37 | 13 | 领域模型与不变量：NumericShape |
| packages/core/src/domain/Shape.ts | kernel | 22 | 10 | 领域模型与不变量：Shape |
| packages/core/src/domain/ShapeStyle.ts | kernel | 12 | 7 | 领域模型与不变量：ShapeStyle |
| packages/core/src/domain/SvgDocument.ts | kernel | 116 | 61 | 领域模型与不变量：SvgDocument |
| packages/core/src/domain/errors/EditorError.ts | kernel | 3 | 1 | 领域模型与不变量：EditorError |
| packages/core/src/index.ts | kernel | 22 | 0 | 装配入口或公共导出 |
| packages/core/src/internal.ts | kernel | 8 | 0 | 装配入口或公共导出 |
| packages/host/src/EditorRuntime.ts | host | 28 | 6 | 装配入口或公共导出：EditorRuntime |
| packages/host/src/cli/CliApplication.ts | host | 34 | 12 | 终端交互和展示：CliApplication |
| packages/host/src/cli/CommandDispatcher.ts | host | 6 | 2 | 终端交互和展示：CommandDispatcher |
| packages/host/src/cli/ShowFormatter.ts | host | 10 | 8 | 终端交互和展示：ShowFormatter |
| packages/host/src/cli/Tokenizer.ts | host | 33 | 18 | 终端交互和展示：Tokenizer |
| packages/host/src/cli/TreeFormatter.ts | host | 21 | 11 | 终端交互和展示：TreeFormatter |
| packages/host/src/cli/printing/TreePrinter.ts | host | 5 | 0 | 终端交互和展示：TreePrinter |
| packages/host/src/composition/codePlugins.ts | host | 20 | 1 | 装配入口或公共导出 |
| packages/host/src/io/storage/FileDocumentStore.ts | host | 21 | 5 | 文件与 SVG 编解码：FileDocumentStore |
| packages/host/src/io/svg/SvgReader.ts | host | 78 | 40 | 文件与 SVG 编解码：ElementNode, SvgReader |
| packages/host/src/io/svg/SvgWriter.ts | host | 28 | 12 | 文件与 SVG 编解码：SvgWriter |
| packages/host/src/io/svg/XmlEscaper.ts | host | 18 | 14 | 文件与 SVG 编解码：XmlEscaper |
| packages/host/src/loading/PluginInstaller.ts | host | 13 | 6 | 模块解析、注册安装与失败处理：PluginInstaller |
| packages/host/src/loading/PluginLoader.ts | host | 67 | 59 | 模块解析、注册安装与失败处理：ConfigEntry, PluginLoader |
| packages/host/src/main.ts | host | 14 | 0 | 装配入口或公共导出 |
| plugins/builtin-commands/src/BuiltinCommandRegistration.ts | plugin | 6 | 2 | 装配入口或公共导出：BuiltinCommandRegistration |
| plugins/builtin-commands/src/BuiltinCommandsPlugin.ts | plugin | 62 | 33 | 装配入口或公共导出：BuiltinCommandsPlugin |
| plugins/builtin-commands/src/commands/AddToCommand.ts | plugin | 6 | 2 | 命令语法与请求转发：AddToCommand |
| plugins/builtin-commands/src/commands/BackCommand.ts | plugin | 6 | 2 | 命令语法与请求转发：BackCommand |
| plugins/builtin-commands/src/commands/CanvasCommand.ts | plugin | 6 | 2 | 命令语法与请求转发：CanvasCommand |
| plugins/builtin-commands/src/commands/CreateCommand.ts | plugin | 6 | 2 | 命令语法与请求转发：CreateCommand |
| plugins/builtin-commands/src/commands/DeleteCommand.ts | plugin | 6 | 2 | 命令语法与请求转发：DeleteCommand |
| plugins/builtin-commands/src/commands/FrontCommand.ts | plugin | 6 | 2 | 命令语法与请求转发：FrontCommand |
| plugins/builtin-commands/src/commands/GroupCommand.ts | plugin | 6 | 2 | 命令语法与请求转发：GroupCommand |
| plugins/builtin-commands/src/commands/HelpCommand.ts | plugin | 17 | 3 | 命令语法与请求转发：HelpCommand |
| plugins/builtin-commands/src/commands/InitCommand.ts | plugin | 6 | 2 | 命令语法与请求转发：InitCommand |
| plugins/builtin-commands/src/commands/MoveCommand.ts | plugin | 6 | 2 | 命令语法与请求转发：MoveCommand |
| plugins/builtin-commands/src/commands/ReadCommand.ts | plugin | 6 | 2 | 命令语法与请求转发：ReadCommand |
| plugins/builtin-commands/src/commands/RedoCommand.ts | plugin | 7 | 2 | 命令语法与请求转发：RedoCommand |
| plugins/builtin-commands/src/commands/SaveCommand.ts | plugin | 6 | 2 | 命令语法与请求转发：SaveCommand |
| plugins/builtin-commands/src/commands/ScaleCommand.ts | plugin | 6 | 2 | 命令语法与请求转发：ScaleCommand |
| plugins/builtin-commands/src/commands/SetCommand.ts | plugin | 6 | 2 | 命令语法与请求转发：SetCommand |
| plugins/builtin-commands/src/commands/ShowCommand.ts | plugin | 6 | 2 | 命令语法与请求转发：ShowCommand |
| plugins/builtin-commands/src/commands/TreeCommand.ts | plugin | 6 | 2 | 命令语法与请求转发：TreeCommand |
| plugins/builtin-commands/src/commands/UndoCommand.ts | plugin | 7 | 2 | 命令语法与请求转发：UndoCommand |
| plugins/builtin-commands/src/commands/UngroupCommand.ts | plugin | 6 | 2 | 命令语法与请求转发：UngroupCommand |
| plugins/builtin-commands/src/index.ts | plugin | 1 | 0 | 装配入口或公共导出 |
| plugins/builtin-shapes/src/BuiltinShapesPlugin.ts | plugin | 14 | 1 | 装配入口或公共导出：BuiltinShapesPlugin |
| plugins/builtin-shapes/src/index.ts | plugin | 1 | 0 | 装配入口或公共导出 |
| plugins/builtin-shapes/src/providers/CircleProvider.ts | plugin | 11 | 2 | 图形创建和输入输出映射：CircleProvider |
| plugins/builtin-shapes/src/providers/EllipseProvider.ts | plugin | 11 | 2 | 图形创建和输入输出映射：EllipseProvider |
| plugins/builtin-shapes/src/providers/GroupProvider.ts | plugin | 29 | 13 | 图形创建和输入输出映射：GroupProvider |
| plugins/builtin-shapes/src/providers/LineProvider.ts | plugin | 13 | 3 | 图形创建和输入输出映射：LineProvider |
| plugins/builtin-shapes/src/providers/NumericProvider.ts | plugin | 52 | 30 | 图形创建和输入输出映射：NumericProvider |
| plugins/builtin-shapes/src/providers/RectProvider.ts | plugin | 12 | 3 | 图形创建和输入输出映射：RectProvider |
| plugins/builtin-shapes/src/providers/TextProvider.ts | plugin | 14 | 5 | 图形创建和输入输出映射：TextProvider |
| plugins/builtin-shapes/src/shapes/CircleShape.ts | plugin | 12 | 6 | 领域模型与不变量：CircleShape |
| plugins/builtin-shapes/src/shapes/EllipseShape.ts | plugin | 13 | 7 | 领域模型与不变量：EllipseShape |
| plugins/builtin-shapes/src/shapes/GroupShape.ts | plugin | 10 | 3 | 领域模型与不变量：GroupShape |
| plugins/builtin-shapes/src/shapes/LineShape.ts | plugin | 13 | 7 | 领域模型与不变量：LineShape |
| plugins/builtin-shapes/src/shapes/RectShape.ts | plugin | 13 | 7 | 领域模型与不变量：RectShape |
| plugins/builtin-shapes/src/shapes/TextShape.ts | plugin | 18 | 8 | 领域模型与不变量：TextShape |
| plugins/command-dir/src/DirCommand.ts | plugin | 14 | 11 | 命令语法与请求转发：DirCommand |
| plugins/command-dir/src/DirPlugin.ts | plugin | 7 | 2 | 命令语法与请求转发：DirPlugin |
| plugins/command-dir/src/DirRegistration.ts | plugin | 10 | 3 | 命令语法与请求转发：DirRegistration |
| plugins/command-dir/src/NodeDirectoryAdapter.ts | plugin | 11 | 8 | 命令语法与请求转发：NodeDirectoryAdapter |
| plugins/command-dir/src/index.ts | plugin | 1 | 0 | 命令语法与请求转发 |
| plugins/command-stats/src/StatsCommand.ts | plugin | 13 | 6 | 命令语法与请求转发：StatsCommand |
| plugins/command-stats/src/StatsPlugin.ts | plugin | 5 | 1 | 命令语法与请求转发：StatsPlugin |
| plugins/command-stats/src/StatsRegistration.ts | plugin | 9 | 2 | 命令语法与请求转发：StatsRegistration |
| plugins/command-stats/src/index.ts | plugin | 1 | 0 | 命令语法与请求转发 |
| plugins/shape-box/src/BoxFillHandler.ts | plugin | 14 | 6 | 图形创建和输入输出映射：BoxFillHandler |
| plugins/shape-box/src/BoxLabelHandler.ts | plugin | 14 | 6 | 图形创建和输入输出映射：BoxLabelHandler |
| plugins/shape-box/src/BoxPlugin.ts | plugin | 10 | 1 | 图形创建和输入输出映射：BoxPlugin |
| plugins/shape-box/src/BoxProvider.ts | plugin | 37 | 20 | 图形创建和输入输出映射：BoxProvider |
| plugins/shape-box/src/BoxShape.ts | plugin | 18 | 15 | 图形创建和输入输出映射：BoxShape |
| plugins/shape-box/src/index.ts | plugin | 1 | 0 | 图形创建和输入输出映射 |
| plugins/shape-diamond/src/DiamondPlugin.ts | plugin | 5 | 1 | 图形创建和输入输出映射：DiamondPlugin |
| plugins/shape-diamond/src/DiamondProvider.ts | plugin | 43 | 29 | 图形创建和输入输出映射：DiamondProvider |
| plugins/shape-diamond/src/DiamondShape.ts | plugin | 41 | 11 | 图形创建和输入输出映射：Bounds, DiamondShape |
| plugins/shape-diamond/src/index.ts | plugin | 1 | 0 | 图形创建和输入输出映射 |
| plugins/tree-box-label/src/BoxTypeDecorator.ts | plugin | 5 | 3 | 树标签扩展：BoxTypeDecorator |
| plugins/tree-box-label/src/BoxTypePlugin.ts | plugin | 5 | 1 | 树标签扩展：BoxTypePlugin |
| plugins/tree-box-label/src/index.ts | plugin | 1 | 0 | 树标签扩展 |
| plugins/tree-modified/src/ModifiedStarDecorator.ts | plugin | 25 | 11 | 树标签扩展：Fingerprints, ModifiedStarDecorator |
| plugins/tree-modified/src/ModifiedStarPlugin.ts | plugin | 5 | 1 | 树标签扩展：ModifiedStarPlugin |
| plugins/tree-modified/src/index.ts | plugin | 1 | 0 | 树标签扩展 |
