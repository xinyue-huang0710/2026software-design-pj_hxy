# 可替换的树形打印

tree 命令通过 ShapeQueryService 构建脱离可变领域对象的 TreeView，再由 CLI 注入的 TreePrinter 输出。查询结果保留节点 label、结构化 properties/styles、默认 inline 摘要与 children；新打印器可以使用结构化字段，不必解析旧打印器的字符串。

## 当前流程

```text
TreeCommand → EditorSession → ShapeQueryService → TreeView
CliApplication → TreePrinter.format(TreeView) → 文本行
                    ↑
              TreeFormatter（当前默认）
```

默认 TreeFormatter 深度优先遍历。每组兄弟节点按 children 原顺序输出：非最后节点用 `├──`，最后节点用 `└──`；递归前给前缀追加 `│   ` 或四个空格。完整 tree 打印画布标题，tree id 以该节点为无树线根。显示名和几何摘要来自外层 ShapeProvider，不在领域层拼接。

## 如何替换

在 main.ts 的装配处传入符合 TreePrinter 的对象：

```ts
const cli = new CliApplication(dispatcher, invoker, new TreeFormatter());
```

未来新增 ASCII、JSON 或其他形式的文本打印器，只需实现接口并修改装配；不用修改 TreeCommand、Session、Shape 或 CliApplication。当前没有新增命令、按名称的打印器分发表或动态插件扫描。

## 与 Adapter / Adaptee 的对应

接口可替换本身是依赖注入，不自动构成 Adapter。当接入的已有库使用不同 API 时：

| 角色 | 对应 |
| --- | --- |
| Client | CliApplication |
| Target | TreePrinter.format(TreeView) |
| Adapter | 实现 TreePrinter，把 TreeView 转换为库的数据，再转换库的输出 |
| Adaptee | 现成的树打印库，其 API 不必认识 TreeView |

tests/support/OutlineLibrary 是模拟已有库，仅接受 title/descendants 并返回整段字符串。OutlineTreeAdapter 把 TreeView 转换为该输入，调用库的 draw，再转换为输出行。测试把 Adapter 注入原 CLI，验证全文树、子树、空容器、重复打印、show 不受影响及文档/历史不变。这两个类仅用于契约验证，没有提前引入第三方运行依赖。

测试曾真实失败：CLI 忽略传入组件，仍输出默认树线；改为接口注入后通过。默认作业格式仍由原 TreeFormatter 测试保护。

![树打印扩展结构](diagrams/tree-printing.png)

[PlantUML 源文件](diagrams/tree-printing.puml)。这里的 Adapter 是树打印接入示例，与 ShapeProvider 的名称和职责无关。
