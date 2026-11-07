# PJ1 SVG Tools

为 Explorer 中的 SVG 文件增加 [] 标记，为 SVG 文本提供原生大纲。包含根、分组与叶子，有 id 时显示 tag#id；点击跳转源码。无效 XML 暂时清空，修复后恢复。不改名、不修改内容，不做完整 SVG 规范校验。

## 启动

在仓库根执行 npm ci，然后用 VS Code 打开仓库目录。选择调试配置 PJ1 SVG Tools，通过“运行 → 启动调试”启动（F5，若触发音量则 Fn+F5）。调试配置先运行扩展构建任务，再打开扩展开发宿主。

也可先执行 npm run extension:build，再从终端运行：

~~~powershell
code --new-window --extensionDevelopmentPath="$PWD/extensions/svg-tools" "$PWD/extensions/svg-tools/examples"
~~~

打开 example.svg。若进入图片预览，右键编辑器标签页 → “重新打开编辑器的方式…” → “文本编辑器”。展开资源管理器左下角、时间线上方的“大纲”。点击 rect#start 应定位第 3 行；修改 id 后大纲更新。notes.txt 与 folder.svg 目录没有 [] 标记。临时编辑后撤销恢复即可。

无需发布到市场或装进日常配置。运行时需要 VS Code 提供的 vscode 模块，不能用普通 node 直接执行扩展入口。

## 测试与真实界面证据

npm run extension:check 运行类型检查及两项解析测试；npm run extension:test 通过官方 test-electron 运行真实 VS Code Extension Host，包含 11 个命名检查。默认复用本机标准安装路径；其他路径可设置 VSCODE_EXECUTABLE，否则下载稳定版本。

用户已在真实开发宿主确认文件标记、层级、源码点击定位及 start → test → start 实时更新。[人工记录与截图](../../doc/validation/vscode-manual.md)；[接口测试结果](../../doc/validation/vscode-integration.json)；[实现前基线](../../doc/validation/vscode-baseline.json)。异常 XML 的清空和恢复由自动测试验证。

## 职责、模式与复用

VS Code 管理文件列表、原生大纲及调用时机；扩展注册 FileDecorationProvider 和 DocumentSymbolProvider，提供附加信息和源位置。Disposable 由 ExtensionContext 管理。

文件装饰具有装饰效果，但不是同一 Component 接口逐层包装的严格 GoF Decorator。SvgSymbolProvider 将解析树适配成 VS Code DocumentSymbol，体现接口转换。完整分析见 [Phase 2 报告](../../doc/README.md)。

复用 Phase 1 的 saxes XML 库与栈遍历思路；不直接复用业务 SvgReader/Shape，后者限制图形类型、校验几何、补 id 且不保存源位置。大纲只读语法节点不参与领域编辑事务。
