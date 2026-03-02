import type { APIRoute } from "astro";
import { ALL_CHANNELS } from "../../lib/constants";
import { getWebhookUrl, setWebhookUrl } from "../../lib/kv";

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

type ChannelKey = (typeof ALL_CHANNELS)[number];

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  let body: { key?: string; url?: string };

  try {
    body = (await request.json()) as { key?: string; url?: string };
  } catch (_e) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { key, url } = body;

  if (!key || !url) {
    return new Response(JSON.stringify({ error: "Missing key or url" }), { status: 400 });
  }

  if (!ALL_CHANNELS.includes(key as ChannelKey)) {
    return new Response(JSON.stringify({ error: "Invalid channel key" }), { status: 400 });
  }

  try {
    await setWebhookUrl(env, key, url);
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (_e) {
    return new Response(JSON.stringify({ error: "Failed to update webhook" }), { status: 500 });
  }
};
