import { DingTalkAdapter } from "./dingtalk";
import { FeishuAdapter } from "./feishu";
import type { NotifyAdapter } from "./index";
import { WeComAdapter } from "./wecom";

const adapters: Record<string, NotifyAdapter> = {
  feishu: new FeishuAdapter(),
  wecom: new WeComAdapter(),
  dingtalk: new DingTalkAdapter(),
};

export function getNotifyAdapter(type: string): NotifyAdapter | undefined {
  return adapters[type];
}
