# 沙箱与文件系统

## 前端视角理解

想象一个**浏览器的 iframe + File System Access API**：

- **沙箱** = 隔离的 iframe（同源策略）
- **文件系统** = Origin Private File System（每个线程对应独立目录）
- **bash 执行** = 危险的 eval（默认关闭）
- **Docker 沙箱** = 更严格的跨域隔离（cross-origin isolation）

## 什么是沙箱？

沙箱是 DeerFlow 给代理的"计算机"——一个隔离的执行环境，包含：

- **文件系统** — 读写文件
- **Bash** — 执行命令（可选）
- **网络** — 访问外部服务
- **环境变量** — 配置注入

```
每个线程的沙箱目录结构：
/mnt/user-data/
├── uploads/          ← 用户上传的文件（类似 multer 上传目录）
├── workspace/        ← 代理工作区（类似项目的 src/）
└── outputs/          ← 最终产出物（类似 dist/）
```

## 沙箱模式

DeerFlow 支持三种沙箱模式：

### 模式 1：本地执行（LocalSandboxProvider）

```
特点：直接在主机的文件系统上运行
优点：零配置，开发方便
缺点：无隔离，bash 默认禁用
适用：开发调试
```

**配置：**
```yaml
sandbox:
  use: deerflow.sandbox.local.local_sandbox_provider:LocalSandboxProvider
```

**安全提醒**：主机 bash 默认禁用。因为 Node 环境无法提供安全的执行隔离——这就像让你在浏览器里 `eval` 用户代码一样危险。

### 模式 2：Docker 执行（AioSandboxProvider - LocalBackend）

```
特点：每个线程在独立 Docker 容器中运行
优点：完全隔离，支持 bash
缺点：需要 Docker 守护进程
适用：本地生产、开发测试
```

**配置：**
```yaml
sandbox:
  use: deerflow.community.aio_sandbox:AioSandboxProvider
```

### 模式 3：Kubernetes 执行（AioSandboxProvider - RemoteBackend + Provisioner）

```
特点：在 K8s Pod 中运行
优点：水平扩展，生产级隔离
缺点：需要 K8s 集群
适用：企业生产环境
```

**配置：**
```yaml
sandbox:
  use: deerflow.community.aio_sandbox:AioSandboxProvider
  provisioner_url: http://provisioner:8002
```

## Sandbox 抽象接口

```python
class Sandbox(ABC):
    def execute_command(self, command: str) -> str           # 执行命令
    def read_file(self, path: str) -> str                    # 读取文件
    def write_file(self, path: str, content: str, append=False)  # 写文件
    def download_file(self, path: str) -> bytes              # 下载（含路径遍历检测）
    def list_dir(self, path: str, max_depth=2)               # 列出目录
    def glob(self, pattern: str) -> tuple                    # 文件匹配搜索
    def grep(self, pattern: str) -> tuple                    # 文件内容搜索
    def update_file(self, path: str, content: bytes)         # 更新文件

class SandboxProvider(ABC):
    def acquire(self, thread_id) -> str      # 获取沙箱
    def get(self, sandbox_id) -> Sandbox     # 获取沙箱实例
    def release(self, sandbox_id)            # 释放沙箱
    def reset(self)                          # 重置
    def shutdown(self)                       # 关闭
```

## Sandbox 工具

DeerFlow 提供基于沙箱的工具：

| 工具 | 说明 | 前端类比 |
|------|------|----------|
| bash | 执行 shell 命令 | eval（危险）|
| read | 读取文件 | fs.readFile |
| write | 写入文件 | fs.writeFile |
| str_replace | 替换文件内容 | sed |
| ls | 列出目录 | fs.readdir |
| glob | 模式搜索文件 | fast-glob |
| grep | 搜索文件内容 | ripgrep |
| view_image | 查看图片 | img 标签 |

## 工具使用与安全

**安全策略**（类似 Content-Security-Policy）：

```
LocalSandboxProvider： 默认禁用 bash
Docker Sandbox：       bash 可用
文件路径遍历：         read_file/write_file 需在白名单路径内
下载文件：             路径遍历检测 → PermissionError
```

## 关键源码路径

```python
backend/packages/harness/deerflow/sandbox/
├── sandbox.py              # Sandbox 抽象接口
├── sandbox_provider.py     # Provider 抽象工厂
├── tools.py                # 沙箱工具（bash/read/write）
├── middleware.py            # 沙箱生命周期中间件
└── local/
    ├── local_sandbox.py    # 本地沙箱实现
    └── local_sandbox_provider.py  # 本地 Provider
```

---

## 复习习题

**1. （初级）** DeerFlow 支持哪三种沙箱模式？它们分别在什么场景下使用？

**2. （中级）** `SandboxMiddleware` 的 `lazy_init` 参数控制什么行为？`lazy_init=True` 和 `False` 在性能上各有什么优劣？

**3. （中级）** 参考材料的 `SandboxAuditMiddleware` 将 bash 命令分成了哪三个风险等级？`block` 级别的命令会被怎么处理？

**4. （高级）** 虚拟路径系统（`/mnt/user-data/` → 实际物理路径）解决了什么问题？如果设计上不使用路径映射，会引入哪些安全问题？

**5. （高级）** Provisioner 模式下的沙箱和 `LocalSandbox` 在生命周期管理上有哪些关键区别？为什么 Provisioner 模式更适合生产环境？
