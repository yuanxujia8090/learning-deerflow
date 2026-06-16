# 前端架构

## 技术栈

| 领域 | 技术选型 |
|------|----------|
| 框架 | Next.js 16 |
| UI 库 | React 19 |
| 类型系统 | TypeScript |
| 包管理 | pnpm |
| 测试 | Vitest + Playwright |
| 样式 | Tailwind CSS |
| 代码规范 | ESLint + Prettier |
| 认证 | Better Auth |

## 目录结构

```typescript
frontend/src/
├── app/                    // Next.js 页面
│   ├── (auth)/            // 认证页面布局
│   ├── [lang]/            // 国际化路由
│   │   └── page.tsx       // 聊天主页面
│   ├── api/               // Next.js API 路由
│   ├── blog/              // 博客页面
│   ├── layout.tsx         // 根布局
│   └── workspace/         // 工作区页面

├── components/             // React 组件
│   ├── ai-elements/       // AI 相关 UI（消息气泡、流式文本）
│   ├── landing/           // 着陆页组件
│   ├── ui/                // 通用 UI 组件库
│   ├── workspace/         // 工作区布局
│   ├── query-client-provider.tsx  // TanStack Query
│   └── theme-provider.tsx // 主题切换

├── core/                  // 业务逻辑（24 个模块）
│   ├── agents/           // Agent 配置管理
│   ├── api/              // API 客户端
│   ├── artifacts/        // 文件下载
│   ├── auth/             // 认证逻辑
│   ├── config/           // 前端配置
│   ├── i18n/             // 国际化
│   ├── mcp/              // MCP 管理（UI 侧）
│   ├── memory/           // 记忆查看/管理
│   ├── messages/         // 消息格式化
│   ├── models/           // 模型选择
│   ├── settings/         // 用户设置
│   ├── skills/           // 技能管理
│   ├── streamdown/       // 流式 Markdown
│   ├── threads/          // 线程 CRUD
│   ├── todos/            // 任务列表
│   ├── tools/            // 工具 UI
│   ├── uploads/          // 文件上传
│   └── utils/            // 通用工具

├── hooks/                // 自定义 React Hooks
├── lib/                  // 第三方库配置
├── styles/               // 样式文件
└── typings/              // TypeScript 类型声明
```

## 核心数据流（前端视角）

```
用户输入消息
    ↓
core/threads/  ← 创建/获取线程
core/api/      ← API 请求
    ↓
Gateway API (8001)
    ↓
SSE 流式事件
    ↓
core/streamdown/  ← 流式 Markdown 渲染
    ↓
components/ai-elements/  ← 消息气泡 UI
```

## 关键业务模块详解

### 线程管理（core/threads/）
- 类似于聊天会话管理
- CRUD 操作：创建、读取、列出、删除
- 状态管理：当前线程、历史列表、加载状态

### API 客户端（core/api/）
- fetch 封装
- 认证 token 注入
- 错误处理
- 请求取消

### 流式渲染（core/streamdown/）
- 流式 Markdown 解析与渲染
- 增量更新 DOM
- 支持代码块、数学公式等

### 消息格式化（core/messages/）
- 按消息类型渲染不同 UI
- AI 消息 vs 用户消息
- 工具调用展示
- 图片/文件嵌入

## 构建与验证

```bash
# 开发
pnpm dev

# 检查
pnpm lint && pnpm typecheck

# 测试
pnpm test           # 单元测试
pnpm test:e2e       # E2E 测试

# 构建
BETTER_AUTH_SECRET=local-dev-secret pnpm build
```

## 关键文件

```typescript
frontend/
├── next.config.js         // Next.js 配置
├── tailwind.config.js     // Tailwind 配置
├── tsconfig.json          // TypeScript 配置
├── vitest.config.ts       // Vitest 配置
├── playwright.config.ts   // Playwright 配置
├── eslint.config.js       // ESLint 配置
└── package.json           // 依赖管理
```


---

## 复习习题

1. （初级）前端技术栈使用了哪些主要技术？框架、UI 库、测试工具分别是什么？
2. （中级）`core/` 目录下有哪些业务模块？其中 `streamdown/` 模块的核心职责是什么？
3. （中级）前端的 SSE 流式消息处理流程是怎样的？从用户输入到消息渲染的完整路径是什么？
4. （高级）参考材料提到前端通过 EventSource 连接到 LangGraph Server 的 SSE 端点。如果连接意外断开，前端应该如何实现重连机制？重连后如何处理可能丢失的消息片段？
