import type { APIRoute } from 'astro';
import { getRule, updateRule, deleteRule } from '../../../lib/db';

export const GET: APIRoute = async ({ params, locals }) => {
  const env = locals.runtime.env;
  const { id } = params;
  if (!id) return new Response(null, { status: 404 });
  
  const rule = await getRule(env, id);
  if (!rule) return new Response(null, { status: 404 });
  
  return new Response(JSON.stringify(rule), {
    headers: { "Content-Type": "application/json" }
  });
};

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const env = locals.runtime.env;
  const { id } = params;
  if (!id) return new Response(null, { status: 404 });
  
  try {
    const data = await request.json() as any;
    await updateRule(env, id, data);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const env = locals.runtime.env;
  const { id } = params;
  if (!id) return new Response(null, { status: 404 });
  
  await deleteRule(env, id);
  return new Response(null, { status: 204 });
};
