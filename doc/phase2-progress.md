# Phase 2 开发与 AI 协作记录

## 2026-11-07：需求审查与实施授权

- 用户先要求阅读 Phase 2，AI 编写 plan-phase2.md；用户随后明确授权按要求实现、完成 README，并规划 Git 分步提交。
- 用户询问是否要求 AI 交互记录。复核 Phase 1 §1.2：要求有代表性的讨论、发现问题、确认和纠正；Phase 2 延续此要求。此记录保留实际发生的过程，不补造对话。
- 用户确认截止日期暂不清楚。未自行推定截止时间。
- 保留 Phase 1 的 final（f8f366c8260ae9a2d8105f33ba1486570e5a1933），不移动；p2 留到完成验收后。
- 设计修正：TreePrinter 替换树排版，不能代替 TreeDecorator 的逐行标签扩展；保持两者独立。
- 依赖审查发现 SvgDocument 直接创建 GroupShape、命令导入具体 Session，框架阶段需要消除这些插件边界耦合。
- 计划按 VS Code、框架、stats、dir、box 两种接入、两个标签、最终报告分步提交。box 接入使用共同基线的两个真实分支证明，不将框架修复夹带入插件提交。
- 基线验证：npm run check 的 27 项测试、类型检查、构建通过。
- 环境限制：普通 shell、node_repl 与 cua_repl 均报告 Windows 沙箱 setup refresh 故障。项目 shell 经工具审批可运行；UI 截图尚不能采集，后续使用真实 Extension Host 补充自动验证，界面证据单列待办。

## 交付状态

实现、自动检查与用户界面验证已完成。最新状态见本文末尾收尾记录；前文保留各开发节点当时的状态。

## VS Code 扩展实现与验证

- 实现前运行真实 Extension Host（VS Code 1.135.0），SVG 语言为 xml，文档符号为空；保存 vscode-baseline.json。
- 新增 SvgFileDecorator、SvgOutlineParser、SvgSymbolProvider；正文不修改，目录不加标记，原生符号树包含源位置。
- 解析单测覆盖嵌套、无 id、CRLF、Unicode、属性内 >、CDATA、不完整 XML 和恢复，2/2 通过。
- Extension Host 首次测试发现：空符号时 VS Code 命令会返回 undefined，而非固定 []。修正测试对宿主 API 的假设，未放宽解析器行为；真实集成 11 个命名检查通过，证据见 vscode-integration.json。
- UI 工具仍不可用，界面截图明确待补，不把接口测试称为视觉验收。
- 用户确认继续分步提交并推送同一 GitHub 仓库。

## CLI 框架可扩展

- 完成 packages/core、packages/host 与两个内置插件包；原文件路径映射保存在 doc/architecture/source-migration.json。
- 四个接口在 core 公开 API；插件只依赖 @svgframe/core，不导入内部 Session 或宿主。内核不再直接创建 GroupShape，组装者注入分组工厂。
- A/B 共用 PluginInstaller 和原子注册路径。配置四失败、嵌套依赖缺失、重复注册、全部回滚、坏配置与继续加载均有测试。
- 属性处理器在候选文档事务内执行；双命中拒绝、部分修改抛错整体回滚，单次 undo/redo 恢复全部修改。测试用复合类型证明必需子部件保护。
- 真实回归发现初稿“降级保存保留 data-kind”改变 Phase 1 已有行为；撤销该建议，保留去掉标记的降级语义，旧测试断言未放宽。
- 33/33 CLI 测试与 2/2 大纲解析测试通过，类型检查和构建通过。编译后 CLI 的两个基础会话、输出 SVG 与 immutable final 基线逐字节相同。
- 指标脚本随框架提交；下一笔记录从本提交的 Git 对象生成的首份指标，不手填数字。

## stats 独立插件

- 在 a2250dd 框架提交之后新增 command-stats 包；内核与内置插件无改动。
- 使用只读查询端口，按 DFS 首次出现类型排序，不枚举具体容器名；独立测试含未知复合类型，空文档、计数和无副作用检查通过。
- 两种装配均注册同一插件。34 项 CLI 测试、2 项解析测试、类型检查及构建通过。
- docs/metrics/framework 由脚本从 final 与 a2250dd 的 Git 对象生成。

