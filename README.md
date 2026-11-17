# 个人IP内容中台

基于 Next.js 14 + Ant Design + Tailwind CSS + Prisma + PostgreSQL + DeepSeek AI 的个人IP内容创作与管理平台。

## 功能特性

### 1. 系列管理
- 创建和管理内容系列（如好物分享、通勤记录）
- 上传2-3篇参考文案
- AI自动分析写作风格（沈月/狂阿弥风格基准）

### 2. AI内容创作
- 系列内容：根据系列风格生成内容
- 单篇内容：学习全系列语言风格，自由创作
- 生成3个标题建议
- 生成完整正文（图文/视频脚本）
- 生成封面图设计描述
- 生成10-15个标签

### 3. 流量数据分析
- Excel/CSV 一键导入（支持小红书笔记列表明细表格式）
- AI分析数据表现，给出运营建议
- 生成追热点的衍生选题

### 4. 账号诊断
- 全量笔记数据分析
- 支持粘贴小红书后台截图
- AI整体诊断 + 内容规划 + 选题创新 + 改进建议
- AI 对话 chatbot，可追问运营问题

## 技术栈

- **框架**: Next.js 14 (App Router)
- **UI组件**: Ant Design 5
- **样式**: Tailwind CSS
- **ORM**: Prisma
- **数据库**: Vercel Postgres（生产）/ PostgreSQL（本地）
- **AI能力**: DeepSeek API
- **语言**: TypeScript
- **部署**: Vercel

## 一键部署到 Vercel

### 前置准备

1. 注册 [Vercel 账号](https://vercel.com)（用 GitHub 登录）
2. 注册 [DeepSeek 账号](https://platform.deepseek.com) 获取 API Key

### 部署步骤

#### 第 1 步：创建 Vercel Postgres 数据库

1. 进入 Vercel 项目 → **Storage** → **Create Database**
2. 选择 **Postgres**，取个名字，区域选 `Washington, D.C. (iad1)`（免费）
3. 创建后点 **Connect** 连接到项目

#### 第 2 步：配置环境变量

项目 → **Settings** → **Environment Variables**，添加：

| 名称 | 值 | 环境 |
|---|---|---|
| `DEEPSEEK_API_KEY` | 你的 DeepSeek API Key | Production, Preview, Development |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` | Production, Preview, Development |

#### 第 3 步：部署

点 **Deploy**，等待构建完成。

#### 第 4 步：初始化数据库表

部署成功后，在 Vercel 项目里打开 **Storage** → **Postgres** → **Data**，或者在本地执行：

```bash
# 安装 Vercel CLI
npm install -g vercel

# 连接项目
vercel link

# 拉取环境变量
vercel env pull

# 同步数据库表结构
npx prisma db push
```

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：
- `DEEPSEEK_API_KEY`：你的 DeepSeek API Key
- `DATABASE_URL`：本地 PostgreSQL 连接串

### 3. 初始化数据库

```bash
npx prisma db push
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

## 项目结构

```
ip-content-platform/
├── prisma/
│   └── schema.prisma       # 数据库Schema
├── public/
│   └── avatar.jpg          # 头像
├── src/
│   ├── app/
│   │   ├── api/            # API路由
│   │   │   ├── diagnosis/  # 账号诊断API
│   │   │   ├── generate/   # 内容生成API
│   │   │   ├── notes/      # 笔记数据API
│   │   │   ├── series/     # 系列管理API
│   │   │   └── traffic/    # 流量数据API
│   │   ├── create/         # 创作页面
│   │   ├── series/         # 系列管理页面
│   │   ├── analytics/      # 数据分析页面
│   │   ├── diagnosis/      # 账号诊断页面
│   │   ├── layout.tsx      # 根布局
│   │   └── page.tsx        # 首页
│   ├── components/
│   │   └── AppLayout.tsx   # 应用布局组件
│   └── lib/
│       ├── prisma.ts       # Prisma客户端
│       ├── deepseek.ts     # DeepSeek API集成
│       └── utils.ts        # 工具函数
├── .env.example            # 环境变量示例
├── vercel.json             # Vercel配置
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 数据库模型

- **Series** - 内容系列
- **ReferenceCopy** - 参考文案
- **GeneratedContent** - AI生成的内容底稿
- **TrafficData** - 流量数据
- **DerivedTopic** - 衍生选题
- **AccountDiagnosis** - 账号诊断报告

## 使用说明

### 创建系列
1. 进入"系列管理"页面
2. 点击"新建系列"，填写系列名称和描述
3. 添加2-3篇参考文案
4. 点击"分析风格"，AI自动分析写作风格

### 创作内容
1. 进入"内容创作"页面
2. 选择创作模式（系列内容/单篇内容）
3. 输入主题和补充要求
4. 点击"AI生成内容"
5. 在右侧查看生成结果（标题、正文、封面、标签）

### 数据分析
1. 进入"数据分析"页面
2. 点击"Excel导入"上传小红书笔记明细表
3. 查看笔记数据列表
4. 点击"AI分析"获取运营建议和衍生选题

### 账号诊断
1. 进入"账号诊断"页面
2. （可选）粘贴小红书后台截图
3. 点击"一键诊断"获取全量分析
4. 使用 AI 对话 chatbot 追问运营问题

## 许可证

MIT
