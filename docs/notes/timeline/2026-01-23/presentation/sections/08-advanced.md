# 高级主题 & Q&A

## 高级主题 1：自定义 Skill 开发

**什么时候创建自定义 Skill？**

- 团队有重复的工作流
- 需要特定的业务逻辑
- 要标准化团队实践

---

### 自定义 Skill 示例：/deploy

**需求：** 简化部署流程

```python
# skills/deploy.py

class DeploySkill:
    def execute(self, target: str, version: str):
        """
        部署应用到指定环境

        Args:
            target: 'staging' 或 'production'
            version: 版本号，如 'v1.2.3'
        """

        # 1. 验证版本
        assert self.is_valid_version(version)

        # 2. 构建
        self.run_build(version)

        # 3. 运行测试
        self.run_tests()

        # 4. 部署
        if target == 'staging':
            self.deploy_staging(version)
        elif target == 'production':
            # 生产部署需要额外检查
            self.verify_production_ready()
            self.deploy_production(version)

        # 5. 验证
        self.verify_deployment(target, version)

        return f"✓ Deployed {version} to {target}"
```

--

**使用方式：**

```bash
$ /deploy production v1.2.3

✓ Building version v1.2.3...
✓ Running tests...
✓ Verifying production readiness...
✓ Deploying to production...
✓ Verifying deployment...
✓ Deployed v1.2.3 to production
```

---

## 高级主题 2：多 Agent 协作

**场景：** 大型功能开发

```
┌─────────────────────────┐
│   用户需求              │
│ "实现用户分析仪表板"     │
└────────────┬────────────┘
             │
    ┌────────▼────────┐
    │ Explore Agent 1  │
    │ 分析前端架构     │
    └────┬─────────────┘
         │
    ┌────▼──────────────┐
    │ Explore Agent 2   │
    │ 分析后端 API     │
    └────┬──────────────┘
         │
    ┌────▼──────────────┐
    │ Explore Agent 3   │
    │ 分析数据库结构    │
    └────┬──────────────┘
         │
    ┌────▼────────────────┐
    │ Plan Agent           │
    │ 综合设计方案         │
    └────┬─────────────────┘
         │
    ┌────▼──────────────┐
    │ 👤 人工决策       │
    │ 批准总体方案      │
    └────┬──────────────┘
         │
    ┌────▼────────────────┐
    │ General Agent 1      │
    │ 实现前端逻辑         │
    └────┬─────────────────┘
         │
    ┌────▼────────────────┐
    │ General Agent 2      │
    │ 实现后端 API        │
    └────┬─────────────────┘
         │
    ┌────▼────────────────┐
    │ General Agent 3      │
    │ 编写集成测试         │
    └────┬─────────────────┘
         │
         ✅ 完成
```

---

## 高级主题 3：Claude Code 技巧和窍门

### 技巧 1：充分的上下文

**不好的提问：**
```
"帮我修复认证 bug"
```

--

**更好的提问：**
```
"我们的认证系统使用 JWT + refresh token。
用户报告登录后随机失效。
错误发生在 src/middleware/auth.ts 的 verifyToken。
这是一个间歇性问题。
请帮我调查并修复。"
```

--

**关键：** 提供尽可能多的上下文帮助 AI 更快理解问题

---

### 技巧 2：分步骤提问

**不好的方式：**
> "重写整个认证系统"

--

**更好的方式：**
```
1. 首先用 Explore 理解现有系统
2. 用 Plan 设计新系统
3. 逐个模块实现和测试
4. 最后集成验证
```

--

**关键：** 复杂任务分解成小步骤，便于监控和纠正

---

### 技巧 3：充分利用 Skills

```
❌ 手动 git commit 和 PR 审查
✅ 使用 /commit 和 /review-pr skills

❌ 手动数据处理
✅ 使用 /xlsx skill

❌ 手动文档编写
✅ 使用 /doc-coauthoring skill

❌ 手动 UI 测试
✅ 使用 /webapp-testing skill
```

---

### 技巧 4：设置合理的期望

<div class="card card-highlight">
<h4>✓ Claude Code 擅长的</h4>
<ul>
<li>代码阅读和分析</li>
<li>重复性任务自动化</li>
<li>代码生成和补全</li>
<li>安全审查</li>
<li>文档生成</li>
</ul>
</div>

<div class="card">
<h4>❌ 需要人工的</h4>
<ul>
<li>产品需求确定</li>
<li>架构决策</li>
<li>用户体验设计</li>
<li>业务逻辑验证</li>
<li>上线决策</li>
</ul>
</div>

---

### 技巧 5：持续学习和优化

**建立反馈回路：**

```
1️⃣ 使用 Claude Code
2️⃣ 评估输出质量
3️⃣ 记录成功的提示
4️⃣ 分享到团队
5️⃣ 不断优化工作流
```

---

## 常见问题 & 解答

### Q1：Claude Code 会替代开发者吗？

**A：** 不会。Claude Code 是**协作工具**，而非替代品。

- 🤖 AI：自动化低价值的重复工作
- 👤 人类：做高价值的决策
- ⚖️ 平衡：人机协作，发挥各自优势

---

### Q2：如何确保代码质量和安全性？

**A：** 多层把关

```
1. Explore → 充分理解现状
2. Plan → 设计审查
3. /review-pr → 自动安全检测
4. 人工审查 → 最终把控
5. 测试 → 验证正确性
```

---

