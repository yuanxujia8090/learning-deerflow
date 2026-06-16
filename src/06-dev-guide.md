# 二次开发与封装指南

## 开发原则

1. **从 Harness 层入手**：核心框架在 `packages/harness/`，不依赖网关逻辑
2. **遵循分离边界**：`harness` 不能引用 `app`
3. **配置驱动**：用 `config.yaml` 控制行为，避免硬编码
4. **先单元，后集成**：写好测试再改代码

## 常见二次开发场景

### 场景一：添加自定义工具

**步骤：**

1. 在 `tools/builtins/` 下创建工具：

```python
# tools/builtins/my_tool.py
from langchain_core.tools import tool

@tool
def my_tool(param: str) -> str:
    """工具描述（LLM 理解用途）"""
    return f"处理结果: {param}"
```

2. 在 `config.yaml` 注册：

```yaml
tools:
  - name: my_tool
    display_name: 我的工具
    function: tools.builtins.my_tool:my_tool
    enabled: true
```

### 场景二：封装为独立服务

将 DeerFlow 嵌入到你的 Python 应用中：

```python
from deerflow.client import DeerFlowClient

class MyService:
    def __init__(self):
        self.client = DeerFlowClient()

    def analyze(self, text: str) -> str:
        response = self.client.chat(
            f"分析以下内容：{text}",
            thread_id="service-thread"
        )
        return response["messages"][-1]["content"]

# 或集成到 FastAPI 应用
from fastapi import FastAPI
from deerflow.client import DeerFlowClient

app = FastAPI()
client = DeerFlowClient()

@app.post("/analyze")
async def analyze(text: str):
    response = client.chat(text)
    return {"result": response}
```

### 场景三：自定义前端

DeerFlow 的前端是 Next.js 应用。如果你需要：

- **保留 UI、改功能** → 修改 `frontend/src/core/` 下的业务逻辑
- **完全替换前端** → 使用 Gateway REST API + SSE 重新实现

```typescript
// 自定义前端示例：直接调用 API
const API = 'http://localhost:8001'

async function sendMessage(content: string) {
  // 1. 创建运行
  const run = await fetch(`${API}/api/runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      assistant_id: 'lead_agent',
      input: { messages: [{ role: 'user', content }] }
    })
  })
  const { run_id } = await run.json()

  // 2. SSE 流式接收
  const events = new EventSource(`${API}/api/runs/${run_id}/stream`)
  events.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'messages') {
      renderMessage(data.content)  // 你的渲染逻辑
    }
  }
}
```

### 场景四：添加新的 IM 渠道

1. 实现渠道基类：

```python
# app/channels/my_channel.py
from app.channels.base import ChannelBase

class MyChannel(ChannelBase):
    async def start(self):
        # 建立连接
        pass

    async def stop(self):
        # 断开连接
        pass

    async def send_message(self, text: str, thread_id: str):
        # 发送消息
        pass
```

2. 在 `manager.py` 注册
3. 在 `config.yaml` 配置

### 场景五：中间件开发

```python
# 实现一个日志记录中间件
class LoggingMiddleware(BaseMiddleware):
    def before_agent(self, state: ThreadState) -> ThreadState:
        logger.info(f"Agent 开始执行, 消息数: {len(state['messages'])}")
        return state

    def after_agent(self, state: ThreadState) -> ThreadState:
        logger.info(f"Agent 执行完成")
        return state
```

### 场景六：模型提供商适配

```python
# 适配自定义模型
from langchain_core.language_models import BaseChatModel

class MyCustomModel(BaseChatModel):
    def _generate(self, messages, stop, run_manager, **kwargs):
        # 调用你的模型 API
        response = call_my_api(messages)
        return response

    @property
    def _llm_type(self) -> str:
        return "my-custom-model"
```

## 测试策略

```bash
# 后端测试体系
make test                          # 全部 ~277 个测试
make test-blocking-io               # 阻塞 IO 检测

# 前端测试体系
cd frontend && pnpm test           # 单元测试
cd frontend && pnpm test:e2e       # E2E 测试

# Harness 边界测试
pytest tests/test_harness_boundary.py  # 确保 app↛harness
```

## 开发工作流

```bash
# 1. Fork & Clone
git clone https://github.com/bytedance/deer-flow.git

# 2. 配置
make setup

# 3. 安装
make install

# 4. 启动开发服务
make dev

# 5. 修改代码 → 热重载自动生效

# 6. 验证
cd backend && make lint && make test
cd frontend && pnpm lint && pnpm typecheck && pnpm build

# 7. 提交
git add -A
git commit -m "feat: 我的新功能"
```

---

## 复习习题

1. （初级）二次开发的四个原则是什么？请简述每条原则的适用场景。

2. （中级）如果你想在 DeerFlow 中添加一个自定义工具（比如调一个天气 API），需要完成哪些步骤？注册工具时 `config.yaml` 中的 `function` 字段格式是什么？

3. （中级）DeerFlowClient 的 `chat()` 方法返回的只是最后一段 AI 文本。如果应用场景需要实时展示工具调用过程和中间思考，应该使用哪个方法？它返回什么类型的数据？

4. （高级）参考材料中的客户端缓存机制会根据 `model_name`、`thinking_enabled` 等配置的变化自动重建 Agent。这种缓存策略的 key 设计是否完备？有没有遗漏的参数变化也应该触发重建？

5. （高级）参考材料提供了自定义 Agent 工厂的完整示例（`make_custom_agent`）。请结合当前文档的"场景一：添加自定义工具"思考：如果某工具需要额外的审批检查，应该通过自定义中间件还是工具内部逻辑来实现？各自的优缺点是什么？
