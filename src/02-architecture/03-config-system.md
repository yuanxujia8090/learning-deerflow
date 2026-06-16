# 配置体系

## 概述

DeerFlow 的配置体系由两个核心文件构成：`config.yaml`（主配置）和 `extensions_config.json`（扩展配置）。配置系统支持环境变量注入、热重载、版本验证。

## 配置架构

```yaml
# config.yaml — 项目根目录
config.yaml:
  models: [...]        # 模型定义
  sandbox: {...}       # 沙箱配置
  tools: [...]         # 工具注册
  tool_groups: [...]
  skills: {...}        # 技能路径
  memory: {...}        # 记忆存储
  subagents: {...}     # 子代理
  summarization: {...} # 摘要配置
  title: {...}         # 标题生成
  token_usage: {...}   # Token 使用跟踪
  loop_detection: {...} # 循环检测
  guardrails: {...}    # 安全护栏
  database: {...}      # 数据库
  checkpointer: {...}  # 检查点
  agents_api: {...}    # Agent API
  acp_agents: {...}    # ACP 代理
  channels: {...}      # IM 渠道

# extensions_config.json — 独立文件
extensions_config.json:
  mcpServers: {...}     # MCP 服务定义
  skills: {...}         # 技能启用状态
  mcpInterceptors: [...] # MCP 拦截器
```

## 配置加载流程

```
config.yaml  →  AppConfig.from_file()
                      ↓
               Pydantic 解析（类似 zod schema 校验）
                      ↓
               环境变量替换 ($VAR → 实际值)
                      ↓
               版本检查（兼容旧配置）
                      ↓
               get_app_config() 全局单例
                      ↓
               文件 mtime 变化时自动重载
```

这就像前端的 `zod` 对配置进行校验，然后通过 Context Provider 全局共享。

## 热重载机制

```python
# 根据文件 mtime 自动判断是否重载
def get_app_config() -> AppConfig:
    current_mtime = os.path.getmtime(config_path)
    if current_mtime != _cached_mtime:
        _reload_config()
    return _cached_config
```

**热重载生效范围：**

| 配置项 | 是否需要重启 |
|--------|-------------|
| 模型列表/参数 | 不需要（下次请求生效） |
| 工具配置 | 不需要 |
| 技能配置 | 不需要 |
| 记忆配置 | 不需要 |
| 数据库连接 | **需要重启** |
| 沙箱提供商 | **需要重启** |
| IM 渠道 | **需要重启** |
| 日志级别 | **需要重启** |

## 核心子配置模块

每个核心功能都有自己的配置模块，放在 `backend/packages/harness/deerflow/config/` 下。

### ModelConfig — 模型配置

```yaml
models:
  - name: gpt-4o
    display_name: GPT-4o
    use: langchain_openai:ChatOpenAI    # 类路径（反射加载）
    model: gpt-4o
    api_key: $OPENAI_API_KEY            # 环境变量引用
    supports_thinking: true             # 思考能力
    supports_vision: true               # 视觉能力
    when_thinking_enabled:
      extra_body:
        # 思考模式下的额外参数
```

`use` 字段使用 `包名:类名` 格式，通过反射动态加载类——这就是"可插拔"架构的底层机制，可以自由替换为自定义实现。

### SandboxConfig — 沙箱配置

```yaml
sandbox:
  use: deerflow.sandbox.local.local_sandbox_provider:LocalSandboxProvider
  # 或
  use: deerflow.community.aio_sandbox:AioSandboxProvider
  provisioner_url: http://provisioner:8002  # K8s 模式
```

### SkillsConfig — 技能配置

```yaml
skills:
  use: deerflow.skills.storage.local_skill_storage:LocalSkillStorage
  container_path: /mnt/skills    # 容器内路径
  host_path: ./skills            # 宿主机路径
```

## 前端配置

前端配置在 `frontend/.env`：

```bash
BETTER_AUTH_SECRET=local-dev-secret   # 认证密钥（构建必需）
NEXT_PUBLIC_API_URL=xxx               # API 地址
```

## 配置最佳实践

1. **敏感信息放 `.env`**，`config.yaml` 中用 `$VAR` 引用
2. **不要手动编辑 `extensions_config.json`** — 通过 Gateway API 管理
3. **升级时用 `make config-upgrade`** 而非 `make config`
4. **修改基础设施配置后重启**（数据库、沙箱、渠道）

---

## 复习习题

1. （初级）DeerFlow 在什么地方引用环境变量？例如，API Key 的 $OPENAI_API_KEY 是如何被解析的？

2. （中级）参考材料列出了 `config.yaml` 中 20+ 个配置节。对比当前文档列出的配置节，你发现哪些缺失了？选择 3 个你认为必须了解的补充说明其用途。

3. （中级）哪些配置变更需要重启服务？哪些可以热重载？设计这种区分背后的考量是什么？

4. （高级）`extensions_config.json` 的 `auto_load` 选项在开发环境和生产环境中的最佳实践有何不同？为什么参考文档建议稳定后关闭 auto_load？
