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

## 文章目录

### 一、架构全景

从整体上理解 DeerFlow 的系统分层、设计理念和配置体系。

- [系统架构总览](src/02-architecture/01-system-overview.md)
- [前端开发者的概念对照](src/02-architecture/02-frontend-analogy.md)
- [配置体系](src/02-architecture/03-config-system.md)

### 二、核心模块详解

逐一深入 DeerFlow 的 10 个核心模块，理解它们的设计与实现。

- [主导代理（Lead Agent）](src/03-core-modules/01-lead-agent.md)
- [子代理系统（Sub-Agents）](src/03-core-modules/02-sub-agents.md)
- [沙箱与文件系统](src/03-core-modules/03-sandbox.md)
- [技能系统（Skills）](src/03-core-modules/04-skills.md)
- [MCP 集成](src/03-core-modules/05-mcp.md)
- [长时记忆系统](src/03-core-modules/06-memory.md)
- [上下文工程](src/03-core-modules/07-context-engineering.md)
- [Gateway API](src/03-core-modules/08-gateway-api.md)
- [IM 渠道集成](src/03-core-modules/09-im-channels.md)
- [前端架构](src/03-core-modules/10-frontend.md)

### 三、核心流程

从请求发起到响应返回，完整追踪一次用户请求的生命周期。

- [数据与请求流程](src/04-data-flow.md)

### 四、能力边界

梳理 DeerFlow 能做什么、不能做什么，以及如何通过扩展点增强能力。

- [能力边界与扩展点](src/05-capability-boundaries.md)

### 五、二次开发

面向开发者的指南：如何进行二次封装、新增 Skill、定制前端等。

- [二次开发与封装指南](src/06-dev-guide.md)

### 六、企业级部署

生产环境下的部署方案、运维策略与最佳实践。

- [企业级部署与维护](src/07-enterprise-deployment.md)

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