### Q3：Claude Code 对团队协作有帮助吗？

**A：** 非常有帮助

- ✓ **知识共享** - Explore 帮助新成员快速上手
- ✓ **标准统一** - Skills 确保代码风格一致
- ✓ **效率提升** - 整体生产力提高 60-75%
- ✓ **质量保证** - 自动化检测常见问题

---

### Q4：学习曲线陡峭吗？

**A：** 分三个阶段

```
第一周：学习基础 Commands
  → Read、Edit、Bash、Grep 的基本用法

第二周：学习高级工具 Skills 和 Agents
  → /commit、/review-pr、Explore、Plan

第三周：优化工作流
  → 定制团队的最佳实践
```

---

### Q5：我的公司敏感信息会被泄露吗？

**A：** 不会。Claude Code 的安全特性

- 🔐 **本地优先** - 代码保存在本地
- 🔒 **加密通信** - 与 Claude 服务的通信加密
- ✅ **审计日志** - 所有操作都可追踪
- 🚫 **无缓存** - 敏感数据不被保存
- 📋 **MCP 认证** - 外部 API 调用受控

---

### Q6：什么项目适合 Claude Code？

**A：** 几乎所有项目，特别是：

- ✓ **大型项目** - 代码库复杂，导航困难
- ✓ **团队项目** - 需要规范和一致性
- ✓ **快速迭代** - 需要高效率
- ✓ **维护项目** - 需要定期修复和优化
- ✓ **跨语言** - 需要支持多种技术栈

---

### Q7：如何衡量 Claude Code 的投资回报？

**A：** 关键指标

| 指标 | 基准 | 目标 |
|------|------|------|
| 功能开发速度 | 1x | 2.5x |
| Bug 修复速度 | 1x | 2.5x |
| 代码审查时间 | 1x | 0.3x |
| 安全问题遗漏 | 基准 | -70% |
| 团队满意度 | 基准 | +50% |

---

## Vibe Coding 的未来

**工程师角色的演变：**

```
2000s: 程序员
  ↓ 编写代码、修复 Bug

2010s: 开发工程师
  ↓ 设计系统、重视架构

2020s: 软件工程师
  ↓ 管理复杂度、做出决策

2030s: AI 时代的工程师
  ↓ Vibe Coding 范式
  ↓ 人负责意图和决策
  ↓ AI 负责实现
```

--

**关键转变：**
- 从"怎么写代码"转变为"怎么指导 AI"
- 从"执行者"转变为"指挥官"
- 从"手工业"转变为"工程化"

---

## 总结：Vibe Coding 和 Claude Code 的意义

<div class="card card-highlight">
<h4>🎯 核心价值</h4>
<p>解放工程师的时间，让他们专注于真正有价值的工作：系统设计、架构决策、业务创新。</p>
</div>

--

**四大能力的完美组合：**

1. **Skills** - 效率倍增器
2. **Agents** - 智能助手
3. **MCP** - 无限扩展
4. **Commands** - 精确控制

=== **Vibe Coding** ===

--

**三个核心原则：**

1. ✓ **人负责决策** - 所有后果由人承担
2. ✓ **充分的上下文** - 给 AI 足够的信息
3. ✓ **质量循环** - 人工审查和反馈

---

## 接下来的行动

<div class="workflow-step">
<div class="workflow-step-number">1</div>
<div class="workflow-step-content">
<p class="workflow-step-title">今天</p>
<p class="workflow-step-desc">尝试一个 Claude Code Skill（如 /commit）</p>
</div>
</div>

<div class="workflow-step">
<div class="workflow-step-number">2</div>
<div class="workflow-step-content">
<p class="workflow-step-title">本周</p>
<p class="workflow-step-desc">学习 Explore 和 Plan Agents</p>
</div>
</div>

<div class="workflow-step">
<div class="workflow-step-number">3</div>
<div class="workflow-step-content">
<p class="workflow-step-title">本月</p>
<p class="workflow-step-desc">在实际项目中应用完整工作流</p>
</div>
</div>

<div class="workflow-step">
<div class="workflow-step-number">4</div>
<div class="workflow-step-content">
<p class="workflow-step-title">持续</p>
<p class="workflow-step-desc">分享经验，优化团队工作流</p>
</div>
</div>

---

## 资源和参考

**官方文档：**
- Claude Code 文档：https://docs.anthropic.com/claude-code
- MCP 协议：https://modelcontextprotocol.io/
- Reveal.js 演示框架：https://revealjs.com/

**社区：**
- Claude 论坛：community.anthropic.com
- GitHub Discussions：github.com/anthropics/claude-code

**推荐阅读：**
- Prompt Engineering Best Practices
- System Design Patterns
- AI-Assisted Development Workflows

---

## 谢谢！

**问答时间**

💬 有什么问题或想探讨的吗？

---

## 附录：更多 Q&A

### Q：Claude Code 支持哪些编程语言？

**A：** 所有主流编程语言：
- JavaScript/TypeScript
- Python
- Java
- Go
- Rust
- PHP
- 等等

### Q：如何在团队中推行 Vibe Coding？

**A：** 分阶段推进：
1. 领导者示范
2. 小范围试点
3. 收集反馈
4. 全团队推广
5. 持续优化

### Q：Claude Code 需要付费吗？

**A：** 根据使用量计费，有免费额度。详见官方文档。

### Q：如何处理离线工作？

**A：** Claude Code 支持本地工作，但需要网络连接来使用 AI 能力。
