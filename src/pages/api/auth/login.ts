import type { APIRoute } from "astro";
import { JWT_SECRET_DEFAULT, signToken } from "../../../lib/auth";
import { getAdminCredentials, getJwtSecret } from "../../../lib/kv";

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const env = locals.runtime.env as any; // Cast to any because JWT_SECRET might not be in types yet
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
    const kvSecret = await getJwtSecret(env);
    const secret = kvSecret || env.JWT_SECRET || JWT_SECRET_DEFAULT;
    const token = await signToken({ username }, secret);

    // Set cookie
    cookies.set("goldwatch_token", token, {
      path: "/",
      httpOnly: true,
      secure: true, // Use true in prod, but localhost might need false? Astro handles this.
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
};
