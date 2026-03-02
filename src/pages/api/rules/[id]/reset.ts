import type { APIRoute } from "astro";
import { updateRuleState } from "../../../../lib/db";

export const POST: APIRoute = async ({ params, locals }) => {
  const env = locals.runtime.env;
  const { id } = params;
  if (!id) return new Response(null, { status: 404 });

  try {
    // Reset state to empty object
    await updateRuleState(env, id, {});

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
