# 企业级部署与维护

## 部署选项对比

| 方式 | 适用场景 | 复杂度 | 生产就绪 |
|------|---------|--------|----------|
| Local `make dev` | 开发调试 | 低 | ❌ |
| Docker Dev | 开发测试 | 中 | ❌ |
| Docker Prod | 小规模生产 | 中 | ✅ |
| K8s + Provisioner | 企业大规模 | 高 | ✅ |

## Docker 生产部署

### 架构

```
Nginx (:2026)
    │
    ├── Gateway (:8001) ← 核心服务，内嵌 Agent 运行时
    │       ├── 持久卷：config.yaml + 数据目录
    │       └── 环境变量：API Keys
    │
    ├── Provisioner (:8002) ← 可选，K8s 模式
    │
    └── Frontend (:3000) ← 预构建静态资源
```

### 部署命令

```bash
# 一键构建 + 启动
make up

# 或分步执行
./scripts/deploy.sh build              # 构建镜像
./scripts/deploy.sh start              # 启动服务
./scripts/deploy.sh down               # 停止

# 本地生产模式（非 Docker）
make start        # 启动
make start-daemon # 后台运行
make stop         # 停止
```

### 资源推荐

| 规模 | CPU | 内存 | 磁盘 |
|------|-----|------|------|
| 小型（个人/小团队） | 4 vCPU | 8 GB | 20 GB |
| 中型（多用户） | 8 vCPU | 16 GB | 40 GB |
| 大型（企业） | 16 vCPU | 32 GB | 100 GB+ |

## Kubernetes 部署

### 架构（含 Provisioner）

```
K8s 集群
    │
    ├── Gateway Pod
    │   ├── 容器：Gateway API + Agent Runtime
    │   ├── ConfigMap：config.yaml
    │   └── Secret：API Keys
    │
    ├── Frontend Pod
    │   └── 容器：Nginx + Next.js 静态文件
    │
    ├── Provisioner Pod
    │   ├── 管理 Sandbox Pod 生命周期
    │   └── 与 Gateway 通信
    │
    └── Sandbox Pod（每个线程一个）
        ├── 隔离的容器环境
        ├── 临时文件系统
        └── 执行完毕后自动销毁
```

### Provisioner 模式配置

```yaml
# config.yaml
sandbox:
  use: deerflow.community.aio_sandbox:AioSandboxProvider
  provisioner_url: http://provisioner:8002
  kubeconfig_path: /etc/kubernetes/kubeconfig  # K8s 配置
```

## 安全加固

### 网络安全

```yaml
# 1. IP 白名单（iptables 示例）
iptables -A INPUT -p tcp --dport 2026 -s 10.0.0.0/8 -j ACCEPT
iptables -A INPUT -p tcp --dport 2026 -j DROP

# 2. 绑定本地回环
gateway:
  host: 127.0.0.1  # 仅本地可访问
  port: 8001
```

### 认证层

- Gateway 内置 `AuthMiddleware` + `CSRFMiddleware`
- 推荐前置反向代理做额外认证（OAuth2 Proxy、Keycloak）
- 敏感操作配置授权检查

### 安全配置清单

```
□ 不在公网暴露 Gateway 端口（8001）
□ 只暴露 Nginx 端口（2026）
□ 配置 IP 白名单
□ API Keys 存放在环境变量或 Secret 中
□ 启用认证（AuthMiddleware）
□ 关闭不必要的沙箱 bash
□ 配置沙箱超时限制
□ 定期更新依赖
```

## 监控与可观测性

### LangSmith 追踪

```bash
# .env 配置
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=lsv2_pt_xxxxxxxx
LANGSMITH_PROJECT=deerflow-prod
```

### Langfuse 追踪

```bash
LANGFUSE_TRACING=true
LANGFUSE_PUBLIC_KEY=pk-lf-xxxxxxxx
LANGFUSE_SECRET_KEY=sk-lf-xxxxxxxx
LANGFUSE_BASE_URL=https://cloud.langfuse.com
```

追踪关联字段：

| 字段 | 说明 |
|------|------|
| session_id | = thread_id（同一对话的所有轨迹） |
| user_id | 有效用户 ID |
| trace_name | assistant_id（默认 lead-agent） |
| tags | `[env:prod, model:gpt-4o]` |

### 健康检查

```bash
# 基础健康
curl http://localhost:2026/health

# 配置检查（推荐在 CI/CD 中运行）
make doctor
```

## 日志管理

```yaml
# config.yaml
logging:
  level: INFO  # DEBUG / INFO / WARNING / ERROR
  format: json # 结构化日志，便于采集
```

**日志最佳实践**：
- 生产环境用 `INFO`，调试用 `DEBUG`
- 使用结构化日志（JSON），便于 ELK/Loki 采集
- 关键事件（启动/关闭/错误）输出到单独日志流

## 备份与恢复

| 数据 | 位置 | 备份策略 |
|------|------|----------|
| config.yaml | 项目根目录 | Git 管理 + 定期备份 |
| .env | 项目根目录 | Secret 管理 |
| 记忆数据 | `.deer-flow/` | 定期快照 |
| 上传文件 | `.deer-flow/uploads/` | 对象存储（S3/MinIO）|
| 线程数据 | `.deer-flow/threads/` | 按需保留或清理 |
| Docker 数据卷 | docker volumes | 卷备份 |

## 升级策略

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 配置升级（保留现有配置）
make config-upgrade

# 3. 检查兼容
make doctor

# 4. 重启服务
make stop && make start

# 或 Docker
make down && make up
```

**注意**：
- `make config` 如果 `config.yaml` 已存在会失败——始终用 `make config-upgrade`
- 基础设施配置变更（DB、沙箱、渠道）需要重启
- 模型/工具/技能配置变更默认热重载

## 常见运维场景

### 扩容

```bash
# Docker Compose
docker-compose up -d --scale gateway=3

# K8s
kubectl scale deployment gateway --replicas=5
```

### 日志排查

```bash
# 查看 Gateway 日志
docker-compose logs -f gateway

# 查看 Nginx 日志
docker-compose logs -f nginx

# 查看 Provisioner 日志
docker-compose logs -f provisioner
```

### 数据清理

```bash
# 清理所有线程数据（谨慎！）
rm -rf .deer-flow/threads/

# 清理记忆
curl -X DELETE http://localhost:2026/api/memory

# Docker 卷清理
docker volume prune
```

---

## 复习习题

1. （初级）DeerFlow 支持哪四种部署模式？从开发到生产，推荐怎样的演进路径？

2. （中级）Kubernetes 部署中 Provisioner 的作用是什么？Sandbox Pod 的生命周期是如何管理的？

3. （中级）参考材料中 RBAC 定义了哪几种角色？不同角色各自拥有哪些权限（如 Agent 操作、数据操作、审批操作）？

4. （高级）参考材料中提到"审计日志的签名机制"——每条审计记录都包含 HMAC-SHA256 签名。为什么审计日志需要防篡改？如果日志被篡改而系统没有检测到，会有什么法律和合规风险？

5. （高级）企业级多租户架构中，数据隔离策略涉及数据库表名、文件路径、向量命名空间三个层次。请分析这三种隔离方式的优缺点，并说明在什么场景下应该选择哪种方式。
