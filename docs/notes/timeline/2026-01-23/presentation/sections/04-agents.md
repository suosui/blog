# Agents - 自主化的智能助手

## 什么是 Agents？

**能够自主探索、规划、执行的 AI 助手**

- 🧠 **能思考**：不只执行指令，而是分析和规划
- 🔍 **能探索**：自动发现代码库结构和上下文
- 📋 **能设计**：生成详细的实现计划
- ✅ **能执行**：完整地实现设计方案
- 🔐 **有安全等级**：从只读到完全权限的分级

---

## Agent 的三个关键特征

**1️⃣ 多步骤推理**
> 不是一个 prompt 来回，而是多轮思考和验证

**2️⃣ 工具使用**
> 能够使用 Read、Grep、Bash 等工具收集信息

**3️⃣ 自主决策**
> 基于收集的信息做出智能决策

---

## Explore Agent 深入

### 什么时候用 Explore？

**你有一个问题但不知道从哪里找答案：**

- "我们的认证系统是怎么实现的？"
- "哪里处理用户上传的文件？"
- "API 错误处理的逻辑是什么？"
- "数据库连接在哪里配置？"

--

### Explore 能做什么？

只读操作，30 秒内快速探索代码库

```
├─ Glob 搜索相关文件
├─ Grep 查找关键代码
├─ Read 理解实现细节
└─ 生成详细的架构报告
```

---

## Explore Agent 真实场景

**用户提问：** "认证系统如何实现的？我需要理解它的工作流"

--

**Explore Agent 的自主行动：**

```
1. 🔍 Globbing 文件搜索
   → 找到 src/auth/*  src/middleware/auth.*

2. 🔎 Grep 关键词搜索
   → 搜索 "login", "authenticate", "session"

3. 📖 Read 核心文件
   → 阅读 AuthService.ts, authMiddleware.ts

4. 🔗 分析依赖关系
   → 追踪 JWT, bcrypt, passport 的使用

5. 📋 生成报告
   → 输出完整的认证流程图和代码示例
```

--

**输出示例：**
```
## 认证系统架构

### 工作流
1. 用户登录 → POST /api/auth/login
2. 验证邮箱/密码 → bcrypt.compare()
3. 生成 JWT token → sign with secret
4. 返回 token 到客户端
5. 后续请求 → 验证 JWT

### 关键文件
- src/services/auth.ts - 核心逻辑
- src/middleware/auth.ts - 保护路由
- src/models/User.ts - 用户模型

### 代码示例
[完整的代码片段和流程图]
```

---

## Explore Agent 最佳实践

<div class="card card-highlight">
<h4>💡 使用建议</h4>
<ul>
<li>团队新成员快速上手项目</li>
<li>理解陌生代码库的结构</li>
<li>追踪功能的实现细节</li>
<li>找到相关的测试和文档</li>
</ul>
</div>

---

## Plan Agent 深入

### 什么时候用 Plan？

**你知道要做什么，但不确定怎么做最好：**

- "我要实现缓存系统，应该怎么架构？"
- "重构这个模块的最佳方式是什么？"
- "如何添加实时通知功能？"
- "迁移到新的数据库的安全步骤是什么？"

---

## Plan Agent 工作流

<div class="workflow-step">
<div class="workflow-step-number">1</div>
<div class="workflow-step-content">
<p class="workflow-step-title">理解现状</p>
<p class="workflow-step-desc">Explore 代码库，理解现有架构</p>
</div>
</div>

<div class="workflow-step">
<div class="workflow-step-number">2</div>
<div class="workflow-step-content">
<p class="workflow-step-title">分析需求</p>
<p class="workflow-step-desc">理解你的目标和约束</p>
</div>
</div>

<div class="workflow-step">
<div class="workflow-step-number">3</div>
<div class="workflow-step-content">
<p class="workflow-step-title">设计方案</p>
<p class="workflow-step-desc">提出多个实现方案对比</p>
</div>
</div>

<div class="workflow-step">
<div class="workflow-step-number">4</div>
<div class="workflow-step-content">
<p class="workflow-step-title">人工审批</p>
<p class="workflow-step-desc">你选择最合适的方案</p>
</div>
</div>

<div class="workflow-step">
<div class="workflow-step-number">5</div>
<div class="workflow-step-content">
<p class="workflow-step-title">实施执行</p>
<p class="workflow-step-desc">Plan 得到批准后开始执行</p>
</div>
</div>

