# DeerFlow 视觉学习网站

## 基本信息

| 项目 | 内容 |
|------|------|
| 位置 | `/Users/yuanxj/Documents/github/learning-deerflow/vision/` |
| 技术栈 | Vite 6 + React 19 + TypeScript + Tailwind CSS 3 |
| 核心库 | `@xyflow/react`（交互图）、`motion`（动画） |
| 构建产物 | `dist/` 目录，约 580KB JS + 44KB CSS |
| 部署方式 | 任意静态服务器（Nginx / GitHub Pages / Vercel） |

---

## 6 个可视化页面

| 页面 | 入口 | 核心交互 | 数据来源 |
|------|------|---------|---------|
| 🏗️ **系统架构** | 侧边栏第 1 项 | React Flow 交互图，11 个节点点击展开详情，支持引导模式 | `architecture.ts` |
| 🔄 **数据流程** | 侧边栏第 2 项 | 9 步垂直流程图，点击步骤高亮 + 右侧详情，进度条跟踪 | `data-flow.ts` |
| ⛓️ **中间件管线** | 侧边栏第 3 项 | 顶部管线汇总图（BEFORE/AGENT/AFTER 三阶段）+ 下方详细列表，点击联动 | `middleware.ts` |
| 🧩 **核心模块总览** | 侧边栏第 4 项 | 3 列卡片网格，分类筛选（核心/集成/扩展），点击展开详情 | `modules.ts` |
| 🔌 **前端类比** | 侧边栏第 5 项 | 双向概念对照卡片（前端 → DeerFlow），13 个分类筛选，淡入淡出动效 | `analogy.ts` |
| 🚀 **企业部署** | 侧边栏第 6 项 | 4 种部署模式展开卡 + RBAC 角色卡片 + 数据隔离表格 + 审计日志示例 | `deployment.ts` |

---

## 项目结构

```
vision/
├── package.json                 # 依赖配置
├── vite.config.ts               # Vite + React 插件，base: './'
├── index.html                   # 入口 HTML
├── src/
│   ├── main.tsx                 # React 挂载入口
│   ├── App.tsx                  # 侧边栏导航（6 页路由切换）
│   ├── index.css                # Tailwind + 暗色主题 + 滚动条
│   ├── components/
│   │   ├── InfoPanel.tsx        # 通用信息面板（44% 宽度，展示内容/要点/分节）
│   │   └── ArchNode.tsx         # 系统架构节点组件
│   ├── data/                    # 数据层（全部 17 章学习内容已数据化）
│   │   ├── architecture.ts      # 11 系统节点 + 边 + 分层配色
│   │   ├── data-flow.ts         # 9 数据流步骤
│   │   ├── middleware.ts        # 14 中间件
│   │   ├── modules.ts           # 10 核心模块
│   │   ├── analogy.ts           # 17 组前端类比
│   │   └── deployment.ts        # 4 部署模式 + RBAC + 隔离 + 审计
│   └── pages/
│       ├── Architecture.tsx     # 🏗️ 系统架构（React Flow 交互图）
│       ├── DataFlow.tsx         # 🔄 数据流程（手动点击模式）
│       ├── Middleware.tsx       # ⛓️ 中间件管线（汇总图+详细列表）
│       ├── Modules.tsx          # 🧩 核心模块总览（卡片网格+分类筛选）
│       ├── Analogy.tsx          # 🔌 前端类比（概念对照闪卡）
│       └── Deployment.tsx       # 🚀 企业部署（模式+角色+隔离+审计）
└── dist/                        # 构建产物，可独立部署
```

## 运行方式

```bash
cd vision

pnpm dev        # 开发 → http://localhost:5173
pnpm build      # 生产构建 → dist/
pnpm preview    # 预览构建产物
```

## 数据覆盖

6 个数据文件覆盖了 `learning-deerflow/src/` 全部 17 个 .md 源文件。每个可视化节点/步骤/卡片都嵌入了对应的学习内容，点击右侧 InfoPanel 即可阅读完整摘要、关键要点和配置示例。
