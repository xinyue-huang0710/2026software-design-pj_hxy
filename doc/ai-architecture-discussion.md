# 人工与 AI 的架构讨论摘要

本文依据本项目已有对话、plan.md 的修订记录与开发日志整理，作为过程记录的补充。引号内为用户原话摘录；AI 分析和最终取舍是归纳，不是逐字聊天转录。前期架构讨论发生在 Phase 1，Phase 2 延续并验证这些设计；不将前期讨论改写成第二阶段新发生的对话。

作业依据：Phase 1 §1.2 要求记录有代表性的讨论、发现的问题及确认和纠正过程；Phase 2“学习目标与任务安排”明确沿用 AI 协作要求。原有提交报告已包含过程记录，本文件在 p2 建立后补充整理，未修改既有标签。

## 1. Command 模式不能只有类名对应

**用户提出：**“你plan的架构设计有没有分层模块呀……你的plan设计有符合这个架构吗，角色是咋对应的”。

**审查的问题：** 初稿虽有目录和命令对象，但构造、调用与业务执行的职责没有清楚对应课程 PPT；原 Dispatcher 同时承担构造和调用，容易混淆 Client 与 Invoker。

**方案修订：** 单独设置 CommandInvoker；命令调度负责解析和构造，调用者负责执行与历史协调，具体命令将业务请求转交稳定的 EditorSession。命令记录 id，执行时定位当前文档，避免 undo/read 替换文档后继续引用失效的旧节点。

**当前落地：** Phase 2 用 CommandRegistration/CommandRegistry 扩展命令构造规则，CommandInvoker 仍通过 Command 接口调用，插件通过 EditorActions 访问接收者。增加 stats/dir 不要求在内核添加命令名称分支。

