# md2pic - Markdown转图片工具

一个专业的Markdown转图片工具，提供实时预览、可视化编辑和高质量图片导出功能。

## ✨ 项目特点

- **实时预览**：Markdown内容即时渲染为可视化图片
- **拖拽编辑**：支持元素的拖拽移动、缩放和精确定位
- **智能分页**：基于标题层级的自动分页功能
- **样式控制**：丰富的字体、颜色、对齐和布局选项
- **多格式导出**：支持PNG、JPEG、WebP格式，可配置质量和分辨率
- **批量处理**：一键导出多页内容为ZIP文件

## 🛠 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite 6
- **状态管理**：Zustand
- **路由管理**：React Router DOM 7
- **样式框架**：Tailwind CSS 3
- **Markdown解析**：marked + react-markdown
- **图片导出**：html2canvas
- **文件处理**：file-saver + jszip
- **UI组件**：lucide-react (图标) + sonner (通知)

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📖 功能说明

### 1. Markdown编辑器

- 支持标准Markdown语法
- 实时预览渲染效果
- 文件导入导出功能
- 语法高亮显示

### 2. 可视化画布

- 实时渲染Markdown内容
- 支持元素选择和高亮
- 拖拽移动和缩放功能
- 响应式画布尺寸

### 3. 元素编辑

- **内容编辑**：双击元素进行文本编辑
- **样式控制**：字体大小、颜色、对齐方式
- **位置调整**：精确的X/Y坐标控制
- **尺寸设置**：宽度和高度的像素级调整

### 4. 画布格式

预设多种常用尺寸：
- **方形格式**：1080×1080 (Instagram Post)
- **横向格式**：1920×1080 (YouTube缩略图)
- **竖向格式**：1080×1920 (Instagram Story)
- **自定义格式**：支持任意尺寸设置

### 5. 智能分页

基于Markdown标题层级的分页策略：

- **H1分割**：不分页，所有内容在一页
- **H2分割**：遇到H1或H2时分页
- **H3分割**：遇到H1、H2或H3时分页

### 6. 导出功能

- **单页导出**：当前页面导出为图片
- **批量导出**：所有页面打包为ZIP文件
- **格式选择**：PNG（无损）、JPEG（小文件）、WebP（平衡）
- **质量控制**：0.1-1.0可调节压缩质量
- **分辨率缩放**：0.5x-3x分辨率倍数
- **水印功能**：可选添加项目水印

## 🎯 使用场景

- **技术文档可视化**：将技术文档转换为美观的图片分享
- **社交媒体内容**：创建适合各平台的图文内容
- **教学材料制作**：将课程内容制作为图片格式
- **演示文稿辅助**：快速生成演示用图片
- **博客配图生成**：为博客文章生成配图

## 📁 项目结构

```
src/
├── components/          # 核心组件
│   ├── MarkdownEditor.tsx    # Markdown编辑器
│   ├── VisualCanvas.tsx      # 可视化画布
│   ├── ElementEditPanel.tsx  # 元素编辑面板
│   ├── PageSplitPanel.tsx    # 分页控制面板
│   ├── CanvasFormatPanel.tsx # 画布格式面板
│   ├── ExportPanel.tsx       # 导出功能面板
│   └── StylePanel.tsx        # 样式控制面板
├── lib/                # 核心逻辑
│   ├── markdownParser.ts     # Markdown解析和分页
│   └── utils.ts              # 工具函数
├── store/              # 状态管理
│   └── useAppStore.ts        # Zustand状态存储
├── pages/              # 页面组件
│   ├── Home.tsx              # 首页
│   └── Editor.tsx            # 编辑器页面
└── hooks/              # 自定义Hook
    └── useTheme.ts           # 主题控制
```

## 🎨 样式定制

项目使用Tailwind CSS进行样式管理，支持：

- 响应式设计
- 深色/浅色主题切换
- 自定义颜色配置
- 模块化组件样式

## 📝 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📞 支持

如有问题或建议，请通过以下方式联系：

- 提交 [GitHub Issue](https://github.com/clcmj/md2pic/issues)
- 发送邮件至项目维护者

---

**md2pic** - 让Markdown内容更具视觉表现力 ✨
