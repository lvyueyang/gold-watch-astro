export interface Rule {
  id: string;
  instrumentId: string;
  name: string;
  type: "touch" | "cross_up" | "cross_down" | "range" | "pct_change";
  params: {
    target?: number;
    lower?: number;
    upper?: number;
    pct?: number;
    windowMs?: number;
    holdMs?: number;
  };
  notify: {
    channels: string[];
    throttleMs?: number;
    dedupWindowMs?: number;
    suppressUntilReset?: boolean;
  };
  state?: {
    lastFiredAt?: number;
    lastValue?: number;
    cooldownUntil?: number;
    refPrice?: number;
  };
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PriceTick {
  instrumentId: string;
  price: number;
  ts: number;
  source: string;
  bid?: number;
  ask?: number;
  mid?: number;
}

export interface Instrument {
  id: string;
  name: string;
  symbol: string;
  source: string;
  precision: number;
}
