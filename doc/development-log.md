# 开发与验证记录

本文件记录真实发生的实现和验证，最终总结见 README.md。审查阶段的模式取舍见 plan.md §11.1。

## 2026-10-16：开始实现

- 用户确认开始实现并要求分步提交，远程仓库由用户创建中。
- 环境：Node 24.14.0、Git 2.49.0；PowerShell 禁止 npm.ps1，使用 npm.cmd，不改系统策略。
- 从审定方案建立 main 分支；先提交方案，再提交工程、领域模型、命令历史、输入输出和最终验收。
- Git 初始化后沙箱执行器持续报告 setup refresh 错误；经授权在项目目录继续操作。
- 截止时间未提供；远程地址待用户提供，尚未推送或打 final tag。

## P1：领域模型（2026-10-16）
- Circle.move 的测试先因 move not implemented 失败，再实现几何多态，通过。
- 文档索引与结构测试先因 insert not implemented 产生 3 个失败；实现唯一 ID、最低公共祖先分组、循环检查与解组后，7 个测试全部通过，严格类型检查通过。
- 组变换递归委派，叶子验证候选数值后赋值；完整命令的失败原子性由下一阶段的候选文档事务保证。


## P2/P3：命令、历史与结构编辑
- 首个历史测试实际因 undo not implemented 失败；实现快照恢复后通过。
- 增加结构编辑逐项 execute/undo/redo、容器递归中途溢出回滚、IO 失败和 canvas 屏障验证。类型检查与 10 项测试通过。
- 为验证命令端到端行为，提前落地六个 Provider 和查询视图；文件编解码与 CLI 仍在下一步。


## P4：SVG 和文件操作
- SAX XML 解析、六类嵌套往返、实体/中文/回车文本、自动 ID 预留、拒绝失真导入、box 标记降级均已验证。
- Windows 临时目录实测：覆盖已有文件成功；目标为目录时失败且临时文件已清理。
- 14 项测试通过；修正测试中 assert.throws 的类型签名后严格类型检查通过。


## P5：CLI 集成
- 全部命令接通；Tokenizer 保留引号标记，区分文本中的 in 与父容器尾缀，保留 Windows 路径和颜色。
- 命令构造不执行、tree/show 不改变历史、错误单行输出、真实 stdin 到 EOF 回放均验证通过。
- npm run check：17 项测试通过，严格类型检查与构建通过。


## 扩展与架构验收 / 顺序回归
- 第七种图形仅在测试中注册：创建、移动、缩放、tree/show、SVG 往返、clone/undo/redo 通过；生产仍只注册六种。
- 静态类型拒绝错误配对；运行时拒绝伪造类型键、错误构造结果与重复注册。自动检查类名/文件名及分层 import。
- 复查发现直接 SvgDocument.front/back 后索引遍历顺序未刷新。回归测试真实失败（得到 a,b,c，期望 c,b,a）；重建索引后通过。
- XML 属性使用无原型字典，避免特殊属性名被对象原型吞掉。
- npm run check：22 项测试、类型检查、构建通过。


## 树打印接口与远程连接
- 用户提供 GitHub URL 并要求继续分步提交。保留远程初始 README 提交，以普通合并推送既有 7 个开发提交，未强推。
- 用户补充老师希望树打印可插件替换。先注入测试库适配器，测试真实失败（CLI 仍输出原树线），再抽取 TreePrinter，改为 main 构造注入。
- OutlineLibrary 为测试专用 Adaptee，OutlineTreeAdapter 为 Adapter，生产默认 TreeFormatter 保持作业格式。


## 复合类型导入边界对齐
- 对照计划发现 Reader 先创建空父节点再填孩子，Provider 构造时无法校验完整复合结构。
- 测试先真实失败（父 Provider 收到 0 个孩子，应为 2 个）；改成预序分配 ID、后序构造图形，fromSvg 显式接收 children。
- 自动 ID/警告仍按文档顺序，子树一次挂入文档索引。26 项测试、类型检查和构建通过。


## 作业原文回放与浏览器验收
- §6 回放保存 5 个元素，出现两条预期错误；读入 other.svg 后 7 个元素，自动 ID 警告一次。
- §6.1 A 保存 8 个元素，node2 的移动被撤销，标签保留处理数据 v2。
- 已用独立无界面 Chrome 打开 flowchart.svg 并人工查看截图：蓝/橙节点、中文标签和黑色连线正确。
- 已实际验证 npm.cmd run cli 的 svg> 提示符、init/create/show 和 Ctrl+C 退出。


## 最终文档与交付验证（2026-10-16）
- 用户确认截止日期 10 月 25 日。远程仓库为 xinyue-huang0710/2026software-design-pj_hxy。
- doc/README.md 按作业四节组织，同步运行说明、依赖/类名自查、实际目录、树打印注入、复合导入和已知 SVG 子集。
- 重新导出架构、Command、Provider 图；新增树打印图已经人工查看，正文 PNG 不依赖 IDE 插件。
- 最后 npm run check：26 项测试、严格类型检查和生产构建全部通过，完整输出保存在 doc/validation/check-output.txt。
- 完成文档本地链接检查。随后将本提交作为 final 验收版本，推送并核对远程指向。


## 规格复核：统一历史禁用提示
- 用户要求修复复核发现的 redo 文案差异。先新增四种文档操作的 CLI 回归测试，实际在 init -> redo 失败，输出 redo not allowed，与规定的 undo not allowed 不同。
- HistoryManager 统一屏障提示为 undo not allowed after io command，移除不再需要的 action 参数；空栈错误仍区分 nothing to undo/redo。
- 验证 init/read/save/canvas 后两种命令均准确报错，拒绝后文档、路径和历史不变；下一次成功编辑恢复撤销重做。
- npm run check：27 项测试、类型检查、构建通过。


## eLearning 截图补充核对
- 用户提供的截图未新增功能或额外材料；其仓库、历史、final 和项目文档要求与原文一致。补充明确截止为 10 月 25 日 23:59。
- doc/README.md 增加逐项对照及可复制的仓库、final 与文档链接；明确截图未展示提交区、未执行平台提交。同步 plan，不修改原始作业文件。
- 本轮修正按代码修复与提交说明两个独立提交推进，之后更新 final 指向包含两项修正的版本。

