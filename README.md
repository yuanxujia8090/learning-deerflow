# DeerFlow 学习指南

  > 面向前端开发者的 DeerFlow 超级代理框架系统化学习文档

DeerFlow 是一个基于 LangGraph 构建的 AI 代理运行时，支持沙箱执行、MCP 集成、多代理协作、记忆管理等能力。本项目以**前端开发者视角**切入，从架构全景、核心模块、数据流程到企业部署，帮助你从零掌握 DeerFlow。

## 快速开始

```bash
# 安装 mdbook
cargo install mdbook

# 克隆项目后进入 deerflow-learn
cd deerflow-learn

# 本地预览（默认 http://localhost:3000）
mdbook serve --open

# 或指定端口
mdbook serve --port 8080
```

> 需要 Rust 工具链来安装 mdbook。如果没有 `cargo`，请先安装 [rustup](https://rustup.rs/)。

## 文档结构概览

```
deerflow-learn/
├── book.toml                    # mdbook 配置（主题、仓库链接等）
└── src/
    ├── SUMMARY.md               # 目录清单
    ├── 01-preface.md             # 前言：目标读者与学习路径
    ├── 02-architecture/          # 架构全景
    │   ├── 01-system-overview.md
    │   ├── 02-frontend-analogy.md   # 前端开发者的概念对照
    │   └── 03-config-system.md
    ├── 03-core-modules/          # ⚡ 核心模块详解（重点）
    │   ├── 01-lead-agent.md        # 主导代理
    │   ├── 02-sub-agents.md        # 子代理系统
    │   ├── 03-sandbox.md           # 沙箱与文件系统
    │   ├── 04-skills.md            # 技能系统
    │   ├── 05-mcp.md               # MCP 集成
    │   ├── 06-memory.md            # 长时记忆系统
    │   ├── 07-context-engineering.md
    │   ├── 08-gateway-api.md       # Gateway API
    │   ├── 09-im-channels.md       # IM 渠道集成
    │   └── 10-frontend.md          # 前端架构
    ├── 04-data-flow.md          # 数据与请求流程
    ├── 05-capability-boundaries.md # 能力边界与扩展点
    ├── 06-dev-guide.md          # 二次开发与封装指南
    └── 07-enterprise-deployment.md # 企业级部署与维护
```

## 阅读建议

| 角色 | 推荐路径 |
|------|----------|
| **前端开发者** | 前言 → 架构全景(2) → 前端概念对照 → 核心模块(3) → 数据流程 |
| **后端/全栈开发者** | 前言 → 架构全景(2) → 核心模块(3) → 二次开发 → 数据流程 |
| **架构师/决策者** | 前言 → 架构全景(2) → 能力边界 → 企业部署 → 核心模块(3) |

## 构建为静态网站

```bash
# 构建输出到 book/ 目录
mdbook build

# 构建产物可直接部署到 GitHub Pages / Vercel / Nginx
# book/ 目录内容即为完整静态网站
```

线上文档：本项目可使用 GitHub Pages 部署，也支持任意静态托管服务。

## 关联项目

- **DeerFlow**: [GitHub](https://github.com/bytedance/deer-flow) — AI 代理运行时（Python 3.12+ / FastAPI / LangGraph / Next.js 16）
- **端口**: 前端 `:3000` · 网关 API `:8001` · LangGraph Server `:8001`（embedded）
- **数据平面**: Threads（对话/运行时）+ Store（持久化存储）

---

*文档使用 [mdbook](https://rust-lang.github.io/mdBook/) 构建，主题为 Ayu/Navy。*
