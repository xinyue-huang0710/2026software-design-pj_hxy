# @svgframe/plugin-shape-diamond

独立 ShapeProvider 插件，向 PJ1 CLI 添加轴对齐菱形判断框：

~~~text
create diamond decision 400 230 200 120 #fff2cc
~~~

参数为 id、中心 cx/cy、外接宽高 width/height、可选 fill；支持通用 in、move、scale、set、group、undo/redo。尺寸非负，缩放遵循画布原点语义。注册名 diamond，主入口默认导出 DiamondPlugin 类；只依赖 @svgframe/core。

保存为带 data-kind 和几何元数据的标准 SVG polygon。读回验证顶点与元数据一致，避免浮点往返漂移及静默丢弃人工改动；不支持任意 polygon。禁用插件时不做有损降级。

独立测试：

~~~sh
node --import tsx --conditions=development --test tests/plugins/diamond-unit.test.ts
~~~

[完整用法、示例、设计取舍与证据](../../doc/optional-diamond.md)。
