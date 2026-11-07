# p2 标签更正记录

本阶段曾在完成必做验收后提前创建 p2，随后又补充 Phase 2 架构讨论文档和 diamond 选做插件。用户尚未在 eLearning 提交，希望必做、选做和文档由同一个标签交付，因此要求更正 p2。提前创建标签是 AI 收尾安排不当。

## 原指向与完整交付

- 原 p2 注解标签对象：a42299a3329919dcdf7b41523d720ec271a79d71。
- 原目标提交：[e2fa573](https://github.com/xinyue-huang0710/2026software-design-pj_hxy/commit/e2fa573fa72f882e398178bf5c199531fd9810ed)，仍保留在正常提交历史中。
- 完整代码和选做文档提交：[e0efdd7](https://github.com/xinyue-huang0710/2026software-design-pj_hxy/commit/e0efdd74f8a15c5b86104c61fb5cd833c4e1a178)。
- 更正后的 [p2](https://github.com/xinyue-huang0710/2026software-design-pj_hxy/tree/p2) 指向包含本记录、统一入口和更新指标的后续文档提交，生产代码与 e0efdd7 相同。

Phase 1 的 final 保持在 f8f366c8260ae9a2d8105f33ba1486570e5a1933；不重写已有提交。推送 p2 时使用原远端标签对象作为 force-with-lease 条件，避免覆盖别人期间的更新。

## 指标与验证

根目录 docs/metrics 重新计算 final 到完整代码的指标，包含 diamond；选做增量报告以原必做提交的固定 SHA 为基线，不再依赖已更正的标签。完整代码已通过 48 项 CLI 测试、2 项大纲解析测试；Extension Host 和人工界面验证记录仍保留。此次更正只修改文档和指标，不修改生产代码。

## 与作业规则的关系

作业要求已打标签不得移动。本次更正偏离该条款，不能描述为从未移动或完全满足该条款；用户同意更正也不等同于教师批准例外。保留本记录和原指向供核查，是否接受以课程方判断为准。
