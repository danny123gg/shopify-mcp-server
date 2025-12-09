# 🚀 Vercel 部署详细步骤（手把手教程）

## 📋 准备工作检查清单

✅ 项目文件已准备完成  
✅ Git 仓库已初始化  
✅ 代码已提交  
✅ Shopify API 令牌：`your_shopify_access_token_here`  
✅ 店铺域名：`happier-shopping-3.myshopify.com`

---

## 第一步：创建 GitHub 仓库

### 1.1 访问 GitHub

1. 打开浏览器，访问：**https://github.com**
2. 如果没有账号，点击 "Sign up" 注册（免费）
3. 如果已有账号，点击 "Sign in" 登录

### 1.2 创建新仓库

1. 登录后，点击右上角的 **"+"** 图标
2. 选择 **"New repository"**（新建仓库）

3. 填写仓库信息：
   - **Repository name**（仓库名称）：`shopify-mcp-server`
   - **Description**（描述）：`Shopify MCP Server for Dify Integration`
   - **Visibility**（可见性）：选择 **Public**（公开）
   - ⚠️ **不要**勾选 "Add a README file"（我们已经有文件了）
   - ⚠️ **不要**添加 .gitignore 或 license

4. 点击 **"Create repository"**（创建仓库）

### 1.3 获取仓库地址

创建成功后，GitHub 会显示仓库页面，您会看到类似这样的地址：
```
https://github.com/您的用户名/shopify-mcp-server.git
```
**请复制这个地址，稍后会用到！**

---

## 第二步：上传代码到 GitHub

### 方法 A：使用命令行（推荐）

在 PowerShell 中执行以下命令（在 `shopify-mcp-server` 目录下）：

```powershell
# 1. 添加远程仓库（替换成您的 GitHub 用户名）
git remote add origin https://github.com/您的用户名/shopify-mcp-server.git

# 2. 重命名分支为 main（如果还没有）
git branch -M main

# 3. 推送代码到 GitHub
git push -u origin main
```

**注意**：第一次推送时，GitHub 可能会要求您输入用户名和密码（或 Personal Access Token）

### 方法 B：使用 GitHub Desktop（图形界面，更简单）

1. **下载 GitHub Desktop**
   - 访问：https://desktop.github.com/
   - 下载并安装

2. **登录 GitHub Desktop**
   - 打开 GitHub Desktop
   - 使用您的 GitHub 账号登录

3. **添加本地仓库**
   - 点击 "File" → "Add Local Repository"
   - 选择 `C:\Users\Danny\Desktop\cursor\shopify-mcp-server` 文件夹
   - 点击 "Add repository"

4. **发布到 GitHub**
   - 点击 "Publish repository" 按钮
   - 取消勾选 "Keep this code private"（因为我们选择公开仓库）
   - 点击 "Publish repository"

---

## 第三步：在 Vercel 部署

### 3.1 访问 Vercel

1. 打开浏览器，访问：**https://vercel.com**
2. 点击右上角的 **"Sign Up"** 或 **"Log In"**

### 3.2 使用 GitHub 登录

1. 点击 **"Continue with GitHub"**
2. 授权 Vercel 访问您的 GitHub 账号
3. 完成登录

### 3.3 导入项目

1. 登录后，点击 **"Add New..."** 按钮
2. 选择 **"Project"**（项目）

3. 在项目列表中，找到 **"shopify-mcp-server"**
   - 如果没看到，点击 **"Import"** 按钮
   - 搜索您的仓库名称

4. 点击 **"Import"** 导入项目

### 3.4 配置项目设置

在配置页面，按以下设置：

1. **Framework Preset**（框架预设）：
   - 选择 **"Other"** 或 **"Node.js"**

2. **Root Directory**（根目录）：
   - 保持默认：`./`（不需要修改）

3. **Build Command**（构建命令）：
   - **留空**（不需要构建）

4. **Output Directory**（输出目录）：
   - **留空**

5. **Install Command**（安装命令）：
   - 保持默认：`npm install`

### 3.5 设置环境变量 ⚠️ 重要！

在 **"Environment Variables"**（环境变量）部分，点击 **"Add"** 添加以下变量：

#### 变量 1：
- **Name**（名称）：`SHOPIFY_STORE`
- **Value**（值）：`happier-shopping-3.myshopify.com`
- **Environment**（环境）：选择所有（Production, Preview, Development）

点击 **"Add"** 保存

#### 变量 2：
- **Name**（名称）：`SHOPIFY_ACCESS_TOKEN`
- **Value**（值）：`your_shopify_access_token_here`
- **Environment**（环境）：选择所有（Production, Preview, Development）

点击 **"Add"** 保存

