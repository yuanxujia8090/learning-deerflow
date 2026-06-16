# 主导代理（Lead Agent）

## 前端视角理解

如果把 DeerFlow 比作一个 React 应用：
- **Agent** = 根组件（App）
- **中间件** = HOC 或 Context Provider
- **ThreadState** = Redux Store
- **Tool 调用** = API 请求
- **LLM** = 智能状态更新函数

## 核心职责

主导代理是整个系统的**大脑**。它的职责包括：

1. **解析用户输入** — 理解任务
2. **调用中间件** — 按序执行横切关注点
3. **选择工具** — 决定执行什么操作
4. **委派子代理** — 复杂任务拆解
5. **生成响应** — 输出最终结果

## 创建流程

```
make_lead_agent(config)
        ↓
_resolve_runtime_config()    ← 解析请求上下文
        ↓
_resolve_model_name()        ← 选择模型（请求参数 > Agent 配置 > 全局默认）
        ↓
_build_middlewares()         ← 组装中间件管道
        ↓
创建 LangGraph StateGraph    ← 构建执行图
        ↓
绑定工具、系统提示词          ← 注入能力
```

## 中间件管道（14 个中间件）

中间件的执行顺序**至关重要**，按优先级排序：

```python
优先级  中间件                    职责
──────────────────────────────────────────────────────
  1    ToolErrorHandlingMiddleware    捕获工具调用异常
  2    DynamicContextMiddleware       注入日期/用户提醒
  3    SummarizationMiddleware        上下文截断（条件性）
  4    TodoMiddleware                 计划模式任务列表（条件性）
  5    TokenUsageMiddleware           Token 使用追踪（条件性）
  6    TitleMiddleware                从对话生成标题
  7    MemoryMiddleware               将对话排入记忆更新队列
  8    ViewImageMiddleware            视觉模型支持（条件性）
  9    DeferredToolFilterMiddleware   隐藏延迟加载的工具（条件性）
  10   SubagentLimitMiddleware        限制子代理并发（条件性）
  11   LoopDetectionMiddleware        检测重复工具调用（条件性）
  12   自定义中间件                    用户注入
  13   SafetyFinishReasonMiddleware   安全终止处理（条件性）
  14   ClarificationMiddleware        处理澄清请求（必须最后）
```

**中间件结构（类似 Express/Koa）：**

```python
class SomeMiddleware(BaseMiddleware):
    def before_agent(self, state: ThreadState) -> ThreadState:
        # 请求处理前 —— 类似 useEffect 或请求拦截器
        # 可以修改 state
        return state

    def after_agent(self, state: ThreadState) -> ThreadState:
        # 响应处理后 —— 类似响应拦截器
        # 可以清理资源、更新存储
        return state
```

## ThreadState — 统一状态管理

类似 Redux Store，是所有数据的中心：

```python
class ThreadState(AgentState):
    messages: list[BaseMessage]        # 对话消息（类比 Redux action 历史）
    sandbox: dict                      # 沙箱环境信息
    artifacts: list[str]               # 生成的文件路径列表
    thread_data: dict                  # 工作区/上传/输出路径
    title: str | None                  # 自动生成的对话标题
    todos: list[dict]                  # 任务列表（计划模式）
    uploaded_files: list[dict]         # 上传的文件元数据
    viewed_images: dict                # 视觉模型图像数据
```

**Reducer 机制（类比 Redux reducer）：**
- `merge_artifacts` — 合并并去重文件路径
- `merge_viewed_images` — 合并图片字典
- `merge_todos` — 最后非空值胜出

## 关键源码路径

```python
backend/packages/harness/deerflow/agents/
├── lead_agent/
│   ├── agent.py              ← 主工厂函数 make_lead_agent
│   ├── system_prompt.py      ← 系统提示词构建
│   └── agent_config.py       ← Agent 配置
├── middlewares/               ← 中间件实现
│   ├── thread_data.py
│   ├── uploads.py
│   ├── sandbox.py
│   ├── summarization.py
│   ├── title.py
│   ├── todo.py
│   ├── view_image.py
│   ├── clarification.py
│   ├── memory_middleware.py
│   ├── tool_error_handling.py
│   ├── token_usage.py
│   ├── dynamic_context.py
│   ├── deferred_tool_filter.py
│   ├── subagent_limit.py
│   ├── loop_detection.py
│   └── safety_finish_reason.py
├── memory/                    ← 记忆系统
└── thread_state.py           ← ThreadState 定义
```

## 如何添加自定义中间件

在 `config.yaml` 中添加：

```yaml
middlewares:
  - use: my_module:MyMiddleware
    priority: 12   # 插入到指定位置
```

---

## 复习习题

**1. （初级）** `make_lead_agent` 工厂函数的核心职责是什么？它接受什么参数，返回什么？

**2. （中级）** `ThreadState` 继承了 LangGraph 的 `AgentState`，扩展了哪些字段？其中 `merge_artifacts` 这个 reducer 的作用是什么？

**3. （中级）** 参考材料中提到中间件完整的顺序是 18 个，而文档列出 14 个。`SandboxAuditMiddleware`、`LLMErrorHandlingMiddleware`、`LoopDetectionMiddleware` 分别解决什么问题？

**4. （高级）** 执行 `agent.astream(state, config, stream_mode="values")` 时，事件类型 `values` 和 `messages-tuple` 有什么区别？各自在前端如何使用？

**5. （高级）** 参考材料中 `DeferredToolFilterMiddleware` 的功能是什么？为什么需要将一部分工具对 LLM"隐藏"但又保留在 `ToolNode` 中？
