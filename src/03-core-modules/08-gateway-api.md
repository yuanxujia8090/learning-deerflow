# Gateway API

## 前端视角理解

类比 **Next.js 的 API Routes + tRPC**：

- FastAPI 路由 = Next.js `app/api/` 路由
- Pydantic 模型 = Zod schema（请求/响应校验）
- SSE 流式 = Server-Sent Events（类似 chat.completions）
- LangGraph 兼容 = tRPC 兼容（多客户端支持）

## API 路由总览

| 路由器 | 挂载点 | 用途 | 前端类比 |
|--------|--------|------|----------|
| models | `/api/models` | 模型列表查询 | GET /api/products |
| mcp | `/api/mcp` | MCP 服务器 CRUD | CRUD /api/plugins |
| memory | `/api/memory` | 记忆读写清除 | 类似 localStorage API |
| skills | `/api/skills` | 技能管理 | CRUD /api/extensions |
| artifacts | `/api/threads/{id}/artifacts` | 文件下载 | GET /api/download |
| uploads | `/api/threads/{id}/uploads` | 文件上传 | POST /api/upload |
| threads | `/api/threads/{id}` | 线程清理 | DELETE /api/sessions |
| agents | `/api/agents` | 自定义 Agent CRUD | CRUD /api/configs |
| suggestions | `/api/threads/{id}/suggestions` | 后续问题生成 | GET /api/chat/suggestions |
| channels | `/api/channels` | IM 渠道管理 | CRUD /api/integrations |
| auth | `/api/v1/auth` | 认证 | /api/login |
| feedback | `/api/threads/{id}/runs/{rid}/feedback` | 反馈 | POST /api/feedback |
| runs | `/api/runs/*` | 无状态运行 | POST /api/execute |
| thread_runs | `/api/threads/{id}/runs/*` | 基于线程的运行 | POST /api/conversations |

## 网关中间件

```
请求进入
    ↓
AuthMiddleware         ← 认证拦截（拒绝未认证请求）
    ↓
CSRFMiddleware         ← CSRF 双提交 Cookie 防护
    ↓
CORSMiddleware         ← CORS（可选，源自配置文件）
    ↓
路由分发
```

## LangGraph 兼容 API

DeerFlow 的 `/api/langgraph/*` 路径通过 Nginx 重写为 `/api/*`：

```
Nginx 重写规则：
/api/langgraph/threads → /api/threads
/api/langgraph/runs    → /api/runs

好处：兼容 LangGraph SDK 客户端
     = 你可以用 LangGraph 的 JS/Python SDK 连接 DeerFlow
```

## 流式响应（SSE）

```python
# 流式事件类型：
event: metadata    # 运行元数据（run_id, thread_id）
event: values      # 状态快照
event: messages    # AI 消息块（增量）
event: end         # 运行结束
```

**前端消费方式**：

```typescript
// 前端，使用 EventSource 或 fetch + ReadableStream
const response = await fetch('/api/runs/stream', { method: 'POST', body: ... })
const reader = response.body.getReader()
// 读取 SSE 事件流...
```

## 健康检查

```
GET /health → 200 OK（服务存活检查）
```

## 应用生命周期

```python
# 启动时
@app.on_event("startup")
    ├── 加载配置
    ├── 初始化 LangGraph 运行时
    ├── 管理员引导
    └── 启动 IM 渠道服务

# 关闭时
@app.on_event("shutdown")
    ├── 渠道服务关闭（5秒超时）
    └── 清理资源
```

## 关键源码路径

```python
backend/app/gateway/
├── app.py                 # FastAPI 应用入口
├── dependencies.py        # 依赖注入
├── middleware.py           # 认证/CORS/CSRF 中间件
└── routers/               # 17 个路由模块
    ├── models.py
    ├── thread_runs.py
    ├── runs.py
    ├── mcp.py
    ├── skills.py
    ├── uploads.py
    ├── threads.py
    ├── artifacts.py
    ├── agents.py
    ├── suggestions.py
    ├── channels.py
    ├── feedback.py
    ├── auth.py
    ├── memory.py
    └── assistants_compat.py
```


---

## 复习习题

1. （初级）Gateway API 有哪些核心路由模块？列出至少 5 个。
2. （中级）`/api/langgraph/*` 路径在 Nginx 中被重写为 `/api/*`。这种设计带来了什么好处？它支持哪些客户端 SDK 直接连接？
3. （中级）参考材料中提到 Gateway 和 LangGraph Server 是分开部署的（不同端口），但当前文档描述 Gateway 内嵌 Agent 运行时。两种架构各自的优缺点是什么？
4. （高级）SSE 流式响应中的四种事件类型（metadata/values/messages/end）分别在前端如何消费？如果前端需要对消息做增量渲染（而不是每次都替换全部），应该监听哪个事件？
