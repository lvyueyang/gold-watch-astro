import { CHANNEL_DINGTALK, CHANNEL_FEISHU, CHANNEL_WECOM } from "./constants";

export const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    [CHANNEL_FEISHU]: "飞书",
    [CHANNEL_WECOM]: "企业微信",
    [CHANNEL_DINGTALK]: "钉钉",
  };
  return typeMap[type] || type.toUpperCase();
};

export const getTypeVariant = (type: string) => {
  switch (type) {
    case CHANNEL_FEISHU:
      return "success";
    case CHANNEL_WECOM:
      return "info";
    case CHANNEL_DINGTALK:
      return "warning";
    default:
      return "default";
  }
};
