# 🚀 部署到 Vercel - 完整指南

## 📦 当前项目状态

✅ **所有文件已准备完成**
- `server.js` - MCP 服务器主文件
- `package.json` - 项目配置
- `vercel.json` - Vercel 部署配置
- `.gitignore` - Git 忽略文件
- 所有文档已创建

✅ **Git 仓库已初始化并提交**

## 🎯 现在开始部署（3个简单步骤）

### 步骤 1：上传到 GitHub（5分钟）

#### 1.1 创建 GitHub 仓库

1. 访问：**https://github.com/new**
2. 填写：
   - **Repository name**: `shopify-mcp-server`
   - **Description**: `Shopify MCP Server for Dify`
   - **Visibility**: 选择 **Public** ✅
   - ⚠️ **不要**勾选任何初始化选项（README、.gitignore、license）
3. 点击 **"Create repository"**

#### 1.2 推送代码到 GitHub

**方法 A：使用自动化脚本（推荐）**

在 PowerShell 中（在 `shopify-mcp-server` 目录下）：

```powershell
.\自动部署.ps1
```

脚本会引导您完成所有步骤。

**方法 B：手动执行命令**

在 PowerShell 中执行：

```powershell
# 1. 添加远程仓库（替换成您的 GitHub 用户名）
git remote add origin https://github.com/您的用户名/shopify-mcp-server.git

# 2. 确保分支名为 main
git branch -M main

# 3. 推送到 GitHub
git push -u origin main
```

**⚠️ 重要提示**：
- 如果提示输入密码，请使用 **GitHub Personal Access Token**（不是账号密码）
- 获取 Token：https://github.com/settings/tokens
- 需要勾选 `repo` 权限

---

### 步骤 2：部署到 Vercel（5分钟）

#### 2.1 访问 Vercel

1. 打开：**https://vercel.com**
2. 点击 **"Sign Up"** 或 **"Log In"**
3. 选择 **"Continue with GitHub"**
4. 授权 Vercel 访问您的 GitHub 账号

#### 2.2 导入项目

1. 登录后，点击 **"Add New..."** 按钮
2. 选择 **"Project"**
3. 在仓库列表中找到 **"shopify-mcp-server"**
4. 点击 **"Import"**

#### 2.3 配置项目

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

#### 2.4 设置环境变量 ⚠️ 非常重要！

在 **"Environment Variables"** 部分：

**变量 1**：
- **Name**: `SHOPIFY_STORE`
- **Value**: `happier-shopping-3.myshopify.com`
- **Environment**: 选择所有（✅ Production, ✅ Preview, ✅ Development）
- 点击 **"Add"**

**变量 2**：
- **Name**: `SHOPIFY_ACCESS_TOKEN`
- **Value**: `your_shopify_access_token_here`
- **Environment**: 选择所有（✅ Production, ✅ Preview, ✅ Development）
- 点击 **"Add"**

#### 2.5 部署

1. 确认所有设置正确
2. 点击页面底部的 **"Deploy"** 按钮
3. 等待部署完成（通常 1-2 分钟）
4. **复制部署地址**（类似：`https://shopify-mcp-server-xxxxx.vercel.app`）

#### 2.6 验证部署

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

### 步骤 3：在 Dify 中配置（2分钟）

#### 3.1 登录 Dify

1. 访问 Dify 平台
2. 使用您的账号登录：
   - **邮箱**: `social3085@social.helwan.edu.eg`
   - **密码**: `Welcome@123`

#### 3.2 添加 MCP 服务器

1. 在左侧导航栏，点击 **"工具"**
2. 在下拉菜单中，选择 **"MCP"**
3. 点击 **"添加 MCP 服务器（HTTP）"** 按钮

#### 3.3 填写服务器信息

在弹出的表单中：

1. **服务器 URL**：
   - 输入：`https://您的vercel地址.vercel.app`
   - 例如：`https://shopify-mcp-server-xxxxx.vercel.app`
   - ⚠️ 确保包含 `https://` 前缀

2. **名称**：
   - 输入：`Shopify MCP`

3. **服务器标识符**：
   - 输入：`shopify_mcp`
   - ⚠️ **注意**：创建后无法更改

4. **图标**（可选）：
   - 可以留空

#### 3.4 保存并验证

1. 点击 **"保存"** 按钮
2. Dify 会自动连接到服务器
3. 如果成功，您会看到：
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

### Q1: GitHub 推送失败，提示需要认证

**解决方案**：
1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成后复制 Token
5. 推送时，用户名用 GitHub 用户名，密码用 Token

### Q2: Vercel 部署失败

**检查清单**：
- ✅ 环境变量是否正确设置
- ✅ `vercel.json` 文件是否存在
- ✅ 查看 Vercel 部署日志中的错误信息

### Q3: Dify 无法连接到服务器

**检查清单**：
- ✅ 服务器 URL 是否正确（包含 https://）
- ✅ 访问 `/health` 端点验证服务器是否运行
- ✅ Vercel 项目是否已成功部署

### Q4: 工具调用失败

**检查清单**：
- ✅ Shopify API 令牌是否有效
- ✅ 店铺域名是否正确
- ✅ 查看 Vercel 函数日志

---

## 📞 需要帮助？

如果遇到任何问题：
1. 查看 Vercel 部署日志
2. 查看 Dify 错误提示
3. 访问服务器健康检查端点
4. 检查环境变量设置

祝您使用愉快！🎊

