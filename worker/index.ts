export interface Env {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  PUBLIC_SITE_URL: string;
  CONTACT_TO_EMAIL: string;
  PUBLISH_TOKEN?: string;
}

const allowedOrigins = ["https://www.valkhyn.site", "https://valkhyn.site"];

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin") ?? "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
      ? origin
      : "https://www.valkhyn.site",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-publish-token",
  };
}

function json(data: unknown, request: Request, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(request) },
  });
}

function isAuthorized(request: Request, env: Env): boolean {
  const token = request.headers.get("x-publish-token");
  return !!env.PUBLISH_TOKEN && token === env.PUBLISH_TOKEN;
}

function uuid(): string {
  return crypto.randomUUID();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true, service: "valkhyn-api", domain: env.PUBLIC_SITE_URL }, request);
    }

    if (request.method === "GET" && url.pathname === "/api/projects") {
      const { results } = await env.DB.prepare(
        "SELECT id, slug, title, summary, published_at FROM projects WHERE status = ? ORDER BY published_at DESC"
      ).bind("published").all();
      return json({ projects: results ?? [] }, request);
    }

    if (request.method === "GET" && url.pathname === "/api") {
      return json({
        service: "valkhyn-api",
        endpoints: [
          "GET /health",
          "GET /api",
          "GET /api/projects",
          "GET /api/contact (usage info)",
          "POST /api/contact",
          "GET /api/inquiries (requires x-publish-token)",
          "POST /api/publish (requires x-publish-token)",
          "POST|DELETE /api/media/<key> (requires x-publish-token)",
        ],
      }, request);
    }

    if (request.method === "GET" && url.pathname === "/api/contact") {
      return json({
        endpoint: "/api/contact",
        method: "POST",
        body: { name: "string", email: "string", message: "string" },
      }, request);
    }

    if (request.method === "POST" && url.pathname === "/api/contact") {
      let body: { name?: string; email?: string; message?: string };
      try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, request, 400); }
      const name = (body.name ?? "").trim();
      const email = (body.email ?? "").trim();
      const message = (body.message ?? "").trim();
      if (!name || !email || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return json({ error: "name, valid email and message are required" }, request, 400);
      }
      await env.DB.prepare(
        "INSERT INTO contact_inquiries (id, name, email, message, source, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(uuid(), name, email, message, "website", new Date().toISOString(), "new").run();
      return json({ ok: true }, request);
    }

    if (request.method === "GET" && url.pathname === "/api/inquiries") {
      if (!isAuthorized(request, env)) return json({ error: "Unauthorized" }, request, 401);
      const { results } = await env.DB.prepare(
        "SELECT id, name, email, message, created_at, status FROM contact_inquiries ORDER BY created_at DESC LIMIT 200"
      ).all();
      return json({ inquiries: results ?? [] }, request);
    }

    if (request.method === "POST" && url.pathname === "/api/publish") {
      if (!isAuthorized(request, env)) return json({ error: "Unauthorized" }, request, 401);
      let body: { id?: string; slug?: string; title?: string; summary?: string; body?: string; status?: string };
      try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, request, 400); }
      const id = body.id || uuid();
      const slug = (body.slug ?? "").trim();
      const title = (body.title ?? "").trim();
      const status = ["draft", "preview", "published", "archived"].includes(body.status ?? "") ? body.status! : "draft";
      if (!slug || !title) return json({ error: "slug and title are required" }, request, 400);
      const now = new Date().toISOString();
      const publishedAt = status === "published" ? now : null;
      await env.DB.prepare(
        `INSERT INTO projects (id, slug, title, summary, body, status, published_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, summary=excluded.summary,
         body=excluded.body, status=excluded.status, published_at=excluded.published_at, updated_at=excluded.updated_at`
      ).bind(id, slug, title, body.summary ?? "", body.body ?? "", status, publishedAt, now, now).run();
      return json({ ok: true, id, status }, request);
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/media/")) {
      if (!isAuthorized(request, env)) return json({ error: "Unauthorized" }, request, 401);
      const key = decodeURIComponent(url.pathname.slice("/api/media/".length));
      if (!key || key.includes("..")) return json({ error: "Invalid key" }, request, 400);
      const data = await request.arrayBuffer();
      await env.MEDIA_BUCKET.put(key, data, { httpMetadata: { contentType: request.headers.get("content-type") ?? "application/octet-stream" } });
      return json({ ok: true, key }, request);
    }

    if (request.method === "DELETE" && url.pathname.startsWith("/api/media/")) {
      if (!isAuthorized(request, env)) return json({ error: "Unauthorized" }, request, 401);
      const key = decodeURIComponent(url.pathname.slice("/api/media/".length));
      await env.MEDIA_BUCKET.delete(key);
      return json({ ok: true, key }, request);
    }

    return json({ error: "Not found" }, request, 404);
  },
};
