# 🚀 快速部署指南（无需安装 CLI 工具）

## ✅ 优势

- ✅ 不需要安装任何 CLI 工具
- ✅ 使用网页界面，操作简单直观
- ✅ 所有步骤都有详细说明

---

## 第一步：创建 GitHub 仓库（2分钟）

### 1.1 访问 GitHub

1. 打开浏览器，访问：**https://github.com/new**
2. 如果没有账号，先注册（免费）

### 1.2 创建仓库

填写以下信息：
- **Repository name**: `shopify-mcp-server`
- **Description**: `Shopify MCP Server for Dify Integration`
- **Visibility**: 选择 **Public** ✅
- ⚠️ **不要**勾选任何初始化选项（README、.gitignore、license）

点击 **"Create repository"**

### 1.3 复制仓库地址

创建成功后，您会看到类似这样的地址：
```
https://github.com/您的用户名/shopify-mcp-server.git
```
**请复制这个地址！**

---

## 第二步：推送代码到 GitHub（1分钟）

### 2.1 在 PowerShell 中执行

在 `shopify-mcp-server` 目录下，执行以下命令：

```powershell
# 1. 添加远程仓库（替换成您实际的 GitHub 用户名）
git remote add origin https://github.com/您的用户名/shopify-mcp-server.git

# 2. 确保分支名为 main
git branch -M main

# 3. 推送到 GitHub
git push -u origin main
```

### 2.2 如果要求输入凭据

**重要**：GitHub 不再支持密码认证，需要使用 Personal Access Token

1. **获取 Token**：
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 填写 Note：`Shopify MCP Server`
   - 勾选权限：**repo**（全部仓库权限）
   - 点击 "Generate token"
   - **复制生成的 Token**（只显示一次！）

2. **推送时**：
   - Username：输入您的 GitHub 用户名
   - Password：**粘贴刚才复制的 Token**（不是账号密码）

---

## 第三步：在 Vercel 部署（5分钟）

### 3.1 访问 Vercel

1. 打开：**https://vercel.com**
2. 点击 **"Sign Up"** 或 **"Log In"**
3. 选择 **"Continue with GitHub"**
4. 授权 Vercel 访问您的 GitHub 账号

### 3.2 导入项目

1. 登录后，点击 **"Add New..."** 按钮
2. 选择 **"Project"**
3. 在仓库列表中找到 **"shopify-mcp-server"**
4. 点击 **"Import"**

### 3.3 配置项目

在配置页面：

1. **Framework Preset**：
   - 选择 **"Other"** 或 **"Node.js"**

2. **Root Directory**：
   - 保持默认：`./`

3. **Build Command**：
   - **留空**（不需要构建）

4. **Output Directory**：
   - **留空**

5. **Install Command**：
   - 保持默认：`npm install`

### 3.4 设置环境变量 ⚠️ 非常重要！

在 **"Environment Variables"** 部分，点击 **"Add"** 添加：

#### 变量 1：
- **Name**: `SHOPIFY_STORE`
- **Value**: `happier-shopping-3.myshopify.com`
- **Environment**: 选择所有（✅ Production, ✅ Preview, ✅ Development）
- 点击 **"Add"**

#### 变量 2：
- **Name**: `SHOPIFY_ACCESS_TOKEN`
- **Value**: `your_shopify_access_token_here`
- **Environment**: 选择所有（✅ Production, ✅ Preview, ✅ Development）
- 点击 **"Add"**

### 3.5 部署

1. 确认所有设置正确
2. 点击 **"Deploy"** 按钮
3. 等待部署完成（通常 1-2 分钟）
4. **复制部署地址**（类似：`https://shopify-mcp-server-xxxxx.vercel.app`）

### 3.6 验证部署

在浏览器中访问：
```
https://您的vercel地址.vercel.app/health
```

应该看到：
```json
{
  "status": "ok",
  "service": "shopify-mcp-server",
  "store": "happier-shopping-3.myshopify.com",
  "token_configured": true
}
```

✅ 如果看到这个，说明部署成功！

---

## 第四步：在 Dify 中配置（2分钟）

### 4.1 登录 Dify

1. 访问 Dify 平台
2. 使用您的账号登录：
   - **邮箱**: `social3085@social.helwan.edu.eg`
   - **密码**: `Welcome@123`

### 4.2 添加 MCP 服务器

1. 在左侧导航栏，点击 **"工具"**
2. 在下拉菜单中，选择 **"MCP"**
3. 点击 **"添加 MCP 服务器（HTTP）"** 按钮

### 4.3 填写服务器信息

1. **服务器 URL**：
   - 输入：`https://您的vercel地址.vercel.app`
   - 例如：`https://shopify-mcp-server-xxxxx.vercel.app`
   - ⚠️ 确保包含 `https://` 前缀

2. **名称**：
   - 输入：`Shopify MCP`

3. **服务器标识符**：
   - 输入：`shopify_mcp`
   - ⚠️ **注意**：创建后无法更改

4. 点击 **"保存"**

### 4.4 验证连接

保存后，Dify 会自动连接到服务器。如果成功，您会看到：
- ✅ 服务器状态：已连接
- ✅ 工具列表：显示 3 个工具
  - `get_products` - 获取商品列表
  - `get_product_by_id` - 根据 ID 获取商品
  - `search_products` - 搜索商品

---

## 🎉 完成！

恭喜！您现在可以：
1. ✅ 在 Dify 中创建 Agent 应用
2. ✅ 添加 Shopify MCP 工具
3. ✅ 查询 Shopify 商品信息

---

## 🐛 常见问题

### Q1: Git 推送失败，提示认证错误

**解决方案**：
- 确保使用 Personal Access Token 而不是密码
- Token 需要有 `repo` 权限
- 如果 Token 过期，重新生成一个

### Q2: Vercel 找不到仓库

**检查**：
- 确保 GitHub 仓库是 Public
- 确保已授权 Vercel 访问 GitHub
- 刷新页面重试

### Q3: 部署后无法访问

**检查**：
- 访问 `/health` 端点验证
- 查看 Vercel 部署日志
- 确认环境变量已正确设置

---

## 📞 需要帮助？

如果遇到任何问题，请告诉我具体的错误信息，我会帮您解决！

