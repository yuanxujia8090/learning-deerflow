import { type Node, type Edge, MarkerType } from '@xyflow/react';

export type Layer = 'entry' | 'infra' | 'runtime' | 'agent' | 'data';

export interface ArchData {
  number: number;
  icon: string;
  label: string;
  subtitle: string;
  layer: Layer;
  description: string;
  details: string[];
}

export const layerColors: Record<Layer, { bg: string; border: string; glow: string }> = {
  entry:   { bg: 'from-cyan-600/40 to-blue-700/30', border: 'border-cyan-500/50', glow: 'shadow-cyan-500/20' },
  infra:   { bg: 'from-teal-600/40 to-emerald-700/30', border: 'border-teal-500/50', glow: 'shadow-teal-500/20' },
  runtime: { bg: 'from-violet-600/40 to-purple-700/30', border: 'border-violet-500/50', glow: 'shadow-violet-500/20' },
  agent:   { bg: 'from-orange-600/40 to-amber-700/30', border: 'border-orange-500/50', glow: 'shadow-orange-500/20' },
  data:    { bg: 'from-pink-600/40 to-rose-700/30', border: 'border-pink-500/50', glow: 'shadow-pink-500/20' },
};

export const layerLabels: Record<Layer, string> = {
  entry: '用户入口', infra: '基础设施', runtime: '代理运行时',
  agent: 'Agent 核心', data: '数据层',
};

export const nodePositions: Record<string, { x: number; y: number }> = {
  '1':  { x: 460, y: 0 },
  '2':  { x: 460, y: 100 },
  '3':  { x: 240, y: 200 },
  '4':  { x: 680, y: 200 },
  '5':  { x: 460, y: 310 },
  '6':  { x: 460, y: 430 },
  '7':  { x: 180, y: 540 },
  '8':  { x: 360, y: 540 },
  '9':  { x: 540, y: 540 },
  '10': { x: 720, y: 540 },
  '11': { x: 180, y: 660 },
};

