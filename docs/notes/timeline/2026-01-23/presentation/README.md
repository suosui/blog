# Vibe Coding & Claude Code 技术演讲

> 从「写代码」到「驾驭代码」的新开发范式

一个关于 Vibe Coding 理念和 Claude Code 三大核心功能的综合技术演讲，采用 Reveal.js 框架，包含约 50 张交互式幻灯片。

## 📂 目录结构

```
presentation/
├── index.html                 # 主演讲文件
├── custom.css                 # 自定义样式（深色技术主题）
├── custom.js                  # Reveal.js 配置
├── README.md                  # 使用说明（此文件）
└── sections/                  # 演讲内容（Markdown 格式）
    ├── 01-vibe-coding.md      # Section 1: Vibe Coding 介绍 (12 slides)
    ├── 02-claude-code-overview.md  # Section 2: Claude Code 概览 (6 slides)
    ├── 03-skills.md           # Section 3.1: Skills 深入 (5 slides)
    ├── 04-agents.md           # Section 3.2: Agents 深入 (5 slides)
    ├── 05-mcp.md              # Section 3.3: MCP 深入 (5 slides)
    ├── 06-commands.md         # Section 3.4: Commands 深入 (5 slides)
    ├── 07-workflows.md        # Section 4: 实战工作流 (8 slides)
    └── 08-advanced.md         # Section 5: 高级主题 & Q&A (4 slides)
```

## 🚀 快速开始

### 本地预览

1. **打开演讲**：在浏览器中打开 `index.html`
   ```bash
   # 方法 1：直接在浏览器中打开
   open index.html

   # 方法 2：使用本地服务器（推荐）
   python3 -m http.server 8000
   # 然后访问 http://localhost:8000
   ```

2. **导航控制**
   - **空格键** - 下一张幻灯片
   - **Shift + 空格键** - 上一张幻灯片
   - **箭头键** - 在不同方向导航
   - **Esc** - 缩放视图，查看所有幻灯片
   - **S** - 打开演讲者视图（含备注）
   - **F** - 全屏模式
   - **B** - 黑屏（间歇）

### 演讲者模式

按 `S` 键打开演讲者视图，可以看到：
- 当前幻灯片和下一张幻灯片
- 演讲备注
- 倒计时器
- 幻灯片索引

## 📊 演讲内容概览

### 结构

| Section | 标题 | 幻灯片数 | 主题 |
|---------|------|--------|------|
| 1 | Vibe Coding 范式介绍 | 12 | 概念和原则 |
| 2 | Claude Code 概览 | 6 | 总体架构 |
| 3.1 | Skills - 专业工作流 | 5 | /commit, /review-pr |
| 3.2 | Agents - 自主化 | 5 | Explore, Plan |
| 3.3 | MCP - 无限扩展 | 5 | 协议和定制 |
| 3.4 | Commands - 基础操作 | 5 | Read, Edit, Bash |
| 4 | 实战工作流 | 8 | 7 个真实场景 |
| 5 | 高级主题 & Q&A | 4 | 定制、多Agent、技巧 |
| **总计** | | **50** | |

### 演讲时长建议

- **总演讲时间**：50-55 分钟
- **Section 1-2**（概念）：10-12 分钟
- **Section 3**（四大能力）：20-25 分钟 ⭐ 核心部分
- **Section 4**（工作流）：12-15 分钟
- **Section 5**（Q&A）：8-10 分钟
- **互动和演示**：根据需要灵活调整

## 🎨 设计主题

### 颜色方案（GitHub Dark 风格）

- **背景**：深灰色 (`#0d1117`)
- **主色**：蓝色 (`#58a6ff`) - 标题、强调
- **成功**：绿色 (`#3fb950`)
- **警告**：橙色 (`#d29922`)
- **错误**：红色 (`#f85149`)
- **紫色**：`#b392f0` - 次强调
- **文本**：浅灰色 (`#e6edf3`)

### 字体

- **标题和代码**：JetBrains Mono
- **正文**：Inter
- **代码高亮**：highlight.js with GitHub Dark theme

### 设计特色

- ✨ **Fragment 动画** - 逐步展示要点
- 📊 **对比卡片** - 传统 vs Vibe Coding
- 🔄 **工作流图** - 可视化流程
- 💻 **代码示例** - 实际代码片段和输出
- 📈 **表格和数据** - 清晰的数据展示

## ⌨️ 键盘快捷键

| 快捷键 | 功能 |
|-------|------|
| `Space` / `→` | 下一张 |
| `Shift+Space` / `←` | 上一张 |
| `↑` / `↓` | 垂直导航 |
| `Esc` | 幻灯片总览 |
| `S` | 演讲者视图 |
| `F` | 全屏 |
| `B` / `.` | 黑屏 |
| `W` | 白屏 |
| `C` | 聚焦/放大 |
| `?` | 帮助 |

