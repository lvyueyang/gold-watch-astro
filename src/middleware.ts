import { defineMiddleware } from "astro/middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies } = context;

  // Protect /admin and sensitive API routes
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api/rules")) {
    // Allow public access to login page? /admin is protected, /login is not.
    // If user is accessing /admin, check auth.

    const auth = cookies.get("goldwatch_auth");

    // Simple check: cookie must exist and equal '1'
    if (!auth || auth.value !== "1") {
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
