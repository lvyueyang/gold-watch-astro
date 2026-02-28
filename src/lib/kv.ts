export async function getWebhookUrl(env: Env, channelId: string): Promise<string | null> {
  // Mapping logic: "feishu" -> "WEBHOOK_FEISHU"
  // Also supports custom keys if needed
  const keyMap: Record<string, string> = {
    feishu: "WEBHOOK_FEISHU",
    wecom: "WEBHOOK_WECOM",
    dingtalk: "WEBHOOK_DINGTALK",
  };
  const key = keyMap[channelId] || channelId;
  return await env.KV_CONFIG.get(key);
}

export async function getAdminCredentials(env: Env) {
  const [username, password] = await Promise.all([
    env.KV_CONFIG.get("ADMIN_USER"),
    env.KV_CONFIG.get("ADMIN_PASS"),
  ]);
  return { username, password };
}

export async function getJwtSecret(env: Env): Promise<string | null> {
  return await env.KV_CONFIG.get("JWT_SECRET");
}
