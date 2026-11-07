# ADR 001：属性处理器与单次撤销事务

状态：已采纳。

## 问题

仅有 handles(id, attr) / apply(id, attr, value) 无法说明类型判断、子部件访问、冲突和失败回滚。不能把 box/label 特例塞进内核 set 白名单。

## 决策

公开契约见 packages/core/src/contracts/AttributeHandler.ts。handles 接收冻结的 AttributeTarget（id、typeKey、container），仅用于纯判断，不提供可变文档。apply 接收 AttributeEditContext，可按 id 取得候选文档内的公开 Shape，调用封装方法，或 inspect 只读展示数据。box 处理器在自己的包内识别 BoxShape，修改 body()/label()，不导入其他插件实现。

AttributeService.set 先收集全部命中者：0 个调用 Shape.setAttribute 的 Phase 1 原规则；1 个执行 apply；超过 1 个报 error: attribute handler conflict: <id>/<attr>。采用拒绝策略，不按注册顺序偷偷覆盖。handles/apply 抛错均上抛，绝不在处理器失败后转回默认规则。

EditCommand.execute → EditorSession.beginEdit/prepareEdit 使用整份候选文档。处理器即使改了多个子部件，也只提交一次历史快照。prepareEdit 校验结构后再提交；异常时 abortEdit 丢弃候选副本，正式文档、undo/redo 栈和 dirty 事件均不变化。undo/redo 恢复整份快照，一次 set 对应一个历史单元。

## 取舍与验证

复制文档的时间/空间开销为 O(n)，适合本阶段小文档；比要求每个第三方处理器手写补偿可靠。上下文是能力边界，不是针对恶意插件的进程沙箱；插件不得保留候选 Shape 并在命令结束后修改它。

tests/framework/extensions.test.ts 验证双命中、默认回退、多部件修改一次撤销、修改中途抛错后文档和历史不变；tests/plugins/box-integration.test.ts 验证真实 fill/label。
