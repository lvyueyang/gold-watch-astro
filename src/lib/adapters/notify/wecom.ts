import type { NotificationMessage, NotifyAdapter } from './index';

export class WeComAdapter implements NotifyAdapter {
  id = 'wecom';
  name = '企业微信';

  async send(env: Env, webhookUrl: string, message: NotificationMessage): Promise<void> {
    const payload = {
      msgtype: "markdown",
      markdown: {
        content: `**${message.title}**\n${message.text}\n` +
          (message.fields ? Object.entries(message.fields).map(([k, v]) => `> ${k}: <font color="comment">${v}</font>`).join('\n') : '') +
          (message.url ? `\n[查看详情](${message.url})` : '')
      }
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
}
