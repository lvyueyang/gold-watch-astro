import { FeishuAdapter } from './feishu';
import { WeComAdapter } from './wecom';
import { DingTalkAdapter } from './dingtalk';
import type { NotifyAdapter } from './index';

const adapters: Record<string, NotifyAdapter> = {
  feishu: new FeishuAdapter(),
  wecom: new WeComAdapter(),
  dingtalk: new DingTalkAdapter(),
};

export function getNotifyAdapter(type: string): NotifyAdapter | undefined {
  return adapters[type];
}
