import type { APIRoute } from 'astro';
import type { Instrument } from '../../lib/types';
import { getAllSourceAdapters } from '../../lib/adapters/source/registry';

export const GET: APIRoute = async () => {
  const adapters = getAllSourceAdapters();
  
  // Convert adapters to Instrument type
  const instruments: Instrument[] = adapters.map(adapter => ({
    id: adapter.id === 'icbc' ? 'XAU-CN' : adapter.id, // Hardcode mapping for now or add to adapter interface
    name: adapter.name,
    symbol: adapter.id === 'icbc' ? 'XAU' : adapter.id.toUpperCase(),
    source: adapter.id,
    precision: 2
  }));
  
  return new Response(JSON.stringify(instruments), {
    headers: { "Content-Type": "application/json" }
  });
};
