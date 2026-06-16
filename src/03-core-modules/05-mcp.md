# MCP 集成

## 前端视角理解

MCP（Model Context Protocol）可以类比为：
- **WebSocket + REST 混合协议**：持久连接（SSE）+ 请求-响应（HTTP）
- **Chrome 扩展的 Message Passing**：不同进程间通信
- **微服务中的 Sidecar 模式**：附加服务提供额外能力
- **npm 包**：可安装、可配置的工具扩展

简单说，MCP 就是给 LLM 装"插件"的标准方式。

## MCP 架构

```
LLM (LangGraph Agent)
      │
      ▼
MCP Client (DeerFlow 内嵌)
      │
      ├──→ MCP Server A（stdio 模式）    ← 本地进程
      │     └── 持久会话池（per server × thread_id）
      │
      ├──→ MCP Server B（SSE/HTTP 模式） ← 远程服务
      │     └── 支持 OAuth 认证
      │
      └──→ MCP Server C（SSE/HTTP 模式）
            └── 自定义拦截器
```

## MCP 服务器类型

### Stdio 模式（本地进程）

```json
{
  "mcpServers": {
    "my-tool": {
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "my-mcp-server"],
      "env": {
        "API_KEY": "$MY_API_KEY"
      }
    }
  }
}
```

类比：在终端运行 `npx` 启动一个服务器，通过 stdin/stdout 通信。

### SSE/HTTP 模式（远程服务）

```json
{
  "mcpServers": {
    "remote-api": {
      "transport": "sse",
      "url": "https://api.example.com/mcp"
    }
  }
}
```

类比：调用 REST API，但通过 Server-Sent Events 保持长连接。

## 会话池管理

```python
# 核心：每个 (server_name, thread_id) 维护一个会话
session_pool = MCPSessionPool(max_size=256)

# LRU 淘汰策略
# 跨事件循环检测：如果会话在错误的异步循环上 → 自动替换
# 作用域关闭：close_scope(thread_id) → 释放该线程所有会话
```

**前端类比**：类似 HTTP 连接池 + WebSocket 复用。减少频繁创建/销毁连接的开销。

## MCP 工具加载流程

```
1. Gateway 启动
        ↓
2. 读取 extensions_config.json
        ↓
3. MultiServerMCPClient 发现工具
        ↓
4. Stdio 工具 → 包装为 Session Pool 工具（持久连接）
   SSE/HTTP 工具 → 保持原样（特殊 TaskGroup 清理）
        ↓
5. 可选：OAuth 拦截器注入（token 自动刷新）
        ↓
6. 可选：自定义拦截器注入
        ↓
7. 工具缓存（initialize_mcp_tools → 按 mtime 检查过期）
        ↓
8. Agent 运行时按需加载
```

## 配置完整示例

```yaml
# extensions_config.json
{
  "mcpServers": {
    "playwright": {
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-playwright"]
    },
    "github": {
      "transport": "sse",
      "url": "https://api.github.com/mcp"
    }
  },
  "mcpInterceptors": [
    {
      "name": "my-interceptor",
      "use": "my_module:MyInterceptor"
    }
  ]
}
```

## 关键源码路径

```python
backend/packages/harness/deerflow/mcp/
├── client.py         # MCP 服务器参数构建
├── tools.py          # MCP 工具加载（核心）
├── session_pool.py   # 会话池管理（LRU）
├── cache.py          # 工具缓存（mtime 检测）
└── oauth.py          # OAuth 认证流
```

---

## 复习习题

**1. （初级）** MCP 支持的三种传输方式是什么？它们分别适用于什么场景？

**2. （中级）** 参考材料中的 MCP 会话池管理采用了 LRU 淘汰策略，还包含"跨事件循环检测"。为什么会出现跨事件循环问题？检测到后会怎么处理？

**3. （中级）** MCP 工具名前缀（`{server_name}_{tool_name}`）的作用是什么？在什么场景下可以安全地禁用它？

**4. （高级）** 参考材料中 OAuth Token 的自动刷新机制采用了双重检查锁定模式（double-checked locking）。为什么要先检查 token 是否过期，获取锁后再检查一次？
