import type { NotificationMessage, NotifyAdapter } from "./index";

export class DingTalkAdapter implements NotifyAdapter {
  id = "dingtalk";
  name = "钉钉";

  async send(env: Env, webhookUrl: string, message: NotificationMessage): Promise<void> {
    const payload = {
      msgtype: "markdown",
      markdown: {
        title: message.title,
        text:
          `### ${message.title}\n${message.text}\n` +
          (message.fields
            ? Object.entries(message.fields)
                .map(([k, v]) => `- **${k}**: ${v}`)
                .join("\n")
            : "") +
          (message.url ? `\n[查看详情](${message.url})` : ""),
      },
    };

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
}
