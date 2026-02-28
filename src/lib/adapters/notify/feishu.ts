import type { NotificationMessage, NotifyAdapter } from "./index";

export class FeishuAdapter implements NotifyAdapter {
  id = "feishu";
  name = "飞书";

  async send(env: Env, webhookUrl: string, message: NotificationMessage): Promise<void> {
    const payload = {
      msg_type: "post",
      content: {
        post: {
          zh_cn: {
            title: message.title,
            content: [
              [
                { tag: "text", text: message.text + "\n" },
                ...(message.fields
                  ? Object.entries(message.fields).map(([k, v]) => ({
                      tag: "text",
                      text: `${k}: ${v}\n`,
                    }))
                  : []),
                ...(message.url ? [{ tag: "a", text: "查看详情", href: message.url }] : []),
              ],
            ],
          },
        },
      },
    };

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
}
