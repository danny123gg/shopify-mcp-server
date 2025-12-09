# Shopify MCP Server 自动部署脚本
# 使用方法：在 PowerShell 中执行：.\自动部署.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Shopify MCP Server 自动部署脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在正确的目录
if (-not (Test-Path "server.js")) {
    Write-Host "错误：请在 shopify-mcp-server 目录下运行此脚本" -ForegroundColor Red
    exit 1
}

# 步骤 1：检查 Git 配置
Write-Host "[1/5] 检查 Git 配置..." -ForegroundColor Yellow
$gitEmail = git config user.email
$gitName = git config user.name

if (-not $gitEmail -or -not $gitName) {
    Write-Host "  配置 Git 用户信息..." -ForegroundColor Gray
    git config user.email "social3085@social.helwan.edu.eg"
    git config user.name "Danny"
    Write-Host "  ✓ Git 配置完成" -ForegroundColor Green
} else {
    Write-Host "  ✓ Git 已配置" -ForegroundColor Green
}

# 步骤 2：检查远程仓库
Write-Host ""
Write-Host "[2/5] 检查 Git 远程仓库..." -ForegroundColor Yellow
$remoteUrl = git remote get-url origin 2>$null

if (-not $remoteUrl) {
    Write-Host "  需要添加 GitHub 远程仓库" -ForegroundColor Yellow
    Write-Host ""
    $githubUsername = Read-Host "  请输入您的 GitHub 用户名"
    if ($githubUsername) {
        $repoUrl = "https://github.com/$githubUsername/shopify-mcp-server.git"
        Write-Host "  添加远程仓库: $repoUrl" -ForegroundColor Gray
        git remote add origin $repoUrl
        Write-Host "  ✓ 远程仓库已添加" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ 跳过远程仓库配置，请稍后手动添加" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  手动添加命令：" -ForegroundColor Gray
        Write-Host "    git remote add origin https://github.com/您的用户名/shopify-mcp-server.git" -ForegroundColor Gray
    }
} else {
    Write-Host "  ✓ 远程仓库已配置: $remoteUrl" -ForegroundColor Green
}

# 步骤 3：检查是否有未提交的更改
Write-Host ""
Write-Host "[3/5] 检查代码状态..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "  发现未提交的更改，正在提交..." -ForegroundColor Gray
    git add .
    git commit -m "Update: Prepare for deployment"
    Write-Host "  ✓ 代码已提交" -ForegroundColor Green
} else {
    Write-Host "  ✓ 代码已是最新" -ForegroundColor Green
}

# 步骤 4：推送到 GitHub
Write-Host ""
Write-Host "[4/5] 推送到 GitHub..." -ForegroundColor Yellow
Write-Host "  提示：如果要求输入凭据，请使用 GitHub Personal Access Token" -ForegroundColor Gray
Write-Host "  获取 Token: https://github.com/settings/tokens" -ForegroundColor Gray
Write-Host "  需要权限：repo (全部仓库权限)" -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "  是否现在推送到 GitHub? (Y/N)"
if ($confirm -eq "Y" -or $confirm -eq "y") {
    $pushResult = git push -u origin main 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ 代码已推送到 GitHub" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ 推送失败" -ForegroundColor Yellow
        Write-Host "  错误信息: $pushResult" -ForegroundColor Red
        Write-Host ""
        Write-Host "  可能的原因：" -ForegroundColor Yellow
        Write-Host "    1. GitHub 仓库尚未创建" -ForegroundColor Gray
        Write-Host "    2. 需要配置 Personal Access Token" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  解决方案：" -ForegroundColor Yellow
        Write-Host "    1. 访问 https://github.com/new 创建仓库" -ForegroundColor Gray
        Write-Host "    2. 仓库名：shopify-mcp-server" -ForegroundColor Gray
        Write-Host "    3. 选择 Public，然后创建" -ForegroundColor Gray
        Write-Host "    4. 获取 Token: https://github.com/settings/tokens" -ForegroundColor Gray
    }
} else {
    Write-Host "  ⚠ 跳过推送，请稍后手动执行" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  手动推送命令：" -ForegroundColor Gray
    Write-Host "    git push -u origin main" -ForegroundColor Gray
}

# 步骤 5：显示下一步操作
Write-Host ""
Write-Host "[5/5] 部署信息" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ 本地准备完成！" -ForegroundColor Green
Write-Host ""
Write-Host "下一步：在 Vercel 部署" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 访问: https://vercel.com" -ForegroundColor White
Write-Host "2. 使用 GitHub 登录" -ForegroundColor White
Write-Host "3. 点击 'Add New...' → 'Project'" -ForegroundColor White
Write-Host "4. 选择 'shopify-mcp-server' 仓库" -ForegroundColor White
Write-Host "5. 设置环境变量：" -ForegroundColor White
Write-Host "   - SHOPIFY_STORE = happier-shopping-3.myshopify.com" -ForegroundColor Gray
Write-Host "   - SHOPIFY_ACCESS_TOKEN = your_shopify_access_token_here" -ForegroundColor Gray
Write-Host "6. 点击 'Deploy'" -ForegroundColor White
Write-Host ""
Write-Host "部署完成后，在 Dify 中配置：" -ForegroundColor Cyan
Write-Host "  工具 → MCP → 添加 MCP 服务器（HTTP）" -ForegroundColor White
Write-Host "  服务器 URL: https://您的vercel地址.vercel.app" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

