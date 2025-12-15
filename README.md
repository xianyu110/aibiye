# 智能文本降重工具 (AI Text Paraphrasing Tool)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/你的用户名/你的仓库名)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

基于 DeepSeek API 构建的现代化文本降重工具。通过先进的 AI 技术，智能改写文本内容，有效降低重复率，适用于论文、报告、文章等各类文本的原创性优化。

## 🌟 项目亮点

*   **智能改写**: 利用 DeepSeek 模型的强大语言理解能力，生成高质量的同义替换和句式重构。
*   **多种模式**: 提供标准、轻度、深度、学术四种改写模式，满足不同场景需求。
*   **保持原意**: 确保改写后的文本保持原文核心含义，保留专业术语和专有名词。
*   **友好界面**: 使用 Tailwind CSS 打造的现代化响应式界面，支持实时字符统计。
*   **高效处理**: 支持大文本分段处理，提供流畅的加载动画和进度反馈。

## 🚀 核心功能

1.  **多种改写模式**:
    *   **标准改写**: 保持专业术语，改变表达方式
    *   **轻度改写**: 小幅调整语句结构，保持原文风格
    *   **深度改写**: 大幅重构句子，显著降低重复率
    *   **学术风格**: 转换为更正式的学术语言风格

2.  **智能处理**:
    *   自动识别并保留专业术语
    *   智能重构句子结构
    *   优化语言表达方式
    *   支持中英文混合输入

3.  **用户体验**:
    *   实时字符和词数统计
    *   流畅的加载动画
    *   清晰的改写进度提示
    *   一键复制改写结果

## 🛠️ 技术栈

*   **前端框架**: React 19 + TypeScript
*   **构建工具**: Vite
*   **样式库**: Tailwind CSS
*   **AI 模型**: DeepSeek API
*   **图标库**: Lucide React

## 📂 项目结构

*   `App.tsx`: 主应用逻辑及状态管理
*   `services/geminiService.ts`: DeepSeek API 调用封装
*   `components/ParaphraseForm.tsx`: 文本输入和模式选择组件
*   `components/LoadingView.tsx`: 加载动画组件
*   `components/ResultView.tsx`: 结果展示组件

## 🚀 快速开始

### 本地开发

#### 1. 克隆项目

```bash
git clone https://github.com/你的用户名/你的仓库名.git
cd 你的仓库名
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 配置环境变量

复制 `.env.example` 到 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 DeepSeek API Key：

```env
# DeepSeek API Key (从 https://platform.deepseek.com/ 获取)
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here

# DeepSeek API URL (可选，使用默认地址)
VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions

# DeepSeek 模型名称 (可选，使用默认模型)
VITE_DEEPSEEK_MODEL=deepseek-chat
```

#### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 即可使用。

### Vercel 部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/你的用户名/你的仓库名)

详细部署步骤请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📖 使用说明

1. **选择改写模式**: 根据需求选择合适的改写强度
2. **输入文本**: 在文本框中粘贴或输入需要降重的内容
3. **开始改写**: 点击"开始改写"按钮，等待 AI 处理
4. **查看结果**: 在结果页面查看改写后的文本，支持一键复制

### 使用技巧

- 建议分段输入，每次处理 1000-2000 字符效果最佳
- 深度改写模式重复率更低，但需要仔细核对内容
- 改写后请务必检查专业术语和关键信息的准确性
- 使用快捷键 `Ctrl+Enter` 快速开始改写

## ⚠️ 免责声明

本工具生成的改写内容仅供参考，使用者需要：
1. 对改写结果进行仔细核对和校验
2. 确保专业术语和关键信息的准确性
3. 遵循所在机构或学校的学术规范
4. 承担最终文本内容的学术责任

**严禁直接用于抄袭或学术不端行为**。

## 📦 项目文件说明

- `DEPLOYMENT.md` - Vercel 部署详细指南
- `GITHUB_SETUP.md` - GitHub 上传步骤说明
- `deploy.sh` - 一键部署脚本
- `vercel.json` - Vercel 配置文件
- `.env.example` - 环境变量模板

## 🔧 技术细节

### 环境变量

项目使用 Vite 的环境变量系统，所有环境变量必须以 `VITE_` 开头才能在客户端代码中访问。

### API 配置

DeepSeek API 配置在 `services/geminiService.ts` 中，支持自定义 API 端点和模型。

### 构建优化

- 使用 Vite 进行快速构建和热更新
- 自动代码分割和懒加载
- 生产环境自动压缩和优化

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件