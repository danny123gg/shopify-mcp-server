# Shopify MCP Server

这是一个为 Dify 设计的 Shopify MCP 服务器，可以通过 HTTP 方式连接到 Dify 平台。

## 功能

- ✅ 获取商品列表（支持筛选）
- ✅ 根据 ID 获取商品详情
- ✅ 搜索商品

## 本地运行

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
```bash
cp .env.example .env
# 编辑 .env 文件，填入您的 Shopify Access Token
```

3. 启动服务器：
```bash
npm start
```

服务器将在 http://localhost:3000 运行

## 部署到 Vercel

### 方法一：使用 Vercel CLI

1. 安装 Vercel CLI：
```bash
npm install -g vercel
```

2. 登录 Vercel：
```bash
vercel login
```

3. 部署：
```bash
vercel
```

4. 设置环境变量：
   - 访问 https://vercel.com/dashboard
   - 选择您的项目
   - 进入 Settings → Environment Variables
   - 添加以下变量：
     - `SHOPIFY_STORE` = `happier-shopping-3.myshopify.com`
     - `SHOPIFY_ACCESS_TOKEN` = 您的访问令牌

5. 重新部署：
```bash
vercel --prod
```

### 方法二：通过 GitHub 部署

1. 将代码推送到 GitHub
2. 在 Vercel 控制台导入 GitHub 仓库
3. 设置环境变量
4. 自动部署

## 在 Dify 中配置

1. 登录 Dify
2. 进入：工具 → MCP
3. 点击"添加 MCP 服务器（HTTP）"
4. 填写：
   - 服务器 URL：`https://your-project.vercel.app`
   - 名称：`Shopify MCP`
   - 服务器标识符：`shopify_mcp`
5. 保存

## API 端点

- `POST /` - MCP JSON-RPC 端点
- `GET /health` - 健康检查

## MCP 工具

### get_products
获取商品列表，支持筛选

参数：
- `limit` (number): 返回数量，默认 10
- `title` (string): 按标题搜索
- `vendor` (string): 按供应商筛选
- `product_type` (string): 按类型筛选
- `tags` (string): 按标签筛选

### get_product_by_id
根据 ID 获取商品详情

参数：
- `product_id` (string): 商品 ID（必需）

### search_products
搜索商品

参数：
- `query` (string): 搜索关键词（必需）
- `limit` (number): 返回数量，默认 10

