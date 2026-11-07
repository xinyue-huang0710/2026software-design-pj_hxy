# ADR 002：box 子部件不变量与 SVG 读回

状态：已采纳。

## 决策

BoxShape 继承公开 ContainerShape。必要直接子节点固定为 <id>-rect（rect）和 <id>-label（text）；允许增加其他子节点。BoxProvider 通过公开 ShapeCreation 创建基础部件，不导入 RectShape/TextShape。新建子树与已有文档的所有 id 一起检查，任意冲突整条命令失败。

序列化为带 data-kind="box" 的 g。装有插件时按注册 provider 读回，并检查必需部件的 id、类型、直接父子关系；损坏 box 拒绝整个 read，保留旧文档。任意重复 id 也拒绝整个读入。未安装 box 插件时按普通 g 读入，后续保存去掉 data-kind：这沿用 Phase 1 行为，降级后无法靠该文件自动恢复 box 类型。

BoxShape.validateStructure 是插件自己的不变量；内核提交候选文档时通过 ContainerShape 的通用校验钩子调用。直接删除、移出或重新分组必要部件使校验失败，候选事务回滚。删除整个 box 合法；移动/缩放整个 box 委托容器对子节点操作；canUngroup=false，ungroup 拒绝复合对象。

## 取舍与验证

拒绝坏 box 比静默修复或猜测部件更可预测。保留降级标记虽有利于重新启用插件，但会改变 Phase 1 的既有读写行为，回归发现后取消该建议。

tests/plugins/box-unit.test.ts 使用公开 Shape 替身独立验证；box-integration.test.ts 覆盖全局冲突、损坏导入、降级、必要部件保护、整体删除和事务历史。A/B 接入差异证据见 doc/validation/plugin-diff-proof.json。
