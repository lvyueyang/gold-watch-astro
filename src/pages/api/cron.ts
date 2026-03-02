import type { APIRoute } from "astro";
import { CHANNEL_DINGTALK, CHANNEL_FEISHU, CHANNEL_WECOM } from "../../lib/constants";
import { getNotifyAdapter } from "../../lib/adapters/notify/registry";
import { getActiveRules, updateRuleState } from "../../lib/db";
import { evaluateRule } from "../../lib/engine";
import { getWebhookUrl } from "../../lib/kv";
import { fetchPrice } from "../../lib/price";

export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env;

  // 1. Get active rules
  const rules = await getActiveRules(env);

  // 2. Group by instrument to batch fetch prices
  const instrumentIds = [...new Set(rules.map((r) => r.instrumentId))];
  const prices: Record<string, any> = {};

  for (const id of instrumentIds) {
    const tick = await fetchPrice(id);
    if (tick) prices[id] = tick;
  }

  // 3. Evaluate rules
  const results = [];

  for (const rule of rules) {
    const tick = prices[rule.instrumentId];
    if (!tick) continue;

    const { shouldFire, newState } = evaluateRule(rule, tick);

    if (shouldFire) {
      // 4. Send Webhook
      for (const channelId of rule.notify.channels) {
        const webhookUrl = await getWebhookUrl(env, channelId);
        if (webhookUrl) {
          // Infer adapter type from channelId or known prefixes
          let type = channelId;
          if (channelId.includes(CHANNEL_FEISHU)) type = CHANNEL_FEISHU;
          if (channelId.includes(CHANNEL_WECOM)) type = CHANNEL_WECOM;
          if (channelId.includes(CHANNEL_DINGTALK)) type = CHANNEL_DINGTALK;

          const adapter = getNotifyAdapter(type);
          if (adapter) {
            try {
              // Convert fields values to strings for display
              const fields: Record<string, string | number> = {
                标的: rule.instrumentId,
                价格: tick.price,
                时间: new Date(tick.ts).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }),
                规则: `${rule.type} ${JSON.stringify(rule.params)}`,
              };

              await adapter.send(env, webhookUrl, {
                title: `[GoldWatch] 规则触发: ${rule.name}`,
                text: `价格达到触发条件`,
                fields,
              });
            } catch (e) {
              console.error(`Failed to send webhook via ${type}`, e);
            }
          } else {
            // Fallback to simple text if no adapter found
            try {
              await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  msg_type: "text",
                  content: {
                    text: `[GoldWatch] ${rule.name} Triggered! Price: ${tick.price}`,
                  },
                }),
              });
            } catch (e) {
              console.error(e);
            }
          }
        }
      }
    }

    // 5. Update State
    if (JSON.stringify(rule.state) !== JSON.stringify(newState)) {
      await updateRuleState(env, rule.id, newState);
    }

    results.push({ ruleId: rule.id, fired: shouldFire });
  }

  return new Response(JSON.stringify({ success: true, results }), {
    headers: { "Content-Type": "application/json" },
  });
};
