# 能力边界与扩展点

## 核心能力清单

### DeerFlow 能做什么？

| 能力 | 说明 | 配置 |
|------|------|------|
| 多模型支持 | OpenAI、Claude、DeepSeek、vLLM 等 | config.yaml models |
| 子代理委派 | 复杂任务自动分解、并行执行 | subagents config |
| 沙箱执行 | 隔离的文件系统 + bash | sandbox config |
| 技能系统 | 21 个内置技能 + 自定义 | skills/ 目录 |
| MCP 扩展 | 通过 MCP 协议接入任意工具 | extensions_config.json |
| 长时记忆 | 跨会话用户偏好/知识持久化 | memory config |
| 上下文管理 | 自动摘要、工具调用恢复 | 内置 |
| IM 集成 | 7 个 IM 平台 | channels config |
| 嵌入模式 | Python Client 进程内调用 | client.py |
| 流式响应 | SSE 实时推送 | 默认 |
| 文件上传/下载 | 上传分析、下载产出 | 内置 |
| 认证 | 登录/注册/CSRF 保护 | auth config |
| 检查点 | 线程状态持久化/恢复 | checkpointer config |
| Token 追踪 | 用量统计 | token_usage config |

### DeerFlow 不做什么？

| 边界 | 说明 | 替代方案 |
|------|------|----------|
| 不是 LLM | 不提供模型推理，而是调用外部模型 | 配置 OpenAI/Claude 等 |
| 不是数据库 | 不提供数据存储 | 接入 PostgreSQL/Redis |
| 不是消息队列 | 不提供高吞吐消息处理 | 接入 Kafka/RabbitMQ |
| 不是监控系统 | 只提供基础日志 | 对接 LangSmith/Langfuse |
| 不是 CI/CD | 不提供发布流水线 | 配置自己的 CI |
| 不是 API 网关 | 专注于 AI 代理，不代替 Nginx/Kong | 前面加 Nginx |
| 不是前端框架 | 内置 Next.js 界面可替换 | 用 Gateway API 自定义前端 |

## 扩展点总览

```
                    ┌─────────────────────┐
                    │   扩展方式总览        │
                    ├─────────────────────┤
                    │ 1. 自定义模型提供商    │
                    │ 2. 自定义中间件        │
                    │ 3. 自定义沙箱提供商    │
                    │ 4. 自定义技能          │
                    │ 5. MCP 工具            │
                    │ 6. ACP 代理            │
                    │ 7. 自定义网关路由      │
                    │ 8. 自定义 IM 渠道      │
                    │ 9. 自定记忆存储        │
                    │ 10. API 客户端集成     │
                    └─────────────────────┘
```

## 扩展点详解

### 1. 自定义模型提供商
通过 `use` 字段指向任意 Python 类：

```yaml
models:
  - name: my-model
    use: my_module:MyChatModel
    model: my-model-name
    api_key: $MY_API_KEY
```

**接口**：实现 `BaseChatModel`（LangChain 标准接口）

### 2. 自定义中间件
插入到中间件管道的任意位置：

```yaml
middlewares:
  - use: my_module:MyMiddleware
    priority: 12
```

**接口**：继承 `BaseMiddleware`，实现 `before_agent` / `after_agent`

### 3. 自定义沙箱提供商
选择沙箱实现方式：

```yaml
sandbox:
  use: my_module:MySandboxProvider
```

**接口**：实现 `SandboxProvider`（acquire / get / release / reset / shutdown）

### 4. 自定义技能
创建 SKILL.md 文件，放在 `skills/custom/` 下。

### 5. MCP 工具
通过 `extensions_config.json` 配置 MCP 服务器。

### 6. ACP 代理
配置 ACP 协议兼容的远程代理。

### 7. 自定义网关路由
在 `app/gateway/routers/` 下添加新路由模块。

### 8. 自定义 IM 渠道
在 `app/channels/` 下添加新渠道实现。

### 9. 自定义记忆存储
```yaml
memory:
  storage_class: my_module:MyMemoryStorage
```

**接口**：实现 `MemoryStorage`（load / reload / save）

### 10. API 客户端集成
```python
# 嵌入模式，直接调用运行时
from deerflow.client import DeerFlowClient
client = DeerFlowClient()
```

---

## 复习习题

1. （初级）DeerFlow 明确"不做什么"中列出了哪些边界？请列举至少 4 项。

2. （中级）DeerFlow 支持 10 种扩展方式。如果需求是"需要连接一个企业内部 API"，你应该选择哪种扩展方式？为什么？

3. （中级）"自定义中间件"扩展点允许用户注入自己的中间件。在中间件管道中插入自定义中间件时，`priority` 数值的选择有什么讲究？放在太前面或太后面可能产生什么问题？

4. （高级）参考材料中提出了 MCP 和 ClawHub 两种扩展方式。MCP 以协议标准化见长，ClawHub 以发现和安装机制见长。如果你要设计一个企业内部的"能力市场"，会结合两者的哪些优点？
