-- Create rules table
CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,          -- UUID
  instrument_id TEXT NOT NULL,  -- 标的 ID
  name TEXT NOT NULL,           -- 规则名称
  type TEXT NOT NULL,           -- 规则类型: touch, cross_up, etc.
  params JSON NOT NULL,         -- 规则参数: {target, lower, upper, windowMs}
  notify JSON NOT NULL,         -- 通知配置: {channels: ["feishu_default"], throttleMs: 3600000}
  state JSON,                   -- 运行时状态: {lastFiredAt, lastValue, cooldownUntil}
  active BOOLEAN DEFAULT TRUE,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Index for faster lookup by instrument
CREATE INDEX IF NOT EXISTS idx_rules_instrument_id ON rules(instrument_id);