---

## Plan Agent 真实案例

**需求：** 为 API 添加 Redis 缓存层

--

**Plan Agent 生成的方案：**

```markdown
# Redis 缓存实现计划

## 方案对比

### 方案 A：Local Redis
- 优点：简单、快速
- 缺点：单机限制
- 适用：中小型项目

### 方案 B：Redis Cluster
- 优点：高可用、分布式
- 缺点：配置复杂
- 适用：大规模系统

## 推荐方案：A（短期），升级到 B（长期）

## 实现步骤
1. 安装 redis 依赖
2. 配置连接池
3. 实现 cache decorator
4. 为 API 端点添加缓存
5. 添加缓存失效策略
6. 编写单元测试
7. 性能基准测试

## 关键文件
- 创建 src/cache/redis.ts
- 修改 src/api/routes.ts
- 添加 tests/cache.test.ts

## 注意事项
- 处理缓存穿透问题
- 设置合理的过期时间
- 监控 Redis 内存使用
```

--

**你的决策：** 选择方案 A，同意所有实现步骤

✅ **Plan 被批准，自动执行！**

---

<h2 style="text-align: center;">Agent 协作流程图</h2>

<div class="workflow-step">
<div>💬</div>
<div class="workflow-step-content">
<p class="workflow-step-title">用户提问或需求</p>
<p class="workflow-step-desc">自然语言描述任务目标</p>
</div>
</div>

<div style="text-align: center; color: #58a6ff; font-size: 1.5em;">↓</div>

<div class="workflow-step">
<div>🔍</div>
<div class="workflow-step-content">
<p class="workflow-step-title">Explore Agent</p>
<p class="workflow-step-desc">收集代码库上下文，理解项目结构</p>
</div>
</div>

<div style="text-align: center; color: #58a6ff; font-size: 1.5em;">↓</div>

<div class="workflow-step">
<div>📋</div>
<div class="workflow-step-content">
<p class="workflow-step-title">Plan Agent</p>
<p class="workflow-step-desc">设计实现方案，分解任务步骤</p>
</div>
</div>

<div style="text-align: center; color: #58a6ff; font-size: 1.5em;">↓</div>

<div class="workflow-step">
<div>👤</div>
<div class="workflow-step-content">
<p class="workflow-step-title">人工审批</p>
<p class="workflow-step-desc">决策方向，确认或调整方案</p>
</div>
</div>

<div style="text-align: center; color: #58a6ff; font-size: 1.5em;">↓</div>

<div class="workflow-step">
<div>⚡</div>
<div class="workflow-step-content">
<p class="workflow-step-title">General Agent 或 CLI</p>
<p class="workflow-step-desc">执行批准的方案，完成任务</p>
</div>
</div>

---

## Agents 的安全分级

<div class="card">
<h4>🔓 Explore Agent（只读）</h4>
<p>最安全，无法修改任何文件，适合新成员和自动化分析</p>
</div>

<div class="card">
<h4>📋 Plan Agent（设计阶段）</h4>
<p>生成计划但需人工批准，不自动执行</p>
</div>

<div class="card">
<h4>🔧 General Purpose Agent（完整权限）</h4>
<p>完整的工程化能力，需要更多的信任和上下文</p>
</div>

---

<h2 style="text-align: center;">Agent 最佳实践</h2>


| 原则 | 说明 |
|------|------|
| 📌 **明确意图** | 告诉 agent 你想要什么结果 |
| 🎯 **充分背景** | 提供项目架构、技术栈等信息 |
| 👀 **审查结果** | 始终检查 agent 的输出 |
| 🔄 **迭代反馈** | 不满意就继续对话优化 |
| 🤝 **人机分工** | Agent 探索和规划，人类做决策 |

---

## Agents 的关键价值

<div class="comparison">
<div class="comparison-item bad">
<h4>❌ 传统方式</h4>
- 手动阅读代码：2 小时
- 设计方案：1 小时
- 讨论确认：30 分钟
- 总耗时：3.5 小时
</div>

<div class="comparison-item good">
<h4>✓ Claude Code Agents</h4>
- Explore 快速理解：3 分钟
- Plan 自动设计：2 分钟
- 人工审批：10 分钟
- 总耗时：15 分钟
</div>
</div>

