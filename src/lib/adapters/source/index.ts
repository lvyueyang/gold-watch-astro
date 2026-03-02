import type { PriceTick } from "../../types";

export interface SourceAdapter {
  id: string; // e.g. "icbc", "binance"
  name: string;
  fetchPrice(instrumentId: string): Promise<PriceTick | null>;
  supports(instrumentId: string): boolean;
  getInstrumentName(instrumentId: string): string;
}