## dir 独立插件与 Adapter

- 新增 command-dir 包。DirCommand 只依赖 DirectoryReader；NodeDirectoryAdapter 将 fs.Dirent 转成公开目录条目，不跟随符号链接。
- 假目录覆盖混合项、隐藏项、稳定排序、空目录、读取失败；真实临时目录验证未 init 可用、成功/失败不改内容和 undo/redo、随后 redo 仍可用。
- 代码装配与配置装配在同一固定目录输出逐字节一致；禁用时两个命令从 help 消失并报 unknown command。
- 37 项 CLI 测试、2 项解析测试与类型检查/构建通过。此次未修改内核、加载器或既有插件。

## box 双装配证明与树标签

- 共同基线 1118af2；代码装配 e00d2ff 仅修改一个已有运行文件 codePlugins.ts，配置装配 dbcfd3a 不修改任何已有运行源码。两者新增的 box 包相同，演示分支已推送并以 eaf2034 合并，未移动 final。
- box 的独立测试只使用公开 Shape 和创建端口替身；集成覆盖模板、嵌套、缩放移动、单次撤销重做、ID 冲突、损坏导入、降级和必需子部件保护。
- deb4853 单独接入 box-type-label；随后独立接入 modified-star，不修改内核或 TreeFormatter。
- 星号按保存内容比较，实例私有字段保存基线；新节点和祖先标星，保存/读入/初始化重置，undo 回保存点消失。两个标签只通过公开树视图协作。

## 最终验证、用户实测与文档收尾

- 用户协助启动扩展开发宿主：F5 被键盘映射为音量，改用 Fn+F5 或“运行 → 启动调试”；SVG 默认图片预览需切换文本编辑器；大纲在资源管理器左下角展开。
- 用户提供真实界面截图，确认 []、嵌套层级、无 id 的 text、点击 rect#start 定位第 3 行，并明确确认 start → test → start 的实时更新成功。截图已保存为 doc/validation/vscode-outline.png；AI 已读取本地图片核对，未伪造界面证据。
- 不完整 XML 的清空/恢复由真实 Extension Host 自动检查，人工记录不冒称用户测试过此分支。
- npm ci 成功；完整 check 为 43 项 CLI 测试与 2 项解析测试通过，另有真实 Extension Host 的 11 个命名检查。输出存入 doc/validation/phase2-check.txt。
- 四组编译程序会话（基础、flowchart、box、stats/dir）在 A/B 下 stdout 与 SVG 均逐字节一致。纯命令输入和独立预期已归档；dir 的日志不进入查询目录。
- Git 差异脚本检查实际存在的内核/加载器/既有插件路径、共同父提交、允许改动集合及两边相同的新增插件 tree；不是靠不存在路径的空 diff 作证。
- 宿主补齐五个已静态导入插件的依赖元数据；修正旧回放脚本的 src/main.ts 入口，明确本阶段编译路径。没有夹带新业务特例。
- 报告补齐四个扩展点的真实调用位置和错误契约、五条 ADR、前后 PlantUML/PNG、模式区别、复用分析及 AI 建议纠错。原 Phase 1 报告单独归档。
- 收尾仍按验证材料、报告、Git 历史指标分步提交并推送；最终 p2 标在交付提交，final 保持不变。指标从代码提交生成，再对 p2 重算核验源码哈希和数值。

## 收尾提交与指标来源

- 89c3748：真实 VS Code 人工证据、开发调试配置、完整双装配回放、Git 差异核验及最终检查输出。
- 4a1b780：最终报告、五条 ADR、架构图、运行说明和 AI 协作记录。
- 最终指标从 final 与 4a1b7802919ec049dcfac69681abf49adc63a9ab 的 Git 对象生成，保存于 docs/metrics；本次指标提交仅增加报告/记录，不改变生产源码。最终 p2 可用相同脚本重算并比较源码哈希。
- 用户截图已核对、报告本地链接检查通过，收尾提交之后创建 p2 并推送；final 不移动。原有用户工作文件、Phase 1 提交 PDF 和压缩包未纳入本次提交。