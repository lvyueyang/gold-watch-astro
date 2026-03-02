/**
 * KV 存储键名常量定义
 * 用于统一管理 KV_CONFIG 中的 Key 名称
 */

// Webhook 相关 Key
export const KV_WEBHOOK_FEISHU = "WEBHOOK_FEISHU"; // 飞书 Webhook URL
export const KV_WEBHOOK_WECOM = "WEBHOOK_WECOM"; // 企业微信 Webhook URL
export const KV_WEBHOOK_DINGTALK = "WEBHOOK_DINGTALK"; // 钉钉 Webhook URL

// 管理员认证相关 Key
export const KV_ADMIN_USER = "ADMIN_USER"; // 管理员用户名
export const KV_ADMIN_PASS = "ADMIN_PASS"; // 管理员密码

// 安全相关 Key
export const KV_JWT_SECRET = "JWT_SECRET"; // JWT 签名密钥

/**
 * 通知渠道 ID 常量
 */
export const CHANNEL_FEISHU = "feishu";
export const CHANNEL_WECOM = "wecom";
export const CHANNEL_DINGTALK = "dingtalk";

export const ALL_CHANNELS = [CHANNEL_FEISHU, CHANNEL_WECOM, CHANNEL_DINGTALK] as const;
