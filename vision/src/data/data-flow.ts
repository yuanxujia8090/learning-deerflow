export interface FlowStep {
  number: number;
  title: string;
  icon: string;
  component: string;
  description: string;
  detail: string;
  duration: string;
}

export const flowSteps: FlowStep[] = [
  {
    number: 1, title: '用户发起请求', icon: '🌐',
    component: '浏览器 → Nginx (:2026)',
    description: '用户在浏览器中发送消息，前端通过 HTTP POST 或 SSE 连接将请求发往 Gateway API。',
    detail: '前端通过 core/api/ 模块封装 fetch 请求，携带认证 token 和线程 ID 发起 POST。请求体包含 assistant_id（默认为 lead_agent）、input（messages 数组）和可选的模型参数。如果使用流式模式，则通过 EventSource 或 fetch + ReadableStream 建立 SSE 长连接，实现增量消息渲染。',
    duration: '即时',
  },
  {
    number: 2, title: 'Nginx 路由转发', icon: '🔀',
    component: 'Nginx → Gateway API (:8001)',
    description: 'Nginx 根据请求路径 /api/* 将请求转发到 Gateway API 服务。',
    detail: 'Nginx 配置将 /* 路由到前端静态资源 (:3000)，/api/* 代理到 Gateway API (:8001)。同时通过 rewrite 规则将 /api/langgraph/* 重写为 /api/*，使客户端可直接使用 LangGraph SDK 连接 DeerFlow 而无需感知后端架构。统一 2026 端口对外暴露，后端服务不直接暴露于公网。',
    duration: '<1ms',
  },
  {
    number: 3, title: 'Gateway 接收请求', icon: '🚪',
    component: 'Gateway API → LangGraph Server (:2024)',
    description: 'Gateway API 解析请求，创建或恢复线程，将消息转发给 LangGraph Server 处理。',
    detail: 'FastAPI 路由接收请求后，先经过 AuthMiddleware/CSRFMiddleware/CORSMiddleware 三层网关过滤。然后通过 dependencies.py 注入线程上下文：如果 thread_id 已存在则从 checkpointer 恢复状态，否则创建新线程。最后将消息和 ThreadState 传递给内嵌的 LangGraph 运行时执行。',
    duration: '~5ms',
  },
  {
    number: 4, title: 'LangGraph 编排执行', icon: '⚙️',
    component: 'LangGraph Server → Lead Agent',
    description: 'LangGraph Server 启动 Agent 执行，通过 astream() 方法编排中间件管道和模型调用。',
    detail: 'LangGraph 运行时调用 run_agent() 创建 RunRecord（运行记录）和 RunContext（含 checkpointer/store/中断配置）。然后执行 make_lead_agent 工厂函数构建 StateGraph：先解析运行时配置和模型名称（请求参数 > Agent 配置 > 全局默认），再组装 14 个中间件管道。执行时 stream_mode="values" 推送完整状态快照，stream_mode="messages-tuple" 推送增量消息块。',
    duration: '~50ms',
  },
  {
    number: 5, title: '中间件链处理', icon: '⛓️',
    component: 'Lead Agent → 14 中间件管道',
    description: '依次执行 14 个中间件的 before_agent 钩子，为 Agent 执行准备环境。',
    detail: '14 个中间件按优先级依次调用 before_agent 钩子，执行顺序（从高到低）：ToolErrorHandling → DynamicContext → Summarization → Todo → TokenUsage → Title → Memory → ViewImage → DeferredToolFilter → SubagentLimit → LoopDetection → 自定义中间件 → SafetyFinishReason → Clarification。每个中间件接收并返回 ThreadState，类似 Redux middleware 链。关键操作包括：ThreadDataMiddleware 初始化目录结构、SandboxMiddleware 惰性获取沙箱、UploadsMiddleware 处理用户上传。',
    duration: '~20ms',
  },
  {
    number: 6, title: 'LLM 推理 + 工具调用', icon: '🧠',
    component: 'Lead Agent → LLM → ToolNode',
    description: 'LLM 接收系统提示词和上下文，生成响应或决定调用工具。工具执行结果返回给 LLM 继续推理。',
    detail: 'LLM 收到系统提示词 + 用户消息 + 记忆上下文后，决定是直接生成文本还是调用工具。工具分三类：内置工具（present_file/ask_clarification）、MCP 工具（通过 MCP 客户端）、沙箱工具（bash/read/write/grep 等）。DeferredToolFilterMiddleware 会对 LLM 隐藏部分工具但仍保留在 ToolNode 中。工具执行结果以 ToolMessage 返回，触发新一轮 LLM 推理，循环直到 LLM 输出最终文本。LoopDetectionMiddleware 在检测到重复工具调用时中断循环防止死锁。',
    duration: '1-10s',
  },
  {
    number: 7, title: '子代理委派（可选）', icon: '👷',
    component: 'Lead Agent → Sub-Agent Executor',
    description: '对于复杂任务，Lead Agent 可将子任务委派给专门的子代理并行执行。',
    detail: '当 Lead Agent 判定任务适合拆解时，调用 task 工具触发的 SubagentExecutor 创建子代理实例。每个子代理通过 SubagentConfig（model/tools/skills/max_turns/timeout）独立配置，使用 scheduler_pool 调度子任务到 execution_pool 执行。每个子代理有完全隔离的上下文空间（独立的 SystemMessage、工具集、消息历史），通过协作式 CancelEvent 实现安全取消。子代理结果以 SubagentResult 返回，包含 status/result/token_usage_records 等字段。',
    duration: '5-30s',
  },
  {
    number: 8, title: '结果汇聚与输出', icon: '📤',
    component: 'Lead Agent → SSE Stream',
    description: 'Agent 执行完成后，结果通过 SSE 流式推送到前端。经过 after_agent 中间件处理。',
    detail: 'Agent 执行完成后，先经过 after_agent 中间件阶段（TitleMiddleware 生成标题、MemoryMiddleware 排队更新记忆、ClarificationMiddleware 处理澄清请求等）。然后 StreamBridge 通过 SSE 推送四类事件：metadata（run_id/thread_id 运行元数据）、values（ThreadState 完整状态快照）、messages（AI 消息增量块，支持流式 Markdown）、end（运行结束标志）。前端 streamdown 模块按事件类型分别处理：messages 事件增量更新 DOM，values 事件刷新完整状态。',
    duration: '~10ms',
  },
  {
    number: 9, title: '记忆持久化', icon: '💾',
    component: 'MemoryUpdateQueue → PostgreSQL',
    description: 'MemoryUpdateQueue 异步将 Agent 生成的记忆写入 PostgreSQL 长期存储。',
    detail: 'MemoryMiddleware 在 after_agent 阶段将对话消息排入 MemoryUpdateQueue，该队列按 (thread_id, user_id, agent_name) 去重，debounce_seconds 内合并多次更新请求，处理间隔 0.5 秒。MemoryUpdater 使用同步 LLM 调用分析对话、提取关键信息，更新 user/history 摘要和 facts 列表。记忆数据结构包含 version/lastUpdated/user（workContext/personalContext/topOfMind）/history（三级时间分层）/facts（含 confidence/verified/source 字段），超过 max_facts 时低 confidence 事实自动淘汰。',
    duration: '~50ms（异步）',
  },
];

export const flowEdges: { source: number; target: number; label: string }[] = [
  { source: 1, target: 2, label: 'HTTP/SSE' },
  { source: 2, target: 3, label: '/api/*' },
  { source: 3, target: 4, label: '线程恢复' },
  { source: 4, target: 5, label: 'astream()' },
  { source: 5, target: 6, label: 'ThreadState' },
  { source: 6, target: 7, label: '委派任务' },
  { source: 7, target: 6, label: '子结果' },
  { source: 6, target: 8, label: '生成结果' },
  { source: 8, target: 9, label: '异步' },
];
