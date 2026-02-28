import type { Rule } from "./types";

export async function getActiveRules(env: Env): Promise<Rule[]> {
  const { results } = await env.DB.prepare("SELECT * FROM rules WHERE active = 1").all<any>();

  return results.map(parseRule);
}

export async function getAllRules(env: Env): Promise<Rule[]> {
  const { results } = await env.DB.prepare(
    "SELECT * FROM rules ORDER BY created_at DESC",
  ).all<any>();

  return results.map(parseRule);
}

export async function getRule(env: Env, id: string): Promise<Rule | null> {
  const rule = await env.DB.prepare("SELECT * FROM rules WHERE id = ?").bind(id).first<any>();

  return rule ? parseRule(rule) : null;
}

export async function createRule(env: Env, rule: Rule): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    `INSERT INTO rules (id, instrument_id, name, type, params, notify, state, active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      rule.id,
      rule.instrumentId,
      rule.name,
      rule.type,
      JSON.stringify(rule.params),
      JSON.stringify(rule.notify),
      JSON.stringify(rule.state || {}),
      rule.active ? 1 : 0,
      now,
      now,
    )
    .run();
}

export async function updateRule(env: Env, id: string, rule: Partial<Rule>): Promise<void> {
  const sets: string[] = [];
  const binds: any[] = [];

  if (rule.name !== undefined) {
    sets.push("name = ?");
    binds.push(rule.name);
  }
  if (rule.instrumentId !== undefined) {
    sets.push("instrument_id = ?");
    binds.push(rule.instrumentId);
  }
  if (rule.type !== undefined) {
    sets.push("type = ?");
    binds.push(rule.type);
  }
  if (rule.params !== undefined) {
    sets.push("params = ?");
    binds.push(JSON.stringify(rule.params));
  }
  if (rule.notify !== undefined) {
    sets.push("notify = ?");
    binds.push(JSON.stringify(rule.notify));
  }
  if (rule.active !== undefined) {
    sets.push("active = ?");
    binds.push(rule.active ? 1 : 0);
  }

  sets.push("updated_at = ?");
  binds.push(Math.floor(Date.now() / 1000));
  binds.push(id);

  if (sets.length > 1) {
    // At least updated_at
    await env.DB.prepare(`UPDATE rules SET ${sets.join(", ")} WHERE id = ?`)
      .bind(...binds)
      .run();
  }
}

export async function updateRuleState(env: Env, id: string, state: any): Promise<void> {
  await env.DB.prepare("UPDATE rules SET state = ? WHERE id = ?")
    .bind(JSON.stringify(state), id)
    .run();
}

export async function deleteRule(env: Env, id: string): Promise<void> {
  await env.DB.prepare("DELETE FROM rules WHERE id = ?").bind(id).run();
}

function parseRule(row: any): Rule {
  return {
    ...row,
    instrumentId: row.instrument_id, // Map snake_case to camelCase
    params: typeof row.params === "string" ? JSON.parse(row.params) : row.params,
    notify: typeof row.notify === "string" ? JSON.parse(row.notify) : row.notify,
    state: row.state
      ? typeof row.state === "string"
        ? JSON.parse(row.state)
        : row.state
      : undefined,
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
