# Cloudflare 临时邮箱自动化方案

## 概述
这个项目实现了通过 Cloudflare Worker 创建临时邮箱，并自动化处理 Codex OAuth 流程中的邮件验证。

## 功能特点
- 完全自动化邮件接收和验证
- 支持中国网络环境（通过 Vercel 中间层）
- 无需第三方邮件服务
- 免费部署和使用

## 项目结构
```
cloudflare-email-automation/
├── worker/                # Cloudflare Worker 代码
│   ├── src/
│   │   └── worker.js    # Worker 主文件
│   └── wrangler.toml    # Worker 配置
├── extension/            # Chrome 扩展配置
│   └── default-settings.json
└── vercel/               # Vercel 中间层 (可选)
    └── vercel.json
```

## 部署步骤

### 1. 部署 Cloudflare Worker
```bash
cd worker
npx wrangler deploy
```
记下部署后的 Worker URL（如：`https://calm-water-f7ac.temp-email-joyful.workers.dev`）

### 2. 配置 Cloudflare Email Routing
1. 登录 Cloudflare 仪表板
2. 进入 `joyful.dpdns.org` 域名
3. 选择 **Email** → **Email Routing**
4. 添加路由规则：
   - 匹配所有 `@joyful.dpdns.org` 邮件
   - 转发到您的 Worker

### 3. 配置 Chrome 扩展
修改 `extension/default-settings.json`：
```json
{
  "emailMode": "cloudflare-temp-email",
  "cloudflareTempEmailBaseUrl": "您的Worker URL",
  "cloudflareTempEmailAdminAuth": "codex2024"
}
```

### 4. 部署 Vercel 中间层（可选）
如果直接访问 Worker 有问题：
1. 修改 `vercel/vercel.json` 中的 Worker URL
2. 部署到 Vercel
3. 使用 Vercel URL 作为扩展配置

## 使用方法
1. 启动 Codex2API 后端（`http://localhost:8080`）
2. 加载扩展配置
3. 点击扩展的"自动"按钮
4. 系统将自动：
   - 创建临时邮箱
   - 完成注册流程
   - 提取验证码
   - 完成验证

## 注意事项
- Worker 当前为演示模式，生产环境请配置 KV 存储
- 确保 Email Routing 配置正确
- 中国用户建议使用 Vercel 中间层

## 许可证
MIT License
