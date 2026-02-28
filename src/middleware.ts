import { defineMiddleware } from "astro/middleware";
import { JWT_SECRET_DEFAULT, verifyToken } from "./lib/auth";
import { getJwtSecret } from "./lib/kv";

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, locals } = context;

  // Protect /admin and sensitive API routes
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api/rules")) {
    const token = cookies.get("goldwatch_token")?.value;

    let isAuthenticated = false;
    if (token) {
      const env = locals.runtime?.env as any;
      const kvSecret = await getJwtSecret(env);
      const secret = kvSecret || env?.JWT_SECRET || JWT_SECRET_DEFAULT;
      const payload = await verifyToken(token, secret);
      if (payload) {
        isAuthenticated = true;
      }
    }

    if (!isAuthenticated) {
      if (url.pathname.startsWith("/api")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return context.redirect("/login");
      }
    }
  }

  return next();
});
