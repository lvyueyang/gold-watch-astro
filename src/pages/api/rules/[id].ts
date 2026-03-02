import type { APIRoute } from "astro";
import { deleteRule, getRule, updateRule } from "../../../lib/db";
import type { Rule } from "../../../lib/types";

export const GET: APIRoute = async ({ params, locals }) => {
  const env = locals.runtime.env;
  const { id } = params;
  if (!id) return new Response(null, { status: 404 });

  const rule = await getRule(env, id);
  if (!rule) return new Response(null, { status: 404 });

  return new Response(JSON.stringify(rule), {
    headers: { "Content-Type": "application/json" },
  });
};

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const env = locals.runtime.env;
  const { id } = params;
  if (!id) return new Response(null, { status: 404 });

  try {
    const data = (await request.json()) as Partial<Rule>;
    await updateRule(env, id, data);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const env = locals.runtime.env;
  const { id } = params;
  if (!id) return new Response(null, { status: 404 });

  await deleteRule(env, id);
  return new Response(null, { status: 204 });
};
