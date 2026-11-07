# VS Code 人工界面验证

验证日期：2026-11-07。使用本机扩展开发宿主，用户操作，AI 核对用户提供的真实截图。

| 项目 | 证据与结果 |
|---|---|
| SVG 文件标记 | 截图中 example.svg 文件及打开的编辑器旁显示 [] |
| 排除非 SVG 与目录 | 同屏 notes.txt、名为 folder.svg 的目录没有 [] |
| 原生大纲 | svg → g#scene → rect#start、g#nested → text，包含根、嵌套容器和无 id 元素 |
| 点击定位 | 用户点击 rect#start，截图显示第 3 行对应 rect 源码被选中 |
| 编辑更新与恢复 | 用户明确确认将 start 改为 test 后大纲更新，随后恢复 start，验证无问题 |
| 不完整 XML | 由真实 Extension Host 自动测试验证暂时清空、恢复后重新显示；不冒充人工测试结果 |

用户确认原文：“好了，test也验证过了，已经恢复成start了，没问题”。

人工截图已归档为 [vscode-outline.png](vscode-outline.png)，AI 已读取本地图片核对；一张图同时证明文件标记和大纲定位。

复现步骤：

1. 在仓库根执行 npm ci。VS Code 打开仓库，选择调试配置 PJ1 SVG Tools。
2. “运行 → 启动调试”；也可 F5，若键盘触发音量则 Fn+F5。配置会先构建扩展。
3. 在扩展开发宿主打开 example.svg；若默认进入图片预览，右键标签页 → 重新打开编辑器的方式 → 文本编辑器。
4. 展开资源管理器左下角、时间线上方的“大纲”。
5. 点击 rect#start 应定位第 3 行；将 id 改为 test 查看实时更新，再撤销恢复。

自动验证见 vscode-baseline.json、vscode-integration.json。基线为空符号，安装扩展后原生符号接口成功返回层级；自动证据与人工证据分开记录。
