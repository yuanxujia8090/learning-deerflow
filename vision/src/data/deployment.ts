export interface DeployMode {
  id: string;
  name: string;
  icon: string;
  description: string;
  pros: string[];
  cons: string[];
  scenario: string;
}

export const deployModes: DeployMode[] = [
  {
    id: 'dev', name: '本地开发模式', icon: '💻',
    description: '直接在本地运行所有服务，使用 make dev 一键启动。前端、Gateway、LangGraph Server 分别在不同端口运行。',
    pros: ['启动最快，适合开发调试', '配置简单，无需额外基础设施', '支持热重载'],
    cons: ['不具备生产隔离性', '资源受限于单机', '不适合团队协作'],
    scenario: '个人开发、功能验证、调试排查',
  },
  {
    id: 'docker', name: 'Docker 部署', icon: '🐳',
    description: '使用 Docker Compose 编排所有服务。支持 docker-start（开发）和 docker-up（生产）两种模式。',
    pros: ['环境一致性', '易于水平扩展', '支持 CI/CD 集成'],
    cons: ['需要 Docker 环境', '编排复杂度增加', '资源开销略高'],
    scenario: '小团队部署、测试环境、预发布验证',
  },
  {
    id: 'kubernetes', name: 'Kubernetes 集群', icon: '☸️',
    description: '完整的 K8s 部署方案。包含 Gateway、LangGraph Server、Sandbox（通过 Provisioner 按需启动 Pod）、PostgreSQL、Redis 等组件。',
    pros: ['弹性伸缩', '高可用性', '完善的监控和日志', '多租户支持'],
    cons: ['运维复杂度高', '需要 K8s 专业团队', '资源消耗较大'],
    scenario: '生产环境、企业级部署、多租户场景',
  },
  {
    id: 'embedded', name: '嵌入模式', icon: '🔌',
    description: '将 DeerFlow 作为 Python 库嵌入到现有应用中。使用 DeerFlowClient 直接在代码中调用 Agent。',
    pros: ['集成成本最低', '无需额外网络部署', '可深度定制'],
    cons: ['与宿主应用强耦合', '共享进程资源', '升级需同步'],
    scenario: '已有 Python 应用集成、内部工具链、自动化流程',
  },
];

export interface RBACRole {
  name: string;
  permissions: string[];
  description: string;
}

export const rbacRoles: RBACRole[] = [
  {
    name: '管理员',
    permissions: ['全部 Agent 操作', '全部数据操作', '系统配置管理', '用户管理', '审批操作'],
    description: '拥有系统最高权限，可管理所有 Agent、数据和用户。',
  },
  {
    name: '开发者',
    permissions: ['创建/编辑 Agent', '调试和测试', '查看日志', '管理自己的工具'],
    description: '可开发和调试 Agent，但不能修改系统配置或管理其他用户。',
  },
  {
    name: '操作员',
    permissions: ['使用 Agent', '查看对话历史', '导出数据'],
    description: '日常使用 Agent 的普通用户，不能修改 Agent 配置。',
  },
  {
    name: '审计员',
    permissions: ['查看所有日志', '审计追踪', '只读访问'],
    description: '只读权限，用于合规审计和安全检查。',
  },
];

export const dataIsolationLevels = [
  { level: '数据库级', desc: '不同租户使用不同数据库/表', security: '⭐⭐⭐', complexity: '⭐⭐⭐' },
  { level: '文件系统级', desc: '不同租户的文件存储在不同路径', security: '⭐⭐', complexity: '⭐' },
  { level: '向量命名空间', desc: '向量数据库中使用不同 namespace', security: '⭐⭐', complexity: '⭐⭐' },
  { level: '应用层过滤', desc: '所有数据共享存储，应用层加 WHERE 条件', security: '⭐', complexity: '⭐⭐' },
];

export interface AuditEntry {
  time: string;
  user: string;
  action: string;
  resource: string;
  result: string;
  signature: string;
}

export const auditEntries: AuditEntry[] = [
  { time: '2025-06-17 10:23:15', user: 'admin', action: 'config.update', resource: 'config.yaml', result: '成功', signature: 'a1b2c3d4...' },
  { time: '2025-06-17 10:20:00', user: 'dev-user', action: 'agent.execute', resource: 'thread/abc-123', result: '成功', signature: 'e5f6g7h8...' },
  { time: '2025-06-17 09:15:30', user: 'dev-user', action: 'tool.install', resource: 'skill/web-search', result: '成功', signature: 'i9j0k1l2...' },
  { time: '2025-06-16 22:05:00', user: 'system', action: 'sandbox.provision', resource: 'sandbox/node-5', result: '失败-资源不足', signature: 'm3n4o5p6...' },
  { time: '2025-06-16 18:30:45', user: 'auditor', action: 'audit.export', resource: 'logs/2025-06', result: '成功', signature: 'q7r8s9t0...' },
];
