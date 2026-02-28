import type { APIRoute } from 'astro';
import { getAllRules, createRule } from '../../lib/db';
import type { Rule } from '../../lib/types';

export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env;
  const rules = await getAllRules(env);
  return new Response(JSON.stringify(rules), {
    headers: { "Content-Type": "application/json" }
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  try {
    const data = await request.json() as any;
    
    // Validate data
    if (!data.instrumentId || !data.name || !data.type) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    
    const rule: Rule = {
      id: crypto.randomUUID(),
      instrumentId: data.instrumentId,
      name: data.name,
      type: data.type,
      params: data.params || {},
      notify: data.notify || { channels: [] },
      state: {},
      active: data.active !== false,
      createdAt: 0, // Handled in createRule
      updatedAt: 0,
    };
    
    await createRule(env, rule);
    
    return new Response(JSON.stringify(rule), { 
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
