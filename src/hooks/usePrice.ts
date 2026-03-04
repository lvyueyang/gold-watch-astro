import {
  type QueryClient,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

interface PriceData {
  price: number;
  ts: number;
}

// Hook to fetch price for a single instrument
export function useInstrumentPrice(instrumentId?: string, refreshInterval = 10000) {
  return useQuery<PriceData | null>({
    queryKey: ["price", instrumentId],
    queryFn: async () => {
      if (!instrumentId) return null;
      const res = await fetch(`/api/price?instrumentId=${instrumentId}`);
      if (!res.ok) return null;
      return (await res.json()) as PriceData;
    },
    enabled: Boolean(instrumentId),
    refetchInterval: refreshInterval,
    staleTime: 5000, // Consider data fresh for 5 seconds
  });
}

// Hook to fetch prices for multiple instruments
export function useInstrumentsPrices(instruments: { id: string }[], refreshInterval = 10000) {
  const queryClient = useQueryClient();

  return useQuery<Record<string, PriceData>>({
    queryKey: ["prices", instruments.map(i => i.id).join(",")],
    queryFn: async () => {
      if (instruments.length === 0) return {};

      const newPrices: Record<string, PriceData> = {};
      
      // Use Promise.allSettled to avoid failing all if one fails
      const results = await Promise.allSettled(
        instruments.map(async (inst) => {
          const res = await fetch(`/api/price?instrumentId=${inst.id}`);
          if (res.ok) {
            const data = (await res.json()) as PriceData;
            // Also update individual price cache
            queryClient.setQueryData(["price", inst.id], data);
            return { id: inst.id, data };
          }
          throw new Error(`Failed to fetch ${inst.id}`);
        })
      );

      for (const result of results) {
        if (result.status === "fulfilled") {
          newPrices[result.value.id] = result.value.data;
        }
      }

      return newPrices;
    },
    enabled: instruments.length > 0,
    refetchInterval: refreshInterval,
  });
}
