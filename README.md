# 布线间 · PCB学习台

依据“教程开源资料”中的入门篇、强化篇整理。沿用STM32与CET6学习台的React + TypeScript + Vite、本地IndexedDB与JSON备份工作流。此次为独立的PCB课程，不改动原有两个学习台。

- 5个学习分组、26节课程、52道原创理解题、26张记忆卡。
- 每节含原理、操作动作/原因/成功判据、检查题、笔记和来源页码。
- 课程进度、操作勾选、错题订正、间隔复习、深浅主题、搜索与数据合并。
- 39项资料索引：26份课件（273页）、11份手册（308页）、2个EDA工程。
- 从两份epro读取原理图、PCB和元件属性，提供51核心板与USB拓展坞两条学习路线。未在EDA中运行DRC或实测。

## 本地使用

双击根目录的“启动学习台.cmd”，或在web-app目录执行：

```powershell
npm ci
npm run dev
```

打开 http://127.0.0.1:5186/ 。如果依赖已存在，可省略npm ci。生产预览运行 `npm run build`，再运行 `npm run preview`，打开 http://127.0.0.1:4186/ 。当前交付预览使用4186端口。

不同地址、端口、浏览器和设备分别保存记录。换入口前，在“学习数据”导出JSON，在另一入口导入合并。没有账号云同步。网页不会将原始课件和EDA工程上传到网络。

## 目录

- `web-app/`：界面、数据逻辑、测试与静态构建。
- `content/course.json`：当前原创课程、题目、卡片与来源元数据。
- `references/`：本地私有提取结果与资料核对证据，不进入发布副本。
- `docs/`：资料审查、设计与验收说明。
- `scripts/prepare_content.py`：由本地提取证据和原创文本重建课程。
- `scripts/prepare-release.mjs`：按白名单创建独立发布副本。
- `publish/pcb-review/`：可审查发布副本，含手动GitHub Pages工作流。

## GitHub Pages发布

发布目标：[布线间PCB学习台](https://1hx7826.github.io/pcb-review/) · [源码仓库](https://github.com/1hx7826/pcb-review)。部署由用户授权后手动触发，源码推送不会自动发布。公开仓库仅包含网页源代码、原创课程数据和必要说明，本机的原始资料、整理脚本、提取结果和学习备份不进入公开仓库。

## 来源与边界

原课程署名为Expert电子实验室。网站讲解、题目与分层SVG为原创整理，不复制原课件图片、整份手册或工程文件到网页。软件流程对照[嘉立创EDA专业版指南](https://prodocs.lceda.cn/cn/quick-start.html)，高速布线原则对照[TI SPRAAR7J](https://www.ti.com/lit/an/spraar7i/spraar7i.pdf)。

原课第19、22课未找到。第23课文件内部标题写第二十二课，保留文件名编号。部分强化课只有标题或提纲，均标注原创补充。课件中差分信号“没有共地”、固定线宽载流数值、固定USB几何规则等已纠正或限定使用条件。具体型号参数和实际生产需以器件手册与板厂工艺为准。

执行 `npm test` 检查学习数据与内容；`npm run build` 检查TypeScript、Vite和静态文件。详见docs/ACCEPTANCE.md。
