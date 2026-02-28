import type { Rule, PriceTick } from "./types";

interface RuleResult {
  shouldFire: boolean;
  newState: any;
}

export function evaluateRule(rule: Rule, tick: PriceTick): RuleResult {
  const currentPrice = tick.price;
  const now = Date.now(); // Use current time for evaluation
  const params = rule.params;
  const state = rule.state || {};
  const { lastFiredAt = 0, cooldownUntil = 0, lastValue } = state;
  
  let triggered = false;
  
  // 1. Check Condition
  switch (rule.type) {
    case 'touch':
      if (params.target !== undefined) {
        // Check if price is close enough (within 0.05%)
        const epsilon = params.target * 0.0005; 
        if (Math.abs(currentPrice - params.target) <= epsilon) {
          triggered = true;
        }
        
        // Also check crossing if we have history
        if (lastValue !== undefined) {
          if ((lastValue < params.target && currentPrice >= params.target) ||
              (lastValue > params.target && currentPrice <= params.target)) {
            triggered = true;
          }
        }
      }
      break;
      
    case 'cross_up':
      if (params.target !== undefined && lastValue !== undefined) {
        if (lastValue < params.target && currentPrice >= params.target) {
          triggered = true;
        }
      }
      break;
      
    case 'cross_down':
      if (params.target !== undefined && lastValue !== undefined) {
        if (lastValue > params.target && currentPrice <= params.target) {
          triggered = true;
        }
      }
      break;
      
    case 'range':
      if (params.lower !== undefined && params.upper !== undefined) {
        if (currentPrice >= params.lower && currentPrice <= params.upper) {
          triggered = true;
        }
      }
      break;
      
    // TODO: pct_change requires more state tracking
  }
  
  // 2. Check Cooldown / Throttling
  if (triggered) {
    // Check explicit cooldown window
    if (now < cooldownUntil) {
      triggered = false; 
    }
    
    // Check throttleMs (min interval between alerts)
    if (rule.notify.throttleMs && lastFiredAt > 0) {
      if (now - lastFiredAt < rule.notify.throttleMs) {
        triggered = false;
      }
    }
  }
  
  // 3. Update State
  const newState = {
    ...state,
    lastValue: currentPrice,
  };
  
  if (triggered) {
    newState.lastFiredAt = now;
    if (rule.notify.dedupWindowMs) {
      newState.cooldownUntil = now + rule.notify.dedupWindowMs;
    }
  }
  
  return { shouldFire: triggered, newState };
}
