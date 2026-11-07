# ADR 005：dir 的目录端口与 Adapter

状态：已采纳。

| GoF 角色 | 项目对应 | 职责 |
|---|---|---|
| Client | DirCommand | 只向 DirectoryReader 查询当前目录与直接子项，格式化稳定列表 |
| Target | core/contracts/DirectoryReader.ts | currentDirectory()、read(path)，统一目录条目类型 |
| Adapter | plugins/command-dir/src/NodeDirectoryAdapter.ts | 将 Node 路径与 Dirent 转为 Target 数据 |
| Adaptee | Node.js fs/promises.readdir / Dirent 与 process.cwd | 提供底层操作系统目录信息 |
| 组装者 | DirPlugin / DirRegistration | 构造并注入适配器；A/B 使用同一实现 |

dir 读取进程 cwd，不读取 SVG 的保存路径。read/save 不改变 cwd。不递归，保留隐藏项；不生成 .、..。排序先目录、再普通文件、再符号链接、最后其他项；各组以 JS 字符串比较进行稳定升序（UTF-16 码元顺序，大小写敏感），不用依赖机器语言环境的 localeCompare。

每行标记后两个空格。特殊项使用 [LINK] 和 [OTHER]，不跟随符号链接目标。空列表输出 (empty directory)，失败输出 error: cannot read directory: <path>。命令不依赖文档初始化，不调用编辑事务或设置历史屏障，成功/失败均不改变文档、dirty 或 undo/redo。

适配器允许测试用内存目录替身，也允许以后换其他文件系统。这里只映射所需的目录读取能力，没有扩展成通用文件系统框架。tests/plugins/dir.test.ts 同时覆盖替身和真实临时目录；双装配脚本把日志写在测试 cwd 外，目录项目固定。