---

## Agents 总结

✓ **快速理解** - Explore 在 30 秒内理解复杂代码库     
✓ **智能设计** - Plan 生成经过深思熟虑的实现方案     
✓ **安全可靠** - 多层次的安全分级和人工审批    
✓ **Vibe Coding** - 完美体现"人负责决策，AI 负责实现"    

---

## SubAgents - 递归式智能分解

### 什么是 SubAgent？

**一个 Agent 在执行过程中，可以启动专门的子 Agent 来完成特定的任务**

- 🎯 **任务分解**：大任务自动拆分成小任务
- 🚀 **独立执行**：子 Agent 专注于自己的职责
- 🔄 **结果回收**：子 Agent 完成后结果回传给主 Agent
- 📊 **并行协作**：多个子 Agent 可以同时工作

---

## Agent vs SubAgent

<div class="comparison">
<div class="comparison-item">
<h4>🤖 Agent（主 Agent）</h4>
- 由用户直接启动
- 负责整体任务的规划和协调
- 可以启动多个 SubAgent
- 做最终的决策和汇总
- 例如：代码审查主 Agent
</div>

<div class="comparison-item">
<h4>🔹 SubAgent（子 Agent）</h4>
- 由 Agent 自动启动
- 负责特定领域的专项工作
- 专注于单一职责
- 完成后返回结果给主 Agent
- 例如：性能审查 SubAgent、安全审查 SubAgent
</div>
</div>

---

## SubAgent 的工作流程

```
┌─────────────────────────────────┐
│   用户启动 Main Agent           │
│   "审查我的代码质量"             │
└────────────┬────────────────────┘
             │
        ┌────▼─────────────────────────────┐
        │   Main Agent 分析任务            │
        │   需要 3 个 SubAgent:             │
        │   1. 性能审查                     │
        │   2. 安全审查                     │
        │   3. 代码风格审查                │
        └────┬─────────────────────────────┘
             │
    ┌────────┼────────┬─────────────┐
    │        │        │             │
    ▼        ▼        ▼             ▼
┌────────┐┌────────┐┌────────┐ (并行执行)
│Perf    ││Security││Code    │
│Agent   ││Agent   ││Style   │
└────┬───┘└───┬────┘└───┬────┘
     │        │         │
     └────────┼─────────┘
              │
         ┌────▼──────────────────┐
         │ Main Agent 汇总结果   │
         │ 生成完整审查报告       │
         └───────────────────────┘
```

---

## SubAgent 真实场景

**需求：** 代码审查 - 一次性审查性能、安全、风格

--

**Main Agent 的决策：**

```
用户请求：审查 src/api/payment.ts 的代码质量

Main Agent 分析：
✓ 这是一个复杂的支付处理模块
✓ 需要专项审查：性能、安全、代码风格
✓ 启动 3 个 SubAgent 并行处理
```

--

**SubAgent 1 - 性能审查：**

```
任务：检查 payment.ts 的性能瓶颈

执行过程：
1. 分析数据库查询（N+1 问题）
2. 检查大循环和复杂计算
3. 查找内存泄漏风险
4. 评估缓存机会

输出：
✗ 发现 N+1 查询问题，影响性能 30%
✓ 建议添加数据库索引
✓ 建议实现查询缓存
```

--

**SubAgent 2 - 安全审查：**

```
任务：检查 payment.ts 的安全漏洞

执行过程：
1. 检查输入验证
2. 分析 SQL 注入风险
3. 检查认证授权
4. 审查 API 速率限制

输出：
✗ 缺少金额验证，可能被篡改
✗ 未检查用户权限
✓ 已正确使用参数化查询
✓ 建议添加请求签名验证
```

--

**SubAgent 3 - 代码风格审查：**

```
任务：检查 payment.ts 的代码规范

执行过程：
1. 检查命名规范
2. 分析函数复杂度
3. 检查注释和文档
4. 评估代码重复度

输出：
✓ 命名规范良好
✗ processPayment 函数 200 行，超过建议值
✓ 注释详细，易于维护
⚠️ 有 20% 的重复代码，建议提取
```

--

**Main Agent 汇总：**

