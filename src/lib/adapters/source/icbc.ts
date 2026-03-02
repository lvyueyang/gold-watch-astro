import type { PriceTick } from "../../types";
import type { SourceAdapter } from "./index";

export class ICBCAdapter implements SourceAdapter {
  id = "icbc";
  name = "工行积存金";

  supports(instrumentId: string): boolean {
    return instrumentId === "XAU-CN";
  }

  getInstrumentName(instrumentId: string): string {
    return instrumentId === "XAU-CN" ? "工行积存金" : instrumentId;
  }

  async fetchPrice(instrumentId: string): Promise<PriceTick | null> {
    if (!this.supports(instrumentId)) return null;

    try {
      const res = await fetch(
        "https://api.jdjygold.com/gw2/generic/jrm/h5/m/stdLatestPrice?productSku=1961543816",
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            Referer: "https://m.jdjygold.com/",
          },
        },
      );

      const data = (await res.json()) as {
        success?: boolean;
        resultData?: {
          datas?: {
            price?: string | number;
            time?: string | number;
          };
        };
      };

      if (data?.success && data?.resultData?.datas?.price) {
        const item = data.resultData.datas;
        const price = parseFloat(item.price);

        let ts = Date.now();
        if (item.time) {
          ts = typeof item.time === "string" ? Number.parseInt(item.time, 10) : item.time;
        }

        return {
          instrumentId,
          price,
          ts,
          source: this.id,
        };
      }
    } catch (e) {
      console.error(`[${this.id}] Failed to fetch price:`, e);
    }
    return null;
  }
}
