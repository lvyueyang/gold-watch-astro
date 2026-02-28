# GoldWatch - Real-time Price Monitor

## Setup

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Configure Cloudflare Resources**
   - Create a D1 database named `gold-watch-db`.
   - Create a KV namespace named `KV_CONFIG`.
   - Update `wrangler.jsonc` with your IDs.

3. **Initialize Database**
   ```bash
   pnpm wrangler d1 execute gold-watch-db --local --file=docs/sql/schema.sql
   # For production:
   # pnpm wrangler d1 execute gold-watch-db --remote --file=docs/sql/schema.sql
   ```

4. **Set Secrets (KV)**
   Run the following commands to set up your admin credentials and webhooks:
   ```bash
   # Local Development
   pnpm wrangler kv:key put ADMIN_USER "admin" --binding=KV_CONFIG --local
   pnpm wrangler kv:key put ADMIN_PASS "password" --binding=KV_CONFIG --local
   pnpm wrangler kv:key put WEBHOOK_FEISHU "https://open.feishu.cn/open-apis/bot/v2/hook/..." --binding=KV_CONFIG --local
   
   # Production
   # Add --remote instead of --local
   ```

5. **Run Locally**
   ```bash
   pnpm dev
   ```

6. **Deploy**
   ```bash
   pnpm run deploy
   ```

## Cron Job
The system uses Cloudflare Cron Triggers to run logic.
Currently exposed via `/api/cron` for manual invocation or external scheduling if needed.
