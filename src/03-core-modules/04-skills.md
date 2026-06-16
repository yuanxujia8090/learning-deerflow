# 技能系统（Skills）

## 前端视角理解

类比 **VSCode 插件 + 按需加载**：

- **Skills** = VSCode 扩展
- **SKILL.md** = 扩展的 README + package.json
- **技能加载** = 扩展激活（激活事件触发）
- **工具白名单** = 扩展权限声明（permissions）
- **技能仓库** = 扩展市场

也可以类比 **React.lazy + Suspense**：
- 技能只有在需要时才加载
- 不增加不必要的上下文
- 按需、渐进式

## 技能是什么？

技能是一个 **Markdown 文件**（SKILL.md），包含 YAML 前置元数据加上 Workflow 指令：

```markdown
---
name: deep-research
description: 深度网络研究，从多个角度探索主题
allowed-tools:
  - tavily_search
  - web_fetch
  - web_search
---

# Deep Research Skill

当你需要深入研究一个主题时：

1. **规划**：列出子问题
2. **搜索**：使用 web_search 收集资料
3. **阅读**：对每个来源使用 web_fetch
4. **综合**：整理发现
5. **产出**：输出结构化报告
```

## 技能系统架构

```
技能目录结构（类似 VSCode 的 ~/.vscode/extensions/）：
skills/
├── public/                             ← 官方内置技能（git 跟踪）
│   ├── deep-research/SKILL.md
│   ├── report-generation/SKILL.md
│   ├── slide-creation/SKILL.md
│   ├── web-page/SKILL.md
│   ├── image-generation/SKILL.md
│   ├── chart-visualization/SKILL.md
│   ├── data-analysis/SKILL.md
│   ├── ppt-generation/SKILL.md
│   ├── podcast-generation/SKILL.md
│   └── ... (共 21 个)
└── custom/                             ← 自定义技能（git ignored）
    └── your-custom-skill/SKILL.md
```

## 技能加载流程

```
1. 用户发送请求
        ↓
2. SkillStorage.load_skills()
   ├── 扫描技能目录 → 解析 SKILL.md 前置元数据
   └── 检查 enabled 状态
        ↓
3. skill_manager_tool（条件性加载）
   ├── 如果技能进化启用 → 可创建/修改技能
   └── 否则 → 仅加载已启用的技能
        ↓
4. 注入系统提示词
   └── 技能内容作为 SystemMessage 注入
        ↓
5. 工具过滤
   └── filter_tools_by_skill_allowed_tools()
       └── 仅允许技能白名单中的工具
```

## 技能元数据

```python
class Skill:
    name: str                     # 唯一名称
    description: str              # 描述（LLM 理解用什么）
    license: str | None           # 许可证
    skill_dir: str                # 技能目录路径
    skill_file: str               # SKILL.md 路径
    relative_path: str            # 相对于技能根目录的路径
    category: SkillCategory       # public 或 custom
    allowed_tools: list[str] | None  # 工具白名单
    enabled: bool                 # 是否启用
```

## 技能与工具的关系

```
技能（Skill） — 定义做什么、怎么做
   │
   ├── 声明 allowed_tools（权限控制）
   ├── 提供 Workflow 指导（LLM 提示）
   └── 被推送给 LLM 作为上下文

工具（Tool） — 定义能做什么
   │
   ├── 搜索（Tavily、Jina、Exa、Serper）
   ├── 读取（web_fetch、read_file）
   ├── 写（write_file、str_replace）
   └── 执行（bash）
```

## 内置技能清单（21 个）

| 技能 | 用途 | 需要的工具 |
|------|------|-----------|
| deep-research | 深度网络研究 | web_search, web_fetch |
| report-generation | 生成结构化报告 | write_file, read |
| slide-creation | 创建演示文稿 | write, image_gen |
| web-page | 生成网页 | write_file, bash |
| image-generation | AI 图像生成 | image_gen |
| chart-visualization | 图表可视化 | write_file, bash |
| data-analysis | 数据分析 | bash, read, write |
| ppt-generation | PPT 生成 | write, bash |
| podcast-generation | 播客内容 | write, bash |
| video-generation | 视频内容 | write_file, bash |
| newsletter-generation | 通讯稿 | write, web_search |
| code-documentation | 代码文档 | read, write |
| frontend-design | UI/UX 设计 | write, view_image |
| academic-paper-review | 论文审阅 | web_search, read |
| consulting-analysis | 咨询分析 | web_search, write |
| skill-creator | 创建新技能 | write, read |
| surprise-me | 随机互动 | - |
| vercel-deploy-claimable | Vercel 部署 | bash, write |
| web-design-guidelines | 网页设计指南 | read |
| github-deep-research | GitHub 深度研究 | web_search |
| claude-to-deerflow | Claude 迁移 | web_fetch |
| systematic-literature-review | 系统文献综述 | web_search |
| find-skills | 发现技能 | read |

## 自定义技能开发

创建 `skills/custom/your-skill/SKILL.md`：

```markdown
---
name: my-custom-skill
description: 我的自定义技能
allowed-tools:
  - web_search
  - write_file
---

# My Custom Skill

你希望代理执行的 Workflow 指令...
```

## 关键源码路径

```python
backend/packages/harness/deerflow/skills/
├── types.py              # Skill 类型定义
├── parser.py             # SKILL.md 解析（YAML 前置元数据）
├── loader.py             # 技能加载器
├── storage/              # 技能存储
│   ├── skill_storage.py    # 抽象接口
│   └── local_skill_storage.py  # 本地文件系统实现
├── installer.py          # .skill 归档安装
├── validation.py         # 技能验证
├── security_scanner.py   # 安全扫描
└── tool_policy.py        # 工具白名单策略
```

---

## 复习习题

**1. （初级）** Skill 和 Tool 有什么区别？请用一个具体的例子说明两者的关系。

**2. （中级）** 参考材料中将 Skill 安全扫描的结果分为 `allow` / `warn` / `block` 三个级别。请举例说明什么情况下会得到 `warn` 而非 `block`？

**3. （中级）** 渐进式技能加载（Progressive Skill Loading）解决了什么核心问题？它的基本原理是什么？

**4. （高级）** 参考材料中提到 Skill 安装器（Installer）包含 zip bomb 检测机制。为什么需要这种保护？恶意构造的 `.skill` 文件可能造成什么破坏？

**5. （高级）** SKILL.md 中的 `allowed-tools` 是一把"双刃剑"。请从安全隔离和灵活性两个角度分析白名单机制的利弊。
