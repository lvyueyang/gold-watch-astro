import type { PriceTick } from './types';
import { getSourceAdapter } from './adapters/source/registry';

export async function fetchPrice(instrumentId: string): Promise<PriceTick | null> {
  const adapter = getSourceAdapter(instrumentId);
  if (!adapter) {
    console.warn(`No adapter found for instrument: ${instrumentId}`);
    return null;
  }

  return await adapter.fetchPrice(instrumentId);
}