```markdown
# 代码审查报告：payment.ts

## 评分：C+ (需要改进)

## 性能：C
- N+1 查询问题，需要立即修复
- 建议添加缓存层

## 安全：C-
- 金额验证缺失（高危）
- 权限检查缺失（高危）

## 代码质量：B
- 函数过长，建议拆分
- 代码复用率可以提升

## 优先级修复清单
1. ⚠️ 高 - 添加金额和权限验证
2. ⚠️ 高 - 修复 N+1 查询
3. ⚠️ 中 - 拆分超长函数
4. 低 - 改进代码重复度
```

---

## 何时使用 SubAgent？

<div class="card card-highlight">
<h4>✓ 使用 SubAgent 的场景</h4>
<ul>
<li>🔍 <strong>多方面分析</strong>：需要从不同角度审查（性能、安全、可用性）</li>
<li>🚀 <strong>并行加速</strong>：多个独立任务可以同时进行</li>
<li>🎯 <strong>专项深挖</strong>：某个领域需要专业的 Agent 深度探索</li>
<li>📊 <strong>复杂聚合</strong>：最后需要汇总多个专项结果</li>
<li>🔄 <strong>递归分解</strong>：一个大的复杂问题需要层级分解</li>
</ul>
</div>

---

<h2 style="text-align: center;">SubAgent vs 直接使用 Agent</h2>

| 方面 | 直接使用 Agent | 使用 SubAgent |
|------|---|---|
| **初始化** | 由用户手动启动 | 由 Agent 自动启动 |
| **并行度** | 需用户管理多个对话 | 自动并行执行 |
| **上下文** | 需要用户分别提供 | 自动继承父 Agent 的上下文 |
| **结果汇总** | 用户手动整合 | Agent 自动聚合 |
| **效率** | 较低（手动协调） | 较高（自动协调） |
| **适用场景** | 单一任务、需人工参与 | 复杂任务、自动化流程 |

---

## SubAgent 的设计原则

<div class="card">
<h4>📌 单一职责</h4>
<p>每个 SubAgent 只负责一个明确的专项工作</p>
</div>

<div class="card">
<h4>🔌 接口清晰</h4>
<p>SubAgent 的输入输出格式要统一，便于主 Agent 整合</p>
</div>

<div class="card">
<h4>⚡ 高效独立</h4>
<p>SubAgent 之间无依赖，可以并行执行提升效率</p>
</div>

<div class="card">
<h4>📝 结果可追溯</h4>
<p>每个 SubAgent 的工作过程和结果都要记录</p>
</div>

---

## 实际应用例子

### 例子 1：API 版本迁移

**Main Agent:** 迁移 API v1 到 v2

**SubAgent：**
- 🔹 Schema 迁移 Agent - 更新数据模型
- 🔹 Endpoint 适配 Agent - 转换 API 端点
- 🔹 测试生成 Agent - 自动生成测试用例

**并行执行，然后汇总**

---

### 例子 2：数据库优化

**Main Agent:** 优化数据库性能

**SubAgent：**
- 🔹 查询分析 Agent - 找出慢查询
- 🔹 索引设计 Agent - 推荐索引策略
- 🔹 分片方案 Agent - 规划数据分片

**各 Agent 独立工作，最后汇总最优方案**

---

## SubAgents 的价值

✓ **自动分解** - 复杂任务自动拆分成可管理的小任务    
✓ **并行加速** - 多个 SubAgent 同时工作，大幅节省时间    
✓ **质量提升** - 专项的 Agent 更专业、更深入    
✓ **易于扩展** - 需要新角度只需添加新的 SubAgent    
✓ **自动聚合** - 无需人工干预就能汇总各方面结果    

---

## Agents 体系完整性

```
┌─────────────────────────────────────┐
│   Claude Code Agents 完整体系        │
├─────────────────────────────────────┤
│ 📖 Explore Agent - 快速探索          │
│ 📋 Plan Agent - 智能规划             │
│ 🎯 General Agent - 完整执行          │
│ 🔹 SubAgent - 递归分解              │
│ 🤖 Custom Agent - 用户自定义        │
└─────────────────────────────────────┘
```

**Vibe Coding 的核心理念：**
- 🧠 AI 负责思考、规划、执行
- 👤 人类负责审批、决策、把控方向
- 🎯 SubAgent 让 AI 的能力更加强大和灵活

接下来，看 **MCP** 如何提供无限的扩展性...
