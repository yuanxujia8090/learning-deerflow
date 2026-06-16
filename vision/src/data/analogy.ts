export interface AnalogyPair {
  frontend: string;
  deerflow: string;
  explanation: string;
  category: string;
}

export const analogyList: AnalogyPair[] = [
  { frontend: 'React 组件树', deerflow: '中间件管道', explanation: '组件层层嵌套包装，中间件也层层处理请求和响应', category: '架构模式' },
  { frontend: 'Redux Store / Zustand', deerflow: 'ThreadState', explanation: '统一的状态管理器，使用 reducer 更新规则', category: '状态管理' },
  { frontend: 'Redux 中间件（thunk/saga）', deerflow: 'Agent 中间件', explanation: '拦截 dispatch → 异步处理 → 放行或修改', category: '架构模式' },
  { frontend: 'Express/Koa 中间件', deerflow: '中间件管道', explanation: '洋葱模型，before_agent 入栈 / after_agent 出栈', category: '架构模式' },
  { frontend: 'React Context', deerflow: 'Sub-Agent 隔离上下文', explanation: '每个子代理有自己的 Provider，数据不互相污染', category: '数据隔离' },
  { frontend: 'Docker Compose', deerflow: 'Sandbox 沙箱', explanation: '隔离的执行环境，保证安全和一致性', category: '执行环境' },
  { frontend: 'Vite 插件', deerflow: 'MCP 服务', explanation: '可插拔的扩展能力，通过标准协议集成', category: '扩展机制' },
  { frontend: 'localStorage', deerflow: '长时记忆', explanation: '跨会话持久化存储，但 DeerFlow 更结构化', category: '持久化' },
  { frontend: 'TypeScript 类型', deerflow: 'Pydantic 模型', explanation: '运行时类型校验和序列化/反序列化', category: '类型系统' },
  { frontend: 'Webpack Loader', deerflow: '技能系统', explanation: '链式处理、按需加载、可配置', category: '扩展机制' },
  { frontend: 'Next.js API Routes', deerflow: 'Gateway API 路由', explanation: '服务端 API 定义，路由分发', category: 'API 设计' },
  { frontend: 'Nginx 反向代理', deerflow: 'Nginx', explanation: '路由转发、负载均衡、统一入口', category: '基础设施' },
  { frontend: 'CI/CD Pipeline', deerflow: 'LangGraph 代理流程', explanation: '有向图编排，步骤可组合、可分支', category: '流程编排' },
  { frontend: 'React Hooks（useEffect）', deerflow: 'after_agent 中间件', explanation: '副作用处理，在渲染/执行后执行', category: '生命周期' },
  { frontend: 'Error Boundary', deerflow: 'ToolErrorHandlingMiddleware', explanation: '错误捕获与兜底，防止崩溃扩散', category: '错误处理' },
  { frontend: '微前端 Module Federation', deerflow: 'MCP + ACP Agents', explanation: '跨进程、跨语言扩展能力', category: '扩展机制' },
  { frontend: 'React.lazy + Suspense', deerflow: '渐进式技能加载', explanation: '按需加载资源，减少初始加载体积', category: '性能优化' },
];

export const categoryOrder = ['架构模式', '状态管理', '数据隔离', '执行环境', '扩展机制', '持久化', '类型系统', 'API 设计', '基础设施', '流程编排', '生命周期', '错误处理', '性能优化'];
