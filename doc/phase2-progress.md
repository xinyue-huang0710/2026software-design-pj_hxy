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

目前正在实现。未打 p2；未声称 VS Code 界面截图或 Phase 2 全验收已完成。

## VS Code 扩展实现与验证

- 实现前运行真实 Extension Host（VS Code 1.135.0），SVG 语言为 xml，文档符号为空；保存 vscode-baseline.json。
- 新增 SvgFileDecorator、SvgOutlineParser、SvgSymbolProvider；正文不修改，目录不加标记，原生符号树包含源位置。
- 解析单测覆盖嵌套、无 id、CRLF、Unicode、属性内 >、CDATA、不完整 XML 和恢复，2/2 通过。
- Extension Host 首次测试发现：空符号时 VS Code 命令会返回 undefined，而非固定 []。修正测试对宿主 API 的假设，未放宽解析器行为；真实集成 12 项检查通过，证据见 vscode-integration.json。
- UI 工具仍不可用，界面截图明确待补，不把接口测试称为视觉验收。
- 用户确认继续分步提交并推送同一 GitHub 仓库。
