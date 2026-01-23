# Skills - 专业工作流自动化

## 什么是 Skills？

**即开即用的、经过优化的工作流**

- 🎯 **有明确目标**：每个 skill 解决一个具体问题
- ⚙️ **质量一致性**：内置最佳实践
- 🚀 **大幅提升效率**：自动化繁琐的手动流程
- 🧩 **可扩展**：可创建团队专属 skills

--

**常见 Skills：**
- `/commit` - 规范的 Git 提交
- `/review-pr` - 代码安全审查
- `/xlsx` - 电子表格数据分析
- `/pdf` - PDF 处理和表单填充
- `/doc-coauthoring` - 协作文档编写

---

## 深入理解：/commit Skill

**问题：** 手动写 commit message 既费时又容易不规范

--

**传统流程：**
```bash
$ git status
$ git diff
$ git log --oneline -10
$ # 思考一下...
$ git commit -m "fix something"
$ # 或者写得很随意
```

💔 **问题：**
- 格式不一致
- 信息不清楚
- 历史记录难以追踪

---

## /commit 工作流深入

**Claude Code 的 /commit skill 做了什么：**

<div class="workflow-step">
<div class="workflow-step-number">1</div>
<div class="workflow-step-content">
<p class="workflow-step-title">分析 git status</p>
<p class="workflow-step-desc">了解哪些文件被修改</p>
</div>
</div>

<div class="workflow-step">
<div class="workflow-step-number">2</div>
<div class="workflow-step-content">
<p class="workflow-step-title">查看 git diff</p>
<p class="workflow-step-desc">理解具体改动内容</p>
</div>
</div>

<div class="workflow-step">
<div class="workflow-step-number">3</div>
<div class="workflow-step-content">
<p class="workflow-step-title">检查 git log</p>
<p class="workflow-step-desc">学习项目的 commit 风格</p>
</div>
</div>

<div class="workflow-step">
<div class="workflow-step-number">4</div>
<div class="workflow-step-content">
<p class="workflow-step-title">生成规范 message</p>
<p class="workflow-step-desc">遵循 Conventional Commits</p>
</div>
</div>

<div class="workflow-step">
<div class="workflow-step-number">5</div>
<div class="workflow-step-content">
<p class="workflow-step-title">创建提交</p>
<p class="workflow-step-desc">规范且清晰的历史记录</p>
</div>
</div>

---

## /commit 实际演示

**输入：**
```bash
# 修改了认证相关的代码
$ git add .
$ /commit
```

--

**输出示例：**
```
✓ Analyzing changes...
✓ Reading git history...
✓ Generating commit message...

[master abc1234] feat(auth): Add OAuth2 integration with GitHub
 5 files changed, 250 insertions(+), 45 deletions(-)
 - Added GitHubStrategy OAuth provider
 - Configured JWT token generation
 - Updated user session middleware
 - Added security tests

✓ Commit created successfully!
```

--

**质量提升：**
- ✓ **格式规范** - Conventional Commits 标准
- ✓ **信息清晰** - 自动总结改动要点
- ✓ **团队一致** - 学习项目历史风格
- ✓ **可追踪** - 便于后期搜索和分析

---

## Skills 的价值

<div class="comparison">
<div class="comparison-item bad">
<h4>❌ 没有 Skills</h4>
- 手动写 commit message
- 容易遗漏格式
- 安全审查依赖人力
- 效率低、易出错
</div>

<div class="comparison-item good">
<h4>✓ 有 Skills</h4>
- 自动生成规范 message
- 质量一致
- 自动化安全检测
- 效率高、可复现
</div>
</div>

---

## 其他实用 Skills 预览

<div class="card">
<h3>/xlsx</h3>
<p>数据分析、图表生成、数据透视表 - 无需手动计算</p>
</div>

<div class="card">
<h3>/pdf</h3>
<p>PDF 表单填充、文本提取、文档合并</p>
</div>

<div class="card">
<h3>/doc-coauthoring</h3>
<p>协作文档编写，带版本控制和评论</p>
</div>

<div class="card">
<h3>/webapp-testing</h3>
<p>自动化 Web 应用测试，检查 UI 功能</p>
</div>

---

## Skills 总结

✓ **效率放大器** - 自动化高频、低价值的任务    
✓ **质量守护者** - 确保一致的代码质量和安全性     
✓ **学习工具** - 通过 skill 的建议学习最佳实践    
✓ **可靠的助手** - 比人工更稳定和一致    

接下来，我们看 **Agents** 如何实现自主化...
