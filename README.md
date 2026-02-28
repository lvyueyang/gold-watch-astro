# GoldWatch - Real-time Price Monitor

## Setup

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **配置 Cloudflare 资源**
   - 创建 D1 数据库：`gold-watch-db`
   - 创建 KV 命名空间：`KV_CONFIG`
   - 在 `wrangler.jsonc` 填写对应 ID

3. **Initialize Database**
   ```bash
   pnpm wrangler d1 execute gold-watch-db --local --file=docs/sql/schema.sql
   # For production:
   # pnpm wrangler d1 execute gold-watch-db --remote --file=docs/sql/schema.sql
   ```

4. **设置密钥 (KV)**
   使用以下命令设置管理员账号和通知渠道 Webhook：
   ```bash
   # Local Development
   pnpm wrangler kv:key put ADMIN_USER "admin" --binding=KV_CONFIG --local
   pnpm wrangler kv:key put ADMIN_PASS "password" --binding=KV_CONFIG --local
   pnpm wrangler kv:key put WEBHOOK_FEISHU "https://open.feishu.cn/open-apis/bot/v2/hook/..." --binding=KV_CONFIG --local
   
   # Production
   # Add --remote instead of --local
   ```

5. **本地启动**
   ```bash
   pnpm dev
   ```

6. **部署**
   ```bash
   pnpm run deploy
   ```

## 前端 UI
- 使用 **shadcn/ui + Tailwind CSS** 构建（替代 Ant Design）。
- 暗色模式默认开启，可在右上角进行切换。

## 定时任务
系统使用 Cloudflare Cron Triggers 执行运行逻辑。
也可通过 `/api/cron` 手动触发或由外部定时器调用。
