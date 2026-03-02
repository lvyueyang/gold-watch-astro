import type { APIRoute } from "astro";
import { fetchPrice } from "../../lib/price";

export const GET: APIRoute = async ({ url }) => {
  const instrumentId = url.searchParams.get("instrumentId");

  if (!instrumentId) {
    return new Response(JSON.stringify({ error: "Missing instrumentId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const tick = await fetchPrice(instrumentId);
    if (tick) {
      return new Response(JSON.stringify(tick), {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: "Price not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("Failed to fetch price:", e);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
