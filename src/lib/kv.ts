import {
  CHANNEL_DINGTALK,
  CHANNEL_FEISHU,
  CHANNEL_WECOM,
  KV_ADMIN_PASS,
  KV_ADMIN_USER,
  KV_JWT_SECRET,
  KV_WEBHOOK_DINGTALK,
  KV_WEBHOOK_FEISHU,
  KV_WEBHOOK_WECOM,
} from "./constants";

export async function getWebhookUrl(env: Env, channelId: string): Promise<string | null> {
  // Mapping logic: "feishu" -> "WEBHOOK_FEISHU"
  // Also supports custom keys if needed
  const keyMap: Record<string, string> = {
    [CHANNEL_FEISHU]: KV_WEBHOOK_FEISHU,
    [CHANNEL_WECOM]: KV_WEBHOOK_WECOM,
    [CHANNEL_DINGTALK]: KV_WEBHOOK_DINGTALK,
  };
  const key = keyMap[channelId] || channelId;
  return await env.KV_CONFIG.get(key);
}

export async function setWebhookUrl(env: Env, channelId: string, url: string): Promise<void> {
  const keyMap: Record<string, string> = {
    [CHANNEL_FEISHU]: KV_WEBHOOK_FEISHU,
    [CHANNEL_WECOM]: KV_WEBHOOK_WECOM,
    [CHANNEL_DINGTALK]: KV_WEBHOOK_DINGTALK,
  };
  const key = keyMap[channelId] || channelId;
  await env.KV_CONFIG.put(key, url);
}

export async function getAdminCredentials(env: Env) {
  const [username, password] = await Promise.all([
    env.KV_CONFIG.get(KV_ADMIN_USER),
    env.KV_CONFIG.get(KV_ADMIN_PASS),
  ]);
  return { username, password };
}

export async function getJwtSecret(env: Env): Promise<string | null> {
  return await env.KV_CONFIG.get(KV_JWT_SECRET);
}
