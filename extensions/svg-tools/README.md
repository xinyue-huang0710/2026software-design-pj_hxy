# PJ1 SVG Tools

为 Explorer 中的 SVG 文件增加 [] 标记，并为 SVG 文本提供原生 Outline。大纲显示根、分组及叶子；有 id 时显示 tag#id，点击跳转源码。无效 XML 暂时清空，修复后恢复。不改名、不改文件内容，不做完整 SVG 校验。

## 开发运行

在仓库根执行 npm ci、npm run extension:build。然后运行：

~~~powershell
code --new-window --extensionDevelopmentPath="$PWD/extensions/svg-tools" "$PWD/extensions/svg-tools/examples"
~~~

在新窗口打开 example.svg，展开 Explorer 底部 Outline，点击 rect#start，应定位第 3 行。notes.txt 与 folder.svg 目录没有标记。可在文本中增删节点查看更新。

npm run extension:check 运行类型检查及解析单测；npm run extension:test 运行真正的 VS Code Extension Host 测试。默认复用本机标准安装路径的 VS Code；也可设置 VSCODE_EXECUTABLE，其他环境使用官方 test-electron 下载稳定版本。

## 职责与复用

VS Code 管理窗口、文件列表、原生大纲和调用时机；扩展向宿主注册 FileDecorationProvider 与 DocumentSymbolProvider，提供附加信息和带源码位置的符号。注册返回的 Disposable 由 ExtensionContext 管理。

文件装饰是宿主侧显示附加信息的扩展机制，不是把相同 Component 接口逐层包裹的严格 GoF Decorator。SvgSymbolProvider 将内部 XML 语法树适配为 VS Code 的 DocumentSymbol，是接口转换；不要仅凭 API 名称宣称某种模式。

沿用 Phase 1 使用的 saxes XML 解析库和栈遍历方法；没有直接复用业务 SvgReader/Shape，因为它们限制 SVG 类型、校验几何、补 id 且没有源码位置。大纲语法节点只读源文本，不参与编辑器领域事务。

实际基线与自动集成证据见仓库 doc/validation/vscode-baseline.json、vscode-integration.json。界面截图待实际采集，自动测试不等同于截图验收。
