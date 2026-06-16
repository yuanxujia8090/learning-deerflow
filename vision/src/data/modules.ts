export interface ModuleData {
  id: string;
  number: number;
  icon: string;
  title: string;
  subtitle: string;
  category: 'core' | 'integrate' | 'extend';
  description: string;
  keyConcepts: string[];
  reading: string;
}

export const moduleList: ModuleData[] = [
  {
    id: 'lead-agent', number: 1, icon: '🤖', title: '主导代理',
    subtitle: 'Lead Agent — 系统的智能核心',
    category: 'core',
    description: 'Lead Agent 是 DeerFlow 的大脑，基于 LangGraph 的 StateGraph 构建。它通过 14 个中间件管道串联处理每个请求，负责任务理解、工具选择和子代理调度。其核心是 make_lead_agent 工厂函数，支持自定义中间件和模型配置。ThreadState 继承了 AgentState，扩展了 messages/sandbox/artifacts/thread_data 等字段，通过 Reducer 机制管理状态更新。',
    keyConcepts: ['make_lead_agent 工厂函数（配置解析 → 模型选择 → 中间件组装 → StateGraph 构建）', 'ThreadState 扩展字段：messages/sandbox/artifacts/thread_data/title/todos/uploaded_files/viewed_images', '14 中间件管道按优先级串联（ToolErrorHandling → Clarification）', 'Reducer 机制：merge_artifacts/merge_viewed_images/merge_todos', '三层模型选择：请求参数 > Agent 配置 > 全局默认', 'astream 流式执行 + stream_mode 双模式（values/messages-tuple）'],
    reading: '03-core-modules/01-lead-agent.md',
  },
  {
    id: 'sub-agents', number: 2, icon: '👷', title: '子代理委派',
    subtitle: 'Sub-Agents — 并行任务执行',
    category: 'core',
    description: '子代理系统允许 Lead Agent 将复杂任务分解为多个子任务，委派给专门的子代理并行执行。使用双线程池架构（scheduler_pool + execution_pool），支持协作式取消和上下文隔离。每个子代理通过 SubagentConfig 独立配置模型、工具集、技能和超时策略。',
    keyConcepts: ['双线程池架构：scheduler_pool 调度 + execution_pool 执行', 'SubagentConfig：name/description/tools/model/max_turns/timeout_seconds', 'SubagentResult 五态：running/success/failed/timed_out/cancelled', '协作式取消（CancelEvent 信号在边界条件检测）', '上下文隔离：子代理独立 SystemMessage + 过滤后工具集', '内置子代理：general-purpose（通用）/ basher（Bash 专用）'],
    reading: '03-core-modules/02-sub-agents.md',
  },
  {
    id: 'sandbox', number: 3, icon: '📦', title: '沙箱执行',
    subtitle: 'Sandbox — 安全代码运行环境',
    category: 'core',
    description: '沙箱提供安全的代码执行环境，支持三种模式：LocalSandbox（本地直接执行）、DockerSandbox（容器化隔离）、ProvisionerSandbox（K8s 集群按需启动）。提供虚拟文件路径映射（/mnt/user-data/ → uploads/workspace/outputs）和命令安全审计。抽象接口包括 execute_command/read_file/write_file/download_file 等 8 个方法。',
    keyConcepts: ['三种沙箱模式：Local（零配置）/ Docker（容器隔离）/ K8s Provisioner（水平扩展）', '虚拟路径映射：/mnt/user-data/ 对应 uploads/workspace/outputs', '沙箱工具集：bash/read/write/str_replace/ls/glob/grep/view_image', 'SandboxAuditMiddleware 三等级：allow/warn/block 命令审计', '安全策略：Local 默认禁 bash + 路径遍历检测 + PermissionError', 'SandboxProvider 抽象：acquire/get/release/reset/shutdown 生命周期'],
    reading: '03-core-modules/03-sandbox.md',
  },
  {
    id: 'skills', number: 4, icon: '🧩', title: '技能系统',
    subtitle: 'Skills — 可插拔能力扩展',
    category: 'extend',
    description: '技能系统提供标准化的能力扩展机制。技能本质上是包含 SKILL.md 定义的工具集合和 Workflow 指令。支持从 ClawHub 远程仓库发现安装、三色安全扫描（allow/warn/block）、渐进式按需加载。内置 21 个官方技能，覆盖深度研究、报告生成、幻灯片创建、数据分析等场景。',
    keyConcepts: ['SKILL.md 定义：YAML 前置元数据 + Workflow 指令', '21 个内置技能：deep-research/report-generation/slide-creation 等', '安全三色标扫描：allow（放行）/warn（需确认）/block（拒绝）', '渐进式按需加载：仅在使用时注入上下文避免 Context 膨胀', 'allowed_tools 白名单：控制每个技能可用的工具集', '技能加载流程：扫描目录 → 解析元数据 → 注入 SystemMessage → 工具过滤'],
    reading: '03-core-modules/04-skills.md',
  },
  {
    id: 'mcp', number: 5, icon: '🔗', title: 'MCP 集成',
    subtitle: 'Model Context Protocol — 标准化外部连接',
    category: 'integrate',
    description: 'MCP（Model Context Protocol）提供标准化的外部工具和服务连接方式，类似给 LLM 装"插件"的标准接口。支持 SSE、Streamable HTTP、Stdio 三种传输，会话池采用 LRU 淘汰策略（max_size=256），OAuth Token 自动刷新（双重检查锁定）。',
    keyConcepts: ['三种传输：Stdio（本地进程 stdin/stdout）/ SSE（远程长连接）/ Streamable HTTP', 'MCPSessionPool LRU 管理：按 (server_name, thread_id) 维维护，最大 256 会话', 'OAuth Token 双重检查锁定自动刷新', '跨事件循环检测 + 自动替换', '工具名前缀 {server_name}_{tool_name} 防命名冲突', '工具缓存按 mtime 检查过期 + 自定义拦截器注入'],
    reading: '03-core-modules/05-mcp.md',
  },
  {
    id: 'memory', number: 6, icon: '💾', title: '记忆系统',
    subtitle: 'Memory — 三层持久化记忆',
    category: 'core',
    description: '三层记忆架构：短期记忆（Thread State 对话上下文，单次对话生命周期）、长期记忆（FileMemoryStorage JSON 文件，按 user_id/agent_name 分片跨会话持久化）、工作区记忆（Sandbox 文件系统）。支持 LLM 驱动的记忆整合、防抖更新和 confidence 置信度评分。',
    keyConcepts: ['三层记忆：短期（ThreadState）/ 长期（FileMemoryStorage）/ 工作区（Sandbox 文件系统）', 'MemoryUpdateQueue 防抖：按 (thread_id, user_id, agent_name) 去重，debounce_seconds 合并', 'MemoryUpdater：LLM 同步调用分析对话，更新 user/history 摘要和 facts 列表', '事实三种类型：context（上下文）/ preference（偏好）/ correction（纠错）', '记忆数据结构：version/lastUpdated/user/workContext/history/facts 含 confidence', 'max_facts 限制 + 低 confidence 自动淘汰 + 重复检测'],
    reading: '03-core-modules/06-memory.md',
  },
  {
    id: 'context', number: 7, icon: '📐', title: '上下文工程',
    subtitle: 'Context Engineering — Token 预算管理',
    category: 'core',
    description: '上下文工程解决 Agent 系统的三个核心挑战：上下文窗口限制、Token 成本控制、多轮对话信息衰减。通过 SummarizationMiddleware 自动压缩（阈值+比例可配置）、子代理上下文隔离（每个子代理仅见自身所需）和 Token 预算分配（System 15%/Session 60%/Turn 25%）来优化。',
    keyConcepts: ['SummarizationMiddleware：Token 阈值触发 + keep_tokens 保留近期 + trim_tokens 压缩', '子代理上下文隔离：每个子代理独立 SystemMessage/工具集/消息历史', 'Token 预算分层：System 15% / Session 60% / Turn 25%', '严格工具调用恢复：提供者中断后剥离元数据 + 注入占位结果', '信息衰减防护：全量渲染 ⇒ 摘要压缩 ⇒ 增量追加 ⇒ 淘汰旧消息', '过度压缩校验：压缩前后对核心事实做一致性检查'],
    reading: '03-core-modules/07-context-engineering.md',
  },
  {
    id: 'gateway', number: 8, icon: '🚪', title: 'Gateway API',
    subtitle: '网关 REST API — 服务接口层',
    category: 'integrate',
    description: 'FastAPI 网关提供 17 个路由模块，包括线程管理、消息处理、模型配置、技能管理、MCP 管理、文件上传等。支持 SSE 流式推送四类事件（metadata/values/messages/end）和 LangGraph SDK 兼容接口（/api/langgraph/* 路径重写）。应用启动时自动加载配置、初始化运行时和 IM 渠道。',
    keyConcepts: ['17 个路由模块：models/mcp/memory/skills/threads/runs/suggestions 等', 'SSE 流式四事件：metadata（元数据）/ values（状态快照）/ messages（消息增量）/ end（结束）', '三层网关中间件：AuthMiddleware → CSRFMiddleware → CORSMiddleware', 'LangGraph SDK 兼容：/api/langgraph/* 重写为 /api/*', '应用生命周期：startup（配置加载→运行时初始化→渠道启动）/ shutdown（5 秒超时清理）', '健康检查 GET /health + runs/thread_runs 双模式（有状态/无状态）'],
    reading: '03-core-modules/08-gateway-api.md',
  },
  {
    id: 'im-channels', number: 9, icon: '💬', title: 'IM 渠道',
    subtitle: '即时通讯集成 — 多渠道接入',
    category: 'integrate',
    description: '支持 7 个 IM 平台集成：飞书、钉钉、企业微信、Discord、Slack、Telegram、WhatsApp。不同渠道使用不同的通信方式（长轮询、Socket Mode、WebSocket、Stream Push），每个渠道通过独立 Worker 运行。渠道的 assistant_id 可配置，支持路由到不同 Agent。',
    keyConcepts: ['7 个 IM 渠道：Telegram/Slack/飞书/企业微信/微信/钉钉/Discord', '多通信方式：长轮询（Telegram）/ Socket Mode（Slack）/ WebSocket（飞书/钉钉/Discord）', '渠道 Worker 独立运行 + 内部消息总线 Pub/Sub', 'assistant_id 可配置路由：lead_agent 或自定义 Agent', '会话命令：/new（新对话）/ /status（线程状态）/ /models（模型列表）/ /memory（记忆）', '会话生命周期管理：跨会话恢复 + 超时清理'],
    reading: '03-core-modules/09-im-channels.md',
  },
  {
    id: 'frontend', number: 10, icon: '🖥️', title: '前端应用',
    subtitle: 'Next.js 16 + React 19 — 用户界面',
    category: 'core',
    description: '前端基于 Next.js 16 App Router，使用 React 19 新特性。技术栈包括 TypeScript、Tailwind CSS、TanStack Query、LangGraph SDK。核心目录 src/core/ 包含 24 个业务模块：线程/消息/模型/技能/记忆/MCP/文件上传等。流式 Markdown 渲染由 streamdown 模块处理，支持代码块、数学公式的增量 DOM 更新。',
    keyConcepts: ['Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS', 'SSE 流式渲染：streamdown 模块增量更新 DOM + 代码块/数学公式支持', 'core/ 24 个业务模块：threads/api/mcp/memory/skills/messages/models/todos 等', 'LangGraph SDK 客户端 + TanStack Query 状态管理', '消息格式化：AI 消息 vs 用户消息 + 工具调用展示 + 图片/文件嵌入', '验证体系：Vitest 单元测试 + Playwright E2E + pnpm lint && pnpm typecheck'],
    reading: '03-core-modules/10-frontend.md',
  },
];

export const categoryLabels: Record<string, string> = {
  core: '核心模块',
  integrate: '集成模块',
  extend: '扩展模块',
};
