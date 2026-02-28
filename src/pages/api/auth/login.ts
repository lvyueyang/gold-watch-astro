import type { APIRoute } from "astro";
import { getAdminCredentials } from "../../../lib/kv";

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const env = locals.runtime.env;
  let body;
  try {
    body = (await request.json()) as any;
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { username, password } = body;

  if (!username || !password) {
    return new Response(JSON.stringify({ error: "Missing username or password" }), { status: 400 });
  }

  const creds = await getAdminCredentials(env);

  // KV might return null if not set, fallback to env vars or default for dev?
  // Use default "admin" / "password" if KV is empty (as per design doc for dev)
  const validUser = creds.username || "admin";
  const validPass = creds.password || "password";

  if (username === validUser && password === validPass) {
    // Set cookie
    cookies.set("goldwatch_auth", "1", {
      path: "/",
      httpOnly: true,
      secure: true, // Use true in prod, but localhost might need false? Astro handles this.
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
};