### 3.6 部署

1. 确认所有设置正确后
2. 点击页面底部的 **"Deploy"**（部署）按钮
3. 等待部署完成（通常需要 1-2 分钟）

### 3.7 获取部署地址

部署成功后，您会看到：

1. **部署状态**：显示 "Ready"（就绪）
2. **项目 URL**：类似 `https://shopify-mcp-server-xxxxx.vercel.app`
   - **请复制这个 URL！这是您的 MCP 服务器地址**

---

## 第四步：验证部署

### 4.1 健康检查

在浏览器中访问：
```
https://您的项目地址.vercel.app/health
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

### 4.2 测试 MCP 端点（可选）

您可以使用在线工具测试，或使用 PowerShell：

```powershell
# 替换成您的实际地址
$url = "https://您的项目地址.vercel.app/"
$body = @{
    jsonrpc = "2.0"
    method = "tools/list"
    id = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
```

应该返回工具列表（get_products, get_product_by_id, search_products）

---

## 第五步：在 Dify 中配置

### 5.1 登录 Dify

1. 访问 Dify 平台
2. 使用您的账号登录：
   - 邮箱：`social3085@social.helwan.edu.eg`
   - 密码：`Welcome@123`

### 5.2 添加 MCP 服务器

1. 在左侧导航栏，点击 **"工具"**
2. 在下拉菜单中，选择 **"MCP"**
3. 点击 **"添加 MCP 服务器（HTTP）"** 按钮

### 5.3 填写服务器信息

在弹出的表单中填写：

1. **服务器 URL**：
   - 输入：`https://您的项目地址.vercel.app`
   - 例如：`https://shopify-mcp-server-xxxxx.vercel.app`
   - ⚠️ 确保包含 `https://` 前缀

2. **名称**：
   - 输入：`Shopify MCP`

3. **服务器标识符**：
   - 输入：`shopify_mcp`
   - ⚠️ **注意**：创建后无法更改，请谨慎填写

4. **图标**（可选）：
   - 可以留空，或上传 Shopify 图标

### 5.4 保存并验证

1. 点击 **"保存"** 按钮
2. Dify 会自动连接到服务器
3. 如果成功，您会看到：
   - ✅ 服务器状态：已连接
   - ✅ 工具列表：显示 3 个工具
     - `get_products`
     - `get_product_by_id`
     - `search_products`

---

## 第六步：在 Dify 应用中使用

### 6.1 创建 Agent 应用

1. 在 Dify 中，点击 **"应用"** → **"创建应用"**
2. 选择 **"Agent"** 类型
3. 填写应用名称，例如：`Shopify 商品查询助手`
4. 点击 **"创建"**

### 6.2 添加 MCP 工具

1. 在应用配置页面，点击 **"工具"** 选项卡
2. 在工具列表中，找到 **"Shopify MCP"** 下的工具
3. 选择需要的工具，点击 **"添加"**
   - 建议添加所有 3 个工具

### 6.3 测试应用

1. 在应用页面，点击 **"调试与预览"**
2. 输入测试查询，例如：
   - `查询店铺中的所有商品`
   - `搜索包含"T恤"的商品`
   - `获取商品ID为123的商品详情`
3. 点击 **"发送"**
4. 查看返回结果

---

## 🎉 完成！

恭喜！您已经成功：
- ✅ 创建了 Shopify MCP 服务器
- ✅ 部署到 Vercel
- ✅ 在 Dify 中配置
- ✅ 可以使用工具查询 Shopify 商品

---

## 🐛 遇到问题？

### 问题 1：GitHub 推送失败

**错误**：`remote: Support for password authentication was removed`

**解决方案**：
1. 在 GitHub 创建 Personal Access Token
2. 访问：https://github.com/settings/tokens
3. 点击 "Generate new token (classic)"
4. 勾选 `repo` 权限
5. 生成后，使用 token 作为密码

### 问题 2：Vercel 部署失败

**检查**：
- 环境变量是否正确设置
- `vercel.json` 文件是否存在
- 查看 Vercel 部署日志

### 问题 3：Dify 无法连接

**检查**：
- 服务器 URL 是否正确（包含 https://）
- 访问 `/health` 端点验证服务器是否运行
- 检查 Vercel 项目是否已部署成功

### 问题 4：工具调用失败

**检查**：
- Shopify API 令牌是否有效
- 店铺域名是否正确
- 查看 Vercel 函数日志

---

## 📞 需要帮助？

如果遇到任何问题，请：
1. 查看 Vercel 部署日志
2. 查看 Dify 错误提示
3. 访问服务器健康检查端点
4. 检查环境变量设置

祝您使用愉快！🎊

