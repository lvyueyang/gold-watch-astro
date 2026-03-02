import type { APIRoute } from "astro";
import { ALL_CHANNELS } from "../../lib/constants";
import { getWebhookUrl } from "../../lib/kv";

export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env;

  // Define known webhook keys to check
  const keys = ALL_CHANNELS;

  const results = [];

  for (const key of keys) {
    const url = await getWebhookUrl(env, key);
    results.push({
      key,
      type: key, // feishu, wecom, dingtalk
      url: url || null, // Return null if not configured
      configured: !!url,
    });
  }

  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" },
  });
};