## 📝 自定义和扩展

### 修改幻灯片内容

1. 编辑 `sections/*.md` 文件
2. 使用 `---` 分隔水平幻灯片
3. 使用 `--` 分隔垂直幻灯片

### 修改样式

编辑 `custom.css` 文件：
- 修改颜色变量（在 `:root` 部分）
- 调整字体和大小
- 自定义卡片和组件样式

### 修改 Reveal.js 配置

编辑 `custom.js` 文件：
```javascript
Reveal.initialize({
    // 修改这里的配置选项
    transition: 'slide',      // 过渡效果
    transitionSpeed: 'default', // 速度
    slideNumber: 'c/t',       // 幻灯片编号格式
    // ... 更多配置
});
```

## 📤 导出为 PDF

### 使用浏览器打印功能

1. 打开演讲
2. 按 `Esc` 进入幻灯片总览
3. 按 `Ctrl+P`（Windows）或 `Cmd+P`（Mac）打印
4. 选择"Save as PDF"
5. 在打印对话框中：
   - 勾选"背景图形"
   - 设置边距为"无"
   - 选择"纵向"

### 使用 Decktape（推荐）

```bash
# 安装 Decktape
npm install -g decktape

# 导出为 PDF
decktape reveal index.html presentation.pdf

# 导出为其他格式
decktape reveal index.html presentation.pptx  # PowerPoint
decktape reveal index.html presentation.html  # HTML
```

## 🔧 部署

### GitHub Pages 部署

```bash
# 1. 创建 gh-pages 分支
git checkout --orphan gh-pages

# 2. 添加 presentation 目录的内容
git add docs/notes/timeline/2026-01-23/presentation/

# 3. 提交
git commit -m "Add presentation"

# 4. 推送
git push origin gh-pages

# 5. 在 GitHub Settings 中启用 Pages，选择 gh-pages 分支
```

### 其他部署方式

- **Vercel**：连接 GitHub 仓库，自动部署
- **Netlify**：类似 Vercel 的部署流程
- **自建服务器**：复制文件到 web 服务器

## 📚 相关资源

### 官方文档
- [Reveal.js 官方文档](https://revealjs.com/)
- [Claude Code 文档](https://docs.anthropic.com/claude-code)
- [MCP 协议](https://modelcontextprotocol.io/)

### 实用工具
- [Highlight.js](https://highlightjs.org/) - 代码高亮
- [reveal-code-focus](https://github.com/demystifyfp/reveal-code-focus) - 代码聚焦
- [Decktape](https://github.com/astefanutti/decktape) - PDF 导出

### 学习资源
- Claude 官方博客
- GitHub Discussions
- 社区论坛

## 💡 演讲建议

### 准备阶段

- ✓ 提前进行一次完整排练
- ✓ 测试所有媒体和链接
- ✓ 在演讲现场测试投影设备
- ✓ 准备备用笔记和提纲

### 演讲技巧

- **缓慢讲解** - 给听众阅读代码的时间
- **实时演示** - 如可能，现场演示 Claude Code
- **互动** - 鼓励提问，预留 Q&A 时间
- **讲故事** - 用真实案例说明效果
- **强调核心** - Section 3（四大能力）是重点

### 现场互动

- 💬 邀请观众提问
- 🎯 现场演示某个 Skill（如 `/commit`）
- 📱 分享演讲链接，观众可以在电脑上跟进
- ✍️ 准备工作坊或后续讨论会议

## 🐛 常见问题

**Q: 在 iPad 或移动设备上查看可以吗？**
A: 可以，Reveal.js 支持响应式设计。但建议用大屏幕演讲。

**Q: 可以离线使用吗？**
A: 部分功能可以。CDN 资源在加载后会被缓存，但首次需要网络。

**Q: 如何修改字体大小？**
A: 编辑 `custom.css` 中的 `font-size` 值，或修改 `index.html` 中的 `html { font-size: 16px; }`。

**Q: 如何添加新的幻灯片？**
A: 在相应的 `sections/*.md` 文件中添加内容，使用 `---` 分隔。

**Q: 可以在演讲中嵌入视频吗？**
A: 可以。在 Markdown 中使用 `<video>` 标签或 Reveal.js 的 `data-video` 属性。

## 📞 反馈和改进

如有改进建议，欢迎提出：
- 检查内容准确性
- 测试导航和交互
- 检查链接和资源
- 提出设计改进
- 分享使用体验

## 📄 许可

此演讲内容基于 Vibe Coding 理念和 Claude Code 官方文档。

---

**最后更新**：2026-01-23

**创建者**：赵成帮

**演讲框架**：Reveal.js 4.x

**主题**：GitHub Dark + Custom Tech

享受演讲！ 🎉
