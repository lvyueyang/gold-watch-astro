export interface NotificationMessage {
  title: string;
  text: string;
  url?: string;
  fields?: Record<string, string | number>;
}

export interface NotifyAdapter {
  id: string; // e.g. "feishu", "wecom"
  name: string;
  send(env: Env, webhookUrl: string, message: NotificationMessage): Promise<void>;
}
