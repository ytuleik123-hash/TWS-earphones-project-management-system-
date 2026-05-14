# TWS 试产长周期物料追踪面板 (TWS Material Tracker)

> 一个制造业过程中管理TWS耳机的项目管理系统，提供试产样机数据统计、物料管控、成员名单、资料上传、项目计划创建等功能。

NPI 试产阶段核心物料齐套进度追踪工具，面向项目经理（PM）。

## 技术栈

- React 18 + Vite
- Tailwind CSS
- Lucide React 图标

## 运行方式

```bash
npm install
npm run dev
```

浏览器打开终端提示的本地地址（一般为 **http://localhost:5173**）即可查看面板。

---

## 无法打开预览时怎么办？

若在 Cursor 里运行 `npm run dev` 没有反应或报错，请在本机**系统自带的终端**里操作：

### 方法一：用 CMD 或 PowerShell（推荐）

1. 按 `Win + R`，输入 `cmd` 或 `powershell`，回车打开终端。
2. 进入项目目录（路径按你实际存放位置改，有空格时用引号）：
   ```bash
   cd "e:\MY opc project\tws-material-tracker"
   ```
3. 安装依赖（仅第一次需要）：
   ```bash
   npm install
   ```
4. 启动开发服务器：
   ```bash
   npm run dev
   ```
5. 终端里会显示类似：
   ```
   VITE v6.x.x  ready in xxx ms
   ➜  Local:   http://localhost:5173/
   ```
6. 用浏览器打开 **http://localhost:5173** 即可看到面板。

### 方法二：用 Cursor 的"在终端中打开"

1. 在 Cursor 左侧文件树中**右键** `tws-material-tracker` 文件夹。
2. 选择 **「在集成终端中打开」**，终端当前目录即为项目根目录。
3. 执行：`npm install`，再执行 `npm run dev`。
4. 浏览器打开 **http://localhost:5173**。

### 若端口 5173 被占用

可改用其它端口：

```bash
npm run dev -- --port 3000
```

然后打开 **http://localhost:3000**。

---

## 功能说明

- **全局概览**：总物料项数、整体齐套率进度条、风险物料数量（到货率 0% 或临近交期未齐套）
- **筛选**：按版本（可拆/不可拆/通用）、颜色（黑/白/蓝/粉/通用）筛选表格
- **物料表**：支持直接编辑「需求数量」「已到货数量」，齐套率与状态自动更新
- **添加物料**：点击「添加新物料」打开弹窗表单新增一条物料

数据仅保存在内存中，刷新页面会恢复为初始 Mock 数据。
