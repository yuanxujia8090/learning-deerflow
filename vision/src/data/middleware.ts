export interface MiddlewareData {
  number: number;
  name: string;
  phase: 'before' | 'both' | 'after';
  description: string;
  purpose: string;
  configExample?: string;
}

export const middlewareList: MiddlewareData[] = [
  {
    number: 1, name: 'ThreadDataMiddleware', phase: 'before',
    description: '初始化工作区、上传目录和输出目录。将虚拟路径 /mnt/user-data/ 映射到物理磁盘路径，确保每个线程有独立的文件空间。',
    purpose: '为每次请求准备隔离的工作目录结构（uploads/workspace/outputs），避免不同会话和线程之间的文件冲突。类似于为每个对话分配独立的临时工作区，Agent 创建的文件、用户上传的资源都存储在此目录下，请求结束后可选择性保留或清理。',
  },
  {
    number: 2, name: 'UploadsMiddleware', phase: 'before',
    description: '处理用户上传的文件，将文件复制到当前线程的工作区目录中。支持图片、文档、代码文件等多种格式的自动检测和分类。',
    purpose: '将用户附件纳入 Agent 可访问的沙箱文件系统，使 LLM 能通过 read/view_image 等工具读取上传内容。支持多文件上传，文件元数据（名称、大小、类型）被记录到 ThreadState.uploaded_files 中供后续处理引用。',
  },
  {
    number: 3, name: 'SandboxMiddleware', phase: 'before',
    description: '获取或初始化沙箱环境。支持 lazy_init 参数控制是否按需创建沙箱实例，避免为无需代码执行的请求浪费资源。',
    purpose: '确保 Agent 有可用的安全代码执行环境。lazy_init=true 时仅在 Agent 首次调用沙箱工具时才获取沙箱，适用于简单对话场景节省 Docker 容器/K8s Pod 资源。lazy_init=false 时预分配沙箱，适用于明确需要代码执行的任务。根据 sandbox provider 类型（Local/Docker/K8s）自动切换初始化策略。',
    configExample: 'sandbox:\n  lazy_init: true\n  mode: local',
  },
  {
    number: 4, name: 'SummarizationMiddleware', phase: 'before',
    description: '当上下文 Token 数超出阈值时自动压缩早期历史消息。通过 LLM 对旧消息进行智能摘要，保留关键决策和事实。',
    purpose: '防止上下文窗口溢出导致 LLM 推理失败。策略是保留最近的 keep_tokens 条消息全分辨率访问，对超出 trim_tokens 阈值的早期消息调用 LLM 做摘要压缩。Token 预算采用分层分配：System 15%/Session 60%/Turn 25%，确保各层上下文都能得到合理利用。',
    configExample: 'context:\n  threshold_tokens: 8000\n  compression_ratio: 0.5',
  },
  {
    number: 5, name: 'TitleMiddleware', phase: 'after',
    description: '在用户发送首条（或前几条）消息后，自动调用 LLM 从对话内容中提取主题并生成简洁的对话标题。',
    purpose: '提升对话列表的浏览和检索体验，避免显示空标题或默认"新对话"。标题存储在 ThreadState.title 字段中，并在前端对话侧边栏展示。标题生成仅触发一次（检测到 title 为空时），后续消息不会重复生成。',
  },
  {
    number: 6, name: 'TodoListMiddleware', phase: 'both',
    description: '维护和管理 Agent 的任务列表（todos）。before_agent 阶段注入待办事项作为上下文，after_agent 阶段收集新的任务项。',
    purpose: '支持 Agent 的"计划模式"工作流，让 LLM 能自主将复杂需求拆解为可追踪的子任务并在执行过程中标记进度。Task 列表通过 ThreadState.todos 传递，使用 merge_todos reducer（最后非空值胜出）处理并发更新。类似项目管理中的 Checklist 机制，提升长任务的可视化和可控性。',
  },
  {
    number: 7, name: 'ViewImageMiddleware', phase: 'before',
    description: '将用户上传的图片转换为视觉模型可接收的格式（base64 编码或 URL 引用），并注入到消息上下文中。',
    purpose: '当使用支持视觉能力的模型（如 GPT-4o、Claude 3.5 Sonnet）时，自动将 uploaded_files 中的图片数据封装为标准的多模态消息格式。非视觉模型运行时自动跳过此中间件，避免不必要的编码开销。图片数据暂存在 ThreadState.viewed_images 中，通过 merge_viewed_images reducer 去重合并。',
  },
  {
    number: 8, name: 'ClarificationMiddleware', phase: 'before',
    description: '检测用户输入是否意图模糊或缺少关键信息。如果检测到歧义，触发 LLM 生成澄清问题向用户确认。',
    purpose: '在 Agent 消耗资源和执行长任务之前先确认用户意图，减少误解和无效执行。此中间件必须位于管道最后一位（优先级最低），确保其他中间件已完成上下文注入后再进行意图判断。类似于用户体验中的确认对话框，避免"猜错用户想做什么"带来的负面体验。',
  },
  {
    number: 9, name: 'DeferredToolFilterMiddleware', phase: 'before',
    description: '对 LLM 选择性"隐藏"一部分已注册的工具，使其在 LLM 的 tool_choice 不可见，但工具仍保留在 ToolNode 中可供其他工具内部调用。',
    purpose: '减少 LLM 的工具选择空间，降低决策复杂度，防止 LLM 在不恰当的时机选择某些重量级工具。被隐藏的工具仍可通过其他工具的返回结果间接触发。例如：某些 MCP 工具仅作为其他工具的依赖而非直接对 LLM 暴露，避免 LLM 绕过设计好的工作流直接调用底层工具。',
  },
  {
    number: 10, name: 'SandboxAuditMiddleware', phase: 'before',
    description: '对沙箱中即将执行的 bash 命令进行安全审计分级。按危险程度将命令分为 allow（放行）、warn（弹窗确认）、block（直接拦截）三个等级。',
    purpose: '在 LocalSandbox 模式下提供关键安全防线，防止恶意或误操作命令（如 rm -rf /、高危系统调用）在宿主机上执行。block 级别的命令直接抛出异常阻止执行，warn 级别的命令返回提示要求用户确认。在 Docker/K8s 沙箱模式下审计策略可适当放宽，因为容器提供了额外隔离层。命令风险等级通过正则规则库匹配判断。',
  },
  {
    number: 11, name: 'LLMErrorHandlingMiddleware', phase: 'after',
    description: '捕获 LLM 模型调用过程中的异常（超时、限流、模型不可用等），根据错误类型执行重试或降级到备用模型。',
    purpose: '提高系统在面对模型服务不稳定时的鲁棒性。当主模型返回 429（限流）或 503（不可用）时自动切换到备用模型继续执行，而非直接向前端返回错误。重试次数和降级策略可通过 config.yaml 配置，支持指数退避。同时记录错误日志供 LangSmith/Langfuse 追踪。',
  },
  {
    number: 12, name: 'ToolErrorHandlingMiddleware', phase: 'after',
    description: '捕获工具执行过程中的异常（文件不存在、API 调用失败、权限不足等），将异常信息转换为 LLM 可理解的自然语言错误描述。',
    purpose: '类似前端 Error Boundary 的概念，防止单个工具调用异常导致整个 Agent 执行链崩溃。捕获异常后以 ToolMessage 形式返回错误描述给 LLM，让 LLM 决定是重试、换一种方式还是如实告知用户。这样可以保持 Agent 执行的连续性，而非在第一次工具错误时就终止整个任务。',
  },
  {
    number: 13, name: 'LoopDetectionMiddleware', phase: 'after',
    description: '监控 LLM 的工具调用模式，当检测到 LLM 反复调用同一工具或工具序列形成循环时触发中断。',
    purpose: '防止 Agent 陷入工具调用死循环，浪费 Token 和时间。循环检测策略包括：监测同一工具连续调用次数上限、检测工具调用序列的重复模式。触发中断后将循环检测结果注入消息上下文，提示 LLM 改变策略或直接终止当前运行。此中间件的配置参数（如最大循环次数）可在 config.yaml 中调整。',
  },
  {
    number: 14, name: 'MemoryUpdateQueue', phase: 'after',
    description: '将对话内容排入异步记忆更新队列。队列按 (thread_id, user_id, agent_name) 去重，防抖合并短时间内的多次更新请求。',
    purpose: '避免每次对话结束都立即调用 LLM 做记忆分析的高 Token 消耗。防抖机制（debounce_seconds 可配置）合并密集更新，0.5 秒处理间隔批量消费队列。MemoryUpdater 使用同步 LLM 调用分析新对话内容，提取 facts（context/preference/correction 三种类型），更新 user 摘要和 history 分层记录。最终写入 FileMemoryStorage 持久化。',
  },
];

export type MiddlewareFilter = 'all' | 'before' | 'after' | 'both';