export const nodeInfo: Record<string, ArchData> = {
  '1': {
    number: 1, icon: '🌐', label: '浏览器', subtitle: '用户访问入口',
    layer: 'entry',
    description: '用户通过浏览器访问 DeerFlow 系统，支持 Chat 界面、模型选择、技能管理和记忆管理。前端基于 Next.js 16 + React 19 + TypeScript，提供响应式布局和多端支持。',
    details: ['Next.js 16 + React 19 + TypeScript', 'SSE 流式消息实时渲染（EventSource / ReadableStream）', '模型/技能/对话管理 UI', '响应式布局，支持桌面和移动端', '通过 LangGraph SDK 的 stream() 方法建立持久连接', 'core/ 目录下 24 个业务逻辑模块（线程/消息/模型/记忆等）'],
  },
  '2': {
    number: 2, icon: '🔀', label: 'Nginx', subtitle: '反向代理 (:2026)',
    layer: 'entry',
    description: '统一流量入口，根据请求路径将流量路由到对应的后端服务。DeerFlow 的前端、Gateway API 和 LangGraph 运行时都通过 Nginx 统一暴露。',
    details: ['/* → 前端静态资源 (:3000)', '/api/* → Gateway API (:8001)', '/api/langgraph/* 重写为 /api/* 兼容 LangGraph SDK', 'SSL 终止和负载均衡', '统一 2026 端口对外暴露，后端服务不直接暴露'],
  },
  '3': {
    number: 3, icon: '🖥️', label: '前端应用', subtitle: 'Next.js (:3000)',
    layer: 'infra',
    description: '基于 Next.js 16 的服务端渲染前端应用，提供完整的用户界面和管理控制台。使用新式 React 19 特性，支持流式渲染和增量数据加载。',
    details: ['React 19 + TypeScript + Tailwind CSS', 'SSE 实时流式消息渲染（streamdown 模块增量更新 DOM）', 'core/ 业务逻辑层：线程/MCP/记忆/技能/模型共 24 个模块', 'TanStack Query 管理服务端状态缓存', '模型配置 / 技能管理 / 文件上传界面', '使用 LangGraph SDK 的 stream() 方法连接后端'],
  },
  '4': {
    number: 4, icon: '🚪', label: 'Gateway API', subtitle: 'REST 网关 (:8001)',
    layer: 'infra',
    description: 'FastAPI 应用，提供 REST API 和 SSE 推送。包含 17 个路由模块，管理线程、消息、模型配置、技能、MCP、文件上传等。内嵌 Agent 运行时。',
    details: ['17 个路由模块：models/mcp/memory/skills/threads 等', '三层网关中间件：AuthMiddleware → CSRFMiddleware → CORSMiddleware', 'SSE 流式推送四种事件：metadata/values/messages/end', 'LangGraph SDK 兼容 API（/api/langgraph/* 路径重写）', '上传/下载/产物管理路由', '应用生命周期管理（startup 初始化 + shutdown 清理）'],
  },
  '5': {
    number: 5, icon: '⚙️', label: 'LangGraph Server', subtitle: '代理运行时 (:2024)',
    layer: 'runtime',
    description: 'LangGraph 兼容的代理运行时引擎，提供线程级状态管理、Agent 执行编排和 SSE 流式推送。兼容 LangGraph SDK 客户端，可供外部工具直接连接。',
    details: ['线程级状态管理 (ThreadState + checkpointer 检查点)', 'Agent 执行编排 (agent.astream 流式调用)', 'SSE 流式推送四种事件类型', '构建 RunRecord 运行记录 + RunContext 上下文', '支持中断节点配置和线程状态恢复', '兼容 LangGraph Python/JS SDK 直接连接'],
  },
  '6': {
    number: 6, icon: '🤖', label: 'Lead Agent', subtitle: '主导代理',
    layer: 'agent',
    description: '系统的核心智能体，通过 14 个中间件管道处理每个请求。负责意图识别、任务分解、工具选择、子代理委派和结果汇聚。基于 LangGraph 的 StateGraph 构建。',
    details: ['14 个中间件按优先级串联（ToolErrorHandling → Clarification）', 'make_lead_agent 工厂函数：解析配置 + 选择模型 + 组装中间件', 'ThreadState 扩展字段：messages/sandbox/artifacts/thread_data 等', 'Reducer 机制：merge_artifacts / merge_viewed_images / merge_todos', '三阶段模型选择：请求参数 > Agent 配置 > 全局默认', '子代理委派 + 工具选择 + 结果汇聚'],
  },
  '7': {
    number: 7, icon: '👷', label: 'Sub-Agents', subtitle: '子代理委派',
    layer: 'agent',
    description: '子代理系统允许 Lead Agent 将复杂任务委派给专门的子代理并行执行。使用双线程池架构（调度 + 执行），支持任务分解与结果合并。',
    details: ['双线程池架构（scheduler_pool 调度 + execution_pool 执行）', 'SubagentConfig 配置：model/tools/skills/max_turns/timeout 等', 'SubagentResult 五态管理：running/success/failed/timed_out/cancelled', '协作式取消机制（CancelEvent 信号检测）', '上下文隔离：子代理只能访问自身需要的工具和消息', '内置子代理：general-purpose（通用）、basher（Bash 专用）'],
  },
  '8': {
    number: 8, icon: '📦', label: 'Sandbox', subtitle: '沙箱执行环境',
    layer: 'agent',
    description: '安全的代码执行环境。支持 Docker 沙箱、本地沙箱和 Provisioner 模式三种。提供虚拟文件路径隔离、命令审计与安全扫描功能。',
    details: ['三种沙箱模式：Local（零配置）、Docker（容器隔离）、K8s Provisioner（水平扩展）', '虚拟路径映射：/mnt/user-data/ → uploads/workspace/outputs', '沙箱工具集：bash/read/write/str_replace/ls/glob/grep/view_image', 'SandboxAuditMiddleware 三等级：allow（放行）/warn（确认）/block（拦截）', '安全策略：Local 默认禁 bash，Docker 可执行，路径遍历检测', 'SandboxProvider 生命周期：acquire → get → release → reset → shutdown'],
  },
  '9': {
    number: 9, icon: '🧩', label: 'Skills', subtitle: '技能扩展系统',
    layer: 'agent',
    description: '技能系统提供可插拔的能力扩展。支持从远程仓库发现和安装技能、安全扫描（三色标：allow/warn/block）、渐进式按需加载。内置 21 个技能。',
    details: ['21 个内置技能：deep-research/report-generation/slide-creation 等', 'SKILL.md 定义：YAML 前置元数据 + Workflow 指令', '安全三色标扫描：allow（白名单工具）/warn（需确认）/block（拒绝加载）', '渐进式按需加载：类似 React.lazy，仅在使用时注入上下文', '技能加载流程：扫描目录 → 解析元数据 → 注入 SystemMessage → 工具过滤', 'allowed_tools 白名单控制每个技能可用的工具集'],
  },
  '10': {
    number: 10, icon: '🔗', label: 'MCP', subtitle: '协议集成',
    layer: 'agent',
    description: 'Model Context Protocol 集成，通过标准协议连接外部工具和服务。支持 SSE / Streamable HTTP / Stdio 三种传输方式，会话池 LRU 管理，OAuth Token 自动刷新。',
    details: ['三种传输：Stdio（本地进程 stdin/stdout）、SSE（远程长连接）、Streamable HTTP', '会话池 LRU 管理（max_size=256，跨事件循环自动替换）', 'OAuth Token 自动刷新（双重检查锁定模式）', '工具名前缀 {server_name}_{tool_name} 防命名冲突', '工具缓存按 mtime 检查过期（initialize_mcp_tools）', '支持自定义拦截器注入（token 刷新/请求预处理）'],
  },
  '11': {
    number: 11, icon: '💾', label: 'Memory', subtitle: '三层记忆系统',
    layer: 'data',
    description: '三层记忆系统：短期记忆（Thread State，对话上下文）、长期记忆（PostgreSQL Store，跨会话持久化）、工作区（Sandbox 文件系统）。支持向量搜索和记忆整合更新。',
    details: ['短期记忆：Thread State 上下文，生命周期=单次对话', '长期记忆：FileMemoryStorage JSON 文件，按 (user_id, agent_name) 分片', 'MemoryUpdateQueue 防抖机制（可配置 debounce_seconds）', 'LLM 驱动的 MemoryUpdater 提取和整合关键信息', '事实类型：context（上下文）/preference（偏好）/correction（纠错）', 'max_facts 限制 + 低 confidence 事实自动淘汰'],
  },
};

