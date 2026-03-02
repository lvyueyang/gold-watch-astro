import { CHANNEL_DINGTALK, CHANNEL_FEISHU, CHANNEL_WECOM } from "../../constants";
import { DingTalkAdapter } from "./dingtalk";
import { FeishuAdapter } from "./feishu";
import type { NotifyAdapter } from "./index";
import { WeComAdapter } from "./wecom";

const adapters: Record<string, NotifyAdapter> = {
  [CHANNEL_FEISHU]: new FeishuAdapter(),
  [CHANNEL_WECOM]: new WeComAdapter(),
  [CHANNEL_DINGTALK]: new DingTalkAdapter(),
};

export function getNotifyAdapter(type: string): NotifyAdapter | undefined {
  return adapters[type];
}
