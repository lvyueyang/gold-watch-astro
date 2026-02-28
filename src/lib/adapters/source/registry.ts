import { ICBCAdapter } from './icbc';
import type { SourceAdapter } from './index';

// Registry of all source adapters
const adapters: SourceAdapter[] = [
  new ICBCAdapter(),
];

export function getSourceAdapter(instrumentId: string): SourceAdapter | undefined {
  return adapters.find(adapter => adapter.supports(instrumentId));
}

export function getAllSourceAdapters(): SourceAdapter[] {
  return adapters;
}
