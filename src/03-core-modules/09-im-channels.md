# IM 渠道集成

## 前端视角理解

类比 **WebSocket + Webhook + OAuth 整合**：

- 每个 IM 渠道 = 一个独立的 WebSocket 客户端
- 渠道管理器 = WebSocket 连接池
- 消息路由 = Pub/Sub 模式

也可以类比 **第三方 OAuth 登录**：
- Telegram = "Sign in with Telegram"
- Slack = "Add to Slack"
- 飞书 = "飞书应用"

## 支持的 IM 渠道

| 渠道 | 通信方式 | 配置难度 | 前端类比 |
|------|---------|----------|----------|
| Telegram | Bot API（长轮询） | 简单 | 对接 Telegram Bot |
| Slack | Socket Mode | 中等 | 安装 Slack App |
| 飞书 | WebSocket | 中等 | 创建飞书应用 |
| 企业微信 | WebSocket | 中等 | 创建企业微信 Bot |
| 微信 | Tencent iLink（长轮询） | 中等 | 微信 Bot 对接 |
| 钉钉 | Stream Push（WebSocket） | 中等 | 创建钉钉应用 |
| Discord | WebSocket | 简单 | 创建 Discord Bot |

## 渠道配置示例

```yaml
channels:
  telegram:
    enabled: true
    bot_token: $TELEGRAM_BOT_TOKEN
    allowed_users: []  # 空 = 允许所有人

  slack:
    enabled: true
    bot_token: $SLACK_BOT_TOKEN
    app_token: $SLACK_APP_TOKEN
    allowed_users: []

  feishu:
    enabled: true
    app_id: $FEISHU_APP_ID
    app_secret: $FEISHU_APP_SECRET
```

## 渠道架构

```
渠道服务（启动时初始化）
    │
    ├── Telegram Worker
    │   ├── 长轮询 /getUpdates
    │   ├── 消息处理 → Gateway API
    │   └── 响应发送
    │
    ├── Slack Worker
    │   ├── Socket Mode 连接
    │   ├── 消息事件监听
    │   └── 消息发送
    │
    ├── 飞书 Worker
    │   ├── WebSocket 长连接
    │   ├── 事件接收
    │   └── 消息回复
    │
    └── ...
```

## 会话路由

```
IM 消息 → 渠道 Worker
              ↓
       Gateway API（内部认证）
              ↓
       lead_agent（或 custom_agent）
              ↓
              ↕
         LangGraph 运行时
              ↓
        SSE 流式响应回渠道
```

**重要**：IM 渠道的 `assistant_id` 可配置：

```yaml
channels:
  session:
    assistant_id: lead_agent    # 默认主导代理
    # 或自定义 agent：
    # assistant_id: mobile-agent → 路由到 custom agent
```

## IM 渠道命令

| 命令 | 功能 |
|------|------|
| /new | 开始新对话 |
| /status | 查看当前线程 |
| /models | 列出可用模型 |
| /memory | 查看记忆 |
| /help | 显示帮助 |

## 关键源码路径

```python
backend/app/channels/
├── base.py              # 渠道抽象基类
├── service.py           # 渠道生命周期管理
├── manager.py           # 渠道注册和路由
├── message_bus.py       # 内部消息总线
├── store.py             # 持久化存储
├── commands.py          # 命令处理
├── telegram.py          # Telegram 实现
├── slack.py             # Slack 实现
├── feishu.py            # 飞书实现
├── wechat.py            # 微信实现
├── wecom.py             # 企业微信实现
├── dingtalk.py          # 钉钉实现
└── discord.py           # Discord 实现
```


---

## 复习习题

1. （初级）DeerFlow 支持哪些 IM 渠道？请列举至少 5 个。
2. （中级）不同 IM 渠道使用不同的通信方式（长轮询、Socket Mode、WebSocket、Stream Push）。选择这些不同方式的理由是什么？受什么因素制约？
3. （中级）IM 渠道中 `assistant_id` 可配置为 `lead_agent` 或自定义 agent。这种配置方式如何实现多 Agent 路由？有何使用场景？
4. （高级）IM 渠道的会话生命周期管理面临什么挑战？例如，用户在某渠道发送消息后退出，一段时间后重新进入，如何恢复之前的对话状态？