export const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#22d3ee', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#22d3ee' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#14b8a6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#14b8a6' } },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#14b8a6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#14b8a6' } },
  { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
  { id: 'e5-6', source: '5', target: '6', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  { id: 'e6-7', source: '6', target: '7', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  { id: 'e6-8', source: '6', target: '8', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  { id: 'e6-9', source: '6', target: '9', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  { id: 'e6-10', source: '6', target: '10', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  { id: 'e7-11', source: '7', target: '11', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ec4899' } },
  { id: 'e5-4b', source: '5', target: '4', animated: true, style: { stroke: '#a78bfa', strokeWidth: 1.5, strokeDasharray: '6 4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#a78bfa' } },
  { id: 'e4-2b', source: '4', target: '2', animated: true, style: { stroke: '#5eead4', strokeWidth: 1.5, strokeDasharray: '6 4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#5eead4' } },
];

export const legendItems: { label: string; color: string; layer: Layer }[] = [
  { label: '用户入口', color: '#06b6d4', layer: 'entry' },
  { label: '基础设施', color: '#14b8a6', layer: 'infra' },
  { label: '代理运行时', color: '#8b5cf6', layer: 'runtime' },
  { label: 'Agent 核心', color: '#f59e0b', layer: 'agent' },
  { label: '数据层', color: '#ec4899', layer: 'data' },
];

export type ArchNodeType = Node<ArchData & Record<string, unknown>, 'arch-node'>;

export function createArchNodes(): ArchNodeType[] {
  return Object.entries(nodeInfo).map(([id, data]) => ({
    id,
    type: 'arch-node' as const,
    position: nodePositions[id] ?? { x: 0, y: 0 },
    data: data as ArchData & Record<string, unknown>,
  }));
}