**依据：** [plan.md §11.1](../plan.md#111-本次架构修订记录)、[CommandInvoker](../packages/core/src/application/CommandInvoker.ts)、[CommandRegistration](../packages/core/src/contracts/CommandRegistration.ts)。

## 2. Visitor 的类型扩展成本是否值得

**用户提出：**“这个visitor设计我怎么感觉有点怪怪的，怎么这么复杂”；随后追问新增图形是否要改很多地方，并要求认真考虑后续扩展，避免 Phase 2 大修架构。

**讨论的重点：** 经典 Visitor 把操作集中到访问者，但接口通常枚举具体元素类型。新增操作比较方便；新增一种图形则可能需要调整 Visitor 接口及多个访问者。不能只因为课程讲了某种模式，就忽略本项目更可能变化的是图形类型。

**方案修订：** 方案曾补充过完整 Visitor 结构，后经审查改为外部 ShapeProvider 加注册工厂。每种图形的创建、读回、展示映射和 SVG 映射集中在对应 Provider；几何行为仍在图形类中。旧 Visitor 图保留为历史方案，不作为当前实现结构。

**取舍：** 优先降低新增图形类型的改动范围。新增完全不同的输出需求仍可能要求补充 Provider 协议，不能宣称所有变化都零成本。

**Phase 2 验证：** box 在框架准备完成后通过新增插件接入，A/B 接入提交不修改内核或既有插件。这是对前期变化点判断的实际检验，而非仅凭类图声称符合 OCP。

**依据：** [plan.md §4.5](../plan.md)、[双装配差异证据](validation/plugin-diff-proof.json)。

## 3. tree/show 不能让领域对象关心格式

**用户提出：**“那tree和show呢”；随后明确：“不希望领域层关心展示格式”。

**讨论的重点：** 如果为简化 Visitor，直接在 Shape 中增加负责树线、缩进、CLI 文案或 XML 拼接的方法，虽然调用方便，却把展示规则带进了领域层。

**方案修订：** Shape 保留几何、样式和结构不变量；Provider.inspect 提供类型相关的只读展示数据；ShapeQueryService 构造 TreeView/DetailView；宿主的 TreeFormatter/ShowFormatter 完成输出。SVG 的类型映射也在外部 Provider，而非领域类自行输出 XML。

**Phase 2 延续：** 树标签插件读取公开快照，返回行尾标签。星号状态封装在装饰器实例中，Shape 不知道是否要打印星号或“(box)”。

**依据：** [ShapeProvider](../packages/core/src/application/providers/ShapeProvider.ts)、[ShapeQueryService](../packages/core/src/application/queries/ShapeQueryService.ts)、[树标签 ADR](adr/003-tree-dirty.md)。

## 4. 多态应统一契约，而不是强行统一算法

**用户提出：**“多态？？？请评估多态是否合适，不同shape的方法操作应该差挺多的”。

**讨论的重点：** 矩形、圆、线段、文本的参数与几何计算确实不同。若为了统一而把所有属性塞进一个基类，或在一个 move 方法里枚举形状，会削弱封装。

**方案修订：** 统一的是操作含义：move 表示平移、scale 表示按约定缩放；各 Shape 子类实现自己的算法。创建参数差异由各自 Provider 处理，容器递归委派给子节点。不把 text、radius、label 等专属能力都声明为每种 Shape 必须支持的方法。

**边界修正：** Provider 和 Shape 需类型配对，不能仅靠字符串键或 TypeScript 泛型断言运行时安全。工厂注册入口保留类型守卫与返回 id 检查，错误配对明确失败。

**Phase 2 延续：** box 的 label/fill 特殊语义通过 AttributeHandler 接入；处理器修改封装对象，事务保证一次 set 是一次撤销单元。

**依据：** [plan.md §4.5.2](../plan.md)、[ShapeFactory](../packages/core/src/application/providers/ShapeFactory.ts)、[属性事务 ADR](adr/001-attribute-transactions.md)。

## 5. Provider、Adapter 与可替换树打印不能混为一谈

**用户提出：**“适配器？你说使用adapter模式吗，definition是何意味”；后来补充老师希望树形打印能插件式替换，并提到 adaptee。

**讨论的重点：** 一个类承担转换职责，并不意味着它一定是 GoF Adapter。Provider 的类型映射职责，也不同于包装已有树打印库的不兼容接口。

**方案修订：** 类型配套能力统一命名为 ShapeProvider；树排版使用 TreePrinter 接口注入。接入现成树打印库时，TreePrinter 是 Target，包装转换类是 Adapter，现成库才是 Adaptee。测试中使用 OutlineTreeAdapter/OutlineLibrary 验证替换能力。

**Phase 2 区分：** TreePrinter 替换整棵树的排版；TreeDecorator 在每行追加标签，两者不能互相替代。dir 则按本阶段明确要求采用 DirectoryReader → NodeDirectoryAdapter → Node 文件系统接口的适配器结构。

**依据：** [树打印说明](tree-printing.md)、[目录 Adapter ADR](adr/005-directory-adapter.md)。

## 6. Phase 2 对 AI 建议的实际检查和纠正

以下来自开发日志，属于 AI 实施中的检查与修正，不虚构为用户亲自发现的问题。

| AI 建议或初始假设 | 如何发现问题 | 修正结果 |
|---|---|---|
| 未安装 box 时，降级保存仍保留 data-kind，便于未来恢复 | 与 Phase 1 既有回归行为冲突 | 撤回建议，保留普通 g 降级保存时移除标记的行为；未放宽旧测试 |
| 扩展宿主查询不到符号时总会返回 [] | 真正 Extension Host 测试出现 undefined | 测试按宿主 API 实际返回值归一化；不完整 XML 的清空/恢复要求保持 |
| 直接复用 CLI 的图形模型生成大纲 | 对照大纲要求，发现 CLI 会限制类型、补 id，且不保留源位置 | 复用 saxes 库与遍历思路，单独建立只读语法节点及位置映射 |

**人工验证补充：** 用户实际启动扩展开发宿主，提供截图，并确认点击 rect#start 定位第 3 行、修改为 test 后更新、恢复 start 正常。异常 XML 路径由自动测试覆盖，未声称为用户人工验证。

**依据：** [Phase 2 开发日志](phase2-progress.md)、[人工验证记录](validation/vscode-manual.md)、[真实宿主验证结果](validation/vscode-integration.json)。

## 7. 对人机协作的总结

人工审查主要约束了变化方向、层次边界和复杂度：不能为套模式而增加维护成本，不能让领域对象承担展示格式，也不能仅说“可扩展”而没有接入证据。AI 将这些意见落实到方案、实现和测试，并通过回归纠正与旧行为冲突的建议。保留被否决的方案和失败后的修正，比只列最终采用了哪些模式更能解释设计过程。
