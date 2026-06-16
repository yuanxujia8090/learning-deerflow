# 系统架构总览

## 顶层架构

```
浏览器 → Nginx (:2026) → 前端 (:3000) + 网关 API (:8001)
                                       ↓
                               LangGraph 代理运行时
                              （主导代理 + 子代理 + 工具 + 沙箱）
```

### 三个关键组件

**Nginx 统一入口（端口 2026）**
- 反向代理，统一入口
- `/api/langgraph/*` → 网关的 LangGraph 兼容运行时
- `/api/*` → 网关 REST API
- `/*` → 前端静态资源

**Gateway API（端口 8001）**
- FastAPI 应用 "DeerFlow API Gateway"
- 包含 LangGraph 兼容的 runs/threads API
- SSE 流式推送
- 模型、MCP、技能、上传、文件等管理端点
- 内嵌 Agent 运行时

**前端（端口 3000）**
- Next.js 16 应用
- React 19 + TypeScript
- Chat 界面
- 模型/技能/记忆管理

### 中间件管道

```
                            Middleware Chain
  ┌──────────────────────────────────────────────────────────────────┐
  │ 1. ThreadDataMiddleware     - 初始化工作区/上传/输出目录          │
  │ 2. UploadsMiddleware        - 处理上传文件                       │
  │ 3. SandboxMiddleware        - 获取沙箱环境                       │
  │ 4. SummarizationMiddleware  - 上下文缩减（按配置）                │
  │ 5. TitleMiddleware          - 自动生成对话标题                    │
  │ 6. TodoListMiddleware       - 任务跟踪（计划模式）                │
  │ 7. ViewImageMiddleware      - 视觉模型支持                       │
  │ 8. ClarificationMiddleware  - 处理澄清请求                       │
  └──────────────────────────────────────────────────────────────────┘
                                        ↓
                              Agent Core（模型 + 工具 + 系统提示词）
```

### Harness / App 分离

```
backend/
├── packages/harness/deerflow/   ← Harness（可复用框架，纯 agent 逻辑）
│   ├── agents/                  ← 主导代理、中间件、记忆
│   ├── sandbox/                 ← 沙箱执行 + 文件工具
│   ├── subagents/               ← 子代理委派
│   ├── mcp/                     ← MCP 集成
│   ├── skills/                  ← 技能发现
│   ├── models/                  ← 模型工厂
│   ├── config/                  ← 配置系统
│   ├── tools/                   ← 内置工具
│   └── community/               ← 社区工具（Tavily、Jina 等）
│
└── app/                         ← 应用层（依赖 harness）
    ├── gateway/                 ← FastAPI 网关
    │   ├── app.py               ← 应用入口
    │   └── routers/             ← 路由模块（17个）
    └── channels/                ← IM 渠道集成
```

**严格规则**：App 可以引用 Harness。Harness **不能** 引用 App。由测试 `tests/test_harness_boundary.py` 强制执行。

---

## 复习习题

1. （初级）DeerFlow 的 Nginx 配置中，`/api/langgraph/*` 和 `/api/*` 分别路由到哪些后端服务？端口分别是多少？

2. （中级）参考材料中提到了"三层架构"（Gateway → Agent Core → Infrastructure），而当前文档描述的是"三个关键组件"。请从职责分离的角度，分析 Gateway 和 LangGraph Server 的边界在哪里。

3. （中级）Harness/App 分离的规则是"App 可以引用 Harness, Harness 不能引用 App"。这条规则的目的是什么？如果违反会带来什么后果？

4. （高级）参考材料将中间件分为"运行时基础"和"Lead Agent 专属"两类（共18个），而当前文档列出8个。对比两者差异后，你认为哪些中间件的缺失对生产环境影响最大？为什么？
