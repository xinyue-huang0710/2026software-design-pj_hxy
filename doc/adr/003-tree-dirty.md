# ADR 003：树标签、dirty 语义与祖先传播

状态：已采纳。

## 决策

TreePrinter 负责布局；TreeDecorator 只返回每一行的尾部标签。领域 Shape 不知道缩进、连接符、CLI 文案或星号。框架先建立只读结构与内容快照，再由 TreeDecorationService 依注册顺序收集标签，最后交给宿主树打印器。

ModifiedStarDecorator 以“当前内容与上次成功保存基线不同”判定 dirty。init/read 成功建立干净基线，save 成功重置；失败不改变基线。新节点立即标星。节点指纹包含属性、文本、子树与父 id，根包含画布尺寸和全树。因此子节点变化向祖先传播，跨容器移动影响节点及祖先，兄弟重排使相关容器变化。undo 回到保存点星号消失；redo 再次变化又出现。缓存和基线均为实例私有字段，不使用模块级 dirty 集合。

BoxTypeDecorator 仅检查公开 typeKey 是否为 box。两个标签互不引用，默认装配先 box 标签后星号，因此行尾为 (box) *。禁用全部标签时不增添任何空格，Phase 1 tree 基线逐字节不变。

## 失败边界

标签返回 undefined/空串表示不追加；非字符串或含换行的标签被拒绝，避免破坏行布局。文档事件在事务与历史提交后发出：若监听器抛错，停用该装饰器并返回 warning，不能把已成功提交的编辑错误宣称为回滚。

## 取舍与验证

内容指纹需要遍历/序列化，换来保存点和 undo 的准确语义；缓存避免同一快照逐行重复构造整树索引。TreeDecorator 是组合式标签扩展，未伪装成同接口层层包裹的严格 GoF Decorator。

tests/plugins/modified-star.test.ts 验证状态机；decorators-integration.test.ts 验证两个标签并存、保存/撤销/重做和无副作用；旧 tree 测试验证禁用后的字节兼容。
