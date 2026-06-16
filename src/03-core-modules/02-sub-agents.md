# 子代理系统（Sub-Agents）

## 前端视角理解

类比微前端架构中的子应用加载：

- **主导代理** = 主应用容器
- **子代理** = 独立加载的子应用（微前端概念）
- **task 工具** = 路由分发
- **子代理结果** = 子应用返回值

或者类比为 **Map/Reduce**：
- Map 阶段：主导代理将任务拆解，派发给多个子代理并行执行
- Reduce 阶段：主导代理收集子代理结果，综合产出

## 为什么需要子代理？

复杂任务往往无法在一个上下文中完成。比如：

```
"帮我研究 AI Agent 领域的最新论文"
          ↓
主导代理分解任务：
  ├── 子代理A：arXiv 论文检索
  ├── 子代理B：Twitter/X 趋势分析  ← 并行执行
  └── 子代理C：GitHub 热门项目
          ↓
主导代理综合三份报告 → 输出完整分析
```

## 子代理配置

```python
class SubagentConfig:
    name: str                     # 唯一标识符
    description: str              # 用途说明（LLM 选择依据）
    system_prompt: str | None     # 自定义提示词
    tools: list[str] | None       # 允许的工具（None=全部）
    disallowed_tools: list[str]   # 禁用的工具（默认排除 ["task"]）
    skills: list[str] | None      # 技能加载（None=继承全部，[]=无）
    model: str                    # 模型（"inherit"或显式名称）
    max_turns: int                # 最大轮次（默认 50）
    timeout_seconds: int          # 超时（默认 900）
```

## 执行引擎 — SubagentExecutor

```
execute(task, result_holder)
        ↓
_load_skills()                ← 加载子代理特定技能
        ↓
_load_skill_messages()        ← 技能注入为 SystemMessage
        ↓
_build_initial_state()        ← 构建初始状态（过滤工具）
        ↓
agent.astream()               ← 异步流式执行
        ↓
结果收集 → SubagentResult

支持：
- 同步执行（检测事件循环，自动切换）
- 异步后台执行（线程池）
- 取消（CancelEvent）
- Token 使用追踪
```

## SubagentResult

```python
class SubagentResult:
    task_id: str                # 任务 ID
    trace_id: str               # 追踪 ID
    status: SubagentStatus      # 状态（running/success/failed/timed_out/cancelled）
    result: str | None          # 最终文本
    error: str | None           # 失败原因
    ai_messages: list[dict]     # AI 消息收集
    token_usage_records: list   # Token 使用记录
    cancel_event: Event         # 取消信号
```

## 内置子代理

| 名称 | 用途 | 特点 |
|------|------|------|
| general-purpose | 通用任务 | 大部分工具可用，排除 task |
| basher | Bash 执行 | 需要沙箱 bash 支持 |

## 子代理生命周期

1. **创建** — `SubagentExecutor` 初始化运行环境
2. **执行** — 在独立上下文中运行，隔离主导代理的上下文
3. **结果收集** — 实时收集 `ai_messages`
4. **超时/取消** — 安全终止
5. **资源回收** — 清理临时数据

## 关键源码路径

```python
backend/packages/harness/deerflow/subagents/
├── config.py           # SubagentConfig 定义
├── executor.py         # SubagentExecutor 执行引擎
├── registry.py         # 代理注册表
└── builtins/           # 内置子代理定义
```

---

## 复习习题

**1. （初级）** `SubagentConfig` 中的 `tools` 和 `disallowed_tools` 字段分别代表什么？它们的优先级关系是怎样的？

**2. （中级）** 参考材料中提到 Sub-Agent 的取消是"协作式"的，这是什么意思？在什么边界条件下检查取消信号？

**3. （中级）** `SubagentExecutor` 使用双线程池架构（`scheduler_pool` + `execution_pool`）的目的是什么？为什么不使用单线程池？

**4. （高级）** 生产环境中为什么推荐设置 `disallowed_tools=["task"]`？如果不设置会导致什么风险？
