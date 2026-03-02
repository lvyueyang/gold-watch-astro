import { getSourceAdapter } from "./adapters/source/registry";
import type { PriceTick } from "./types";

export async function fetchPrice(instrumentId: string): Promise<PriceTick | null> {
  const adapter = getSourceAdapter(instrumentId);
  if (!adapter) {
    console.warn(`No adapter found for instrument: ${instrumentId}`);
    return null;
  }

  return await adapter.fetchPrice(instrumentId);
}

export function getInstrumentName(instrumentId: string): string {
  const adapter = getSourceAdapter(instrumentId);
  return adapter ? adapter.getInstrumentName(instrumentId) : instrumentId;
}
