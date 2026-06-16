# 长时记忆系统

## 前端视角理解

类比 **localStorage + IndexedDB + Service Worker**：

- **LocalStorage** = 简单键值对 → 类比记忆的 facts
- **IndexedDB** = 结构化存储 → 类比记忆的 user/history 摘要
- **Service Worker** = 后台同步 → 类比 MemoryUpdateQueue 防抖更新
- **Clear Site Data** = 清除记忆

或者类比 **浏览器的自动填充（Autofill）**：
- 记住你的偏好（语言、主题）
- 记住你的信息（地址、电话）
- 跨会话持久化

## 记忆架构

```
用户消息
    ↓
MemoryMiddleware
    ├── 检查是否启用
    ├── 过滤：只保留用户输入 + 助手纯文本
    ├── 移除：工具调用、上传块
    └── 检测：纠错/强化信号
        ↓
MemoryUpdateQueue（防抖队列）
    ├── 按 (thread_id, user_id, agent_name) 去重
    ├── 可配置 debounce_seconds
    └── 处理间隔 0.5s
        ↓
MemoryUpdater（LLM 驱动的更新器）
    ├── 使用同步 model.invoke()
    ├── 若在事件循环中 → 用 ThreadPoolExecutor
    └── _apply_updates()
        ↓
MemoryStorage（持久化）
    └── FileMemoryStorage（JSON 文件）
        └── 每个 (user_id, agent_name) 一条记录
```

## 记忆数据结构

```json
{
  "version": "1.0",
  "lastUpdated": "2025-01-01T00:00:00Z",
  "user": {
    "workContext": {
      "summary": "前端开发，React 专家",
      "updatedAt": "2025-01-01T00:00:00Z"
    },
    "personalContext": {
      "summary": "喜欢简洁优雅的代码",
      "updatedAt": "2025-01-01T00:00:00Z"
    },
    "topOfMind": {
      "summary": "正在研究 AI Agent",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  },
  "history": {
    "recentMonths": { "summary": "...", "updatedAt": "..." },
    "earlierContext": { "summary": "...", "updatedAt": "..." },
    "longTermBackground": { "summary": "...", "updatedAt": "..." }
  },
  "facts": [
    {
      "id": "uuid",
      "content": "用户使用 Mac + VSCode",
      "category": "context",
      "confidence": 0.95,
      "createdAt": "2025-01-01T00:00:00Z",
      "source": "thread_xxx"
    }
  ]
}
```

## 事实类型

| 分类 | 说明 | 示例 |
|------|------|------|
| context | 上下文信息 | 用户使用 React 18 |
| preference | 偏好 | 用户喜欢 TypeScript |
| correction | 纠错 | 用户更正了技术栈信息 |

## 防抖机制

```python
# 类比：React 中的 debounce hook
class MemoryUpdateQueue:
    debounce_seconds: int  # 默认值可配置
    # 如果 5 秒内重复请求 → 合并为一次更新
    # 避免频繁调用 LLM 做记忆更新
```

## 记忆加载流程

```
1. 对话开始时
        ↓
2. MemoryMiddleware.before_agent()
   ├── 读取 当前 (user_id, agent_name) 的记忆
   ├── 格式化为 Context 注入系统提示词
   └── 例如："关于用户的信息：..."
        ↓
3. 对话结束时
        ↓
4. MemoryMiddleware.after_agent()
   ├── 提取新信息（用户说了什么）
   ├── 确认不是纠正/强化
   └── 排入更新队列
        ↓
5. MemoryUpdater
   ├── 调用 LLM 分析：哪些信息值得记住？
   ├── 更新 user/history 摘要
   ├── 添加/移除 facts
   └── 按 max_facts 截断
        ↓
6. FileMemoryStorage.save()
   └── 写回 JSON 文件
```

## 记忆的"忘记"机制

- `max_facts` 限制：超过上限时，低 confidence 的事实先被淘汰
- 纠错信号：用户明确的更正会提高或降低 confidence
- 重复检测：重复的事实不会累积

## 关键源码路径

```python
backend/packages/harness/deerflow/agents/memory/
├── memory_middleware.py    # 记忆中间件（切入 Agent 生命周期）
├── queue.py                # 防抖更新队列（MemoryUpdateQueue）
├── updater.py              # LLM 驱动的记忆更新器（MemoryUpdater）
├── storage.py              # 记忆存储抽象 + 文件实现
├── prompt.py               # 记忆更新提示词
├── types.py                # 类型定义
└── config.py               # 记忆配置
```

---

## 复习习题

1. （初级）DeerFlow 的记忆系统分为哪三个层次？各自使用什么存储机制？
2. （中级）MemoryUpdateQueue 的防抖机制是如何工作的？参数 `debounce_seconds` 值设得过小或过大会分别导致什么问题？
3. （中级）记忆数据中的 `confidence` 字段和 `verified` 字段分别表示什么？纠错信号（用户明确更正）如何影响这些值？
4. （高级）参考材料提到"记忆整合的摘要生成会消耗额外 Token"。在高频写入场景下，应该如何设计整合策略以避免阻塞主 Agent 的响应时间？
5. （高级）企业级场景中，记忆按租户/项目隔离是如何实现的？如果缺乏隔离机制，一个用户的操作会如何影响另一个用户的体验？
