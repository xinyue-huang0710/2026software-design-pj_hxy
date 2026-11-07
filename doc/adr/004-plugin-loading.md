# ADR 004：统一注册、清单校验与原子发布

状态：已采纳。

## 决策

A 在组合根实例化默认导出的插件类；B 通过通用 PluginLoader 解析字符串模块。二者都调用 PluginInstaller.install → ExtensionRegistry.install，不存在绕过校验的快速路径。

插件实现同步 activate(context, options)。四类 register 调用只写入临时集合；按类别比较实际名称集合与 package.json contributes，缺省类别为空。先检查重复名称、接口方法与 help 类型，再校验清单，最后一起发布。任一失败丢弃当前插件全部暂存注册，已成功插件保留，继续加载下一项。异步 activate 明确拒绝，关闭注册上下文，避免延迟注册逃逸校验。

B 先校验完整配置语法/结构；非法则输出 error: invalid plugin config，保留默认内置能力。配置数组顺序即加载顺序；enabled:false 在解析前跳过。相对路径相对配置目录，包名通过 Node 模块解析。options 浅复制、冻结后传入 activate；插件负责其专属配置的值域校验。本阶段插件无需自定义 options，测试插件验证参数传递。

四种规定错误、重复注册错误按作业文案输出。顶层模块解析失败与模块内部依赖/求值失败分开；后者不能报为顶层 plugin not found。

## 边界与验证

这保证框架注册的原子性，不承诺回滚插件任意文件写入/外部网络副作用。activate 应仅构造实例、注册能力，不修改文档；形状创建端口在激活完成前不可用。不实现热卸载、跨进程隔离或异步激活。

tests/framework/registration.test.ts 覆盖代码与配置失败、重复注册、部分注册回滚、后续加载成功、禁用缺失模块、错误配置及 options。加载器源码只有通用解析和协议校验，不包含具体插件名称映射。
