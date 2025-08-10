<!-- 横幅图片 -->
<div align="center">
  <img src="../assets/fewinfos-banner.png" alt="欢迎来到 FEWINFOS Contribution - GitHub Repository Stats Widget" width="100%">
</div>

# 📦 GitHub 仓库统计小部件

一个开源、完全客户端运行的工具，以交互和可定制的格式可视化 **实时 GitHub 仓库统计信息** —— 非常适合开发者、开源维护者和作品集建设者。

---

## 🎯 目标

该小部件使用 GitHub REST API 获取并显示任何公共 GitHub 仓库的各种元数据和洞察信息。它 **完全在浏览器中运行**，无需后台或身份验证。

---

## ✨ 功能特点

- 🔄 通过 GitHub REST API 实时获取数据
- ⭐ 显示 stars、forks、watchers、issues 和 pull requests
- 👥 显示主要贡献者（头像 + 提交次数）
- 📊 使用交互式图表展示使用的编程语言
- 📅 显示仓库创建日期和最后更新时间
- 📜 显示许可证信息
- 🎨 界面简洁、响应式且可定制
- 💻 直接在任意浏览器中运行（无需服务器配置）
- 🧩 可轻松嵌入到网站或 README.md 文件
- 📈 可选的 Chart.js 图表可视化

---

## 🧱 技术栈

- **HTML** – 结构与布局
- **CSS** – 样式与响应式设计
- **JavaScript** – 逻辑与 API 处理
- **GitHub REST API** – 数据来源
- **Chart.js** – 图表渲染（可选）

---

## 📊 可用小部件

### 🔍 仓库统计

- ⭐ Stars / 🍴 Forks / 👁️ Watchers 计数器
- 📅 仓库创建日期与最后更新日期
- 📜 许可证类型显示
- 📊 语言使用情况（饼图、柱状图、圆环图）
- 📦 依赖关系图（npm、pip 等）
- 📈 提交活动热力图
- 🕐 平均 PR 合并时间
- 🧵 Issue 状态分布（打开 / 关闭 / 置顶）

### 👥 贡献者小部件

- 👥 主要贡献者（头像 + 提交次数）
- 📊 按星期统计贡献
- 🗺️ 贡献者位置地图（公共数据）
- ⏱️ 最近贡献者（最近 7 / 30 天）
- 📈 按时间的贡献变化（堆叠面积图）

### 📊 图表类小部件

- 📊 仓库健康状况雷达图（stars、forks、PR、issues）
- 📉 stars/forks 增长趋势折线图
- 🍩 语言使用情况圆环图
- 📈 issues/PR 趋势面积图
- 📆 GitHub 风格日历热力图

### ⚙️ DevOps & CI/CD 小部件

- 🚦 GitHub Actions CI/CD 状态徽章
- 🧪 代码覆盖率徽章（Codecov、Coveralls）
- 🔄 最近一次工作流运行状态
- 🛠️ 构建历史时间线（成功/失败可视化）

### 📌 Issue & PR 小部件

- 📋 置顶的 issues 或讨论
- 🔍 Issue 标签词云
- 📬 PR 合并状态/比例追踪
- 📈 Issue 情感分析指标（基于关键词）

### 🧩 其他小部件

- 📌 收藏/关注仓库按钮
- 🔍 内联搜索以输入其他仓库
- 🧠 AI 驱动的提交摘要（可选）
- 🔗 相关仓库小部件
- 🪄 将小部件导出为 iframe / HTML 嵌入

---

## 📂 项目结构

github-repo-stats-widget/
├── index.html # 主 HTML 文件
├── style.css # CSS 样式
├── repo.js # 核心 JavaScript 逻辑
├── charts.js # 图表渲染逻辑
├── assets/ # 图标、截图
├── README.md # 本文档
└── LICENSE # MIT 许可证

---

## 🚀 部署

你可以将该小部件部署到 **GitHub Pages**，或使用任何静态托管服务（如 Netlify、Vercel 或 Firebase）。

### 通过 GitHub Pages 部署

1. 将项目推送到 GitHub
2. 进入 **Settings → Pages**
3. 选择分支：`main`，文件夹：`/ (root)`
4. 你的 widget 将托管在：  
   `https://yourusername.github.io/github-repo-stats-widget/`