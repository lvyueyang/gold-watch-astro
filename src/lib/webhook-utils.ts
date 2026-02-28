export const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    feishu: "飞书",
    wecom: "企业微信",
    dingtalk: "钉钉",
  };
  return typeMap[type] || type.toUpperCase();
};

export const getTypeVariant = (type: string) => {
  switch (type) {
    case "feishu":
      return "success";
    case "wecom":
      return "info";
    case "dingtalk":
      return "warning";
    default:
      return "default";
  }
};
