/**
 * MyFinancial — site backend.
 *
 * One file, no npm dependencies: HTTP + SQLite (node:sqlite, built into Node 22.5+).
 * It does three jobs:
 *   1. stores enquiries from the website form in a database, and notifies you,
 *   2. serves the monthly complaint data the public page reads,
 *   3. serves a password-protected admin panel to edit both.
 *
 *   node server/server.js           # http://localhost:8080  (docs/ + /admin)
 *
 * Environment:
 *   ADMIN_PASSWORD   required to log in to /admin (default "change-me" — change it)
 *   PORT             default 8080
 *   DB_PATH          default server/data.db
 *   ALLOW_ORIGIN     comma-separated origins allowed to POST enquiries from another
 *                    host, e.g. https://myfinancialria.github.io
 *   NOTIFY_WEBHOOK_URL   optional: every new enquiry is POSTed to this URL as JSON
 *   SMTP_HOST SMTP_PORT SMTP_USER SMTP_PASS SMTP_FROM SMTP_TO
 *                    optional: email each enquiry (implicit TLS, e.g. smtp.gmail.com:465
 *                    with a Google app password)
 */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { connect as tlsConnect } from "node:tls";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "docs");   // the public website; GitHub Pages serves the same folder
const PORT = Number(process.env.PORT || 8080);
const DB_PATH = process.env.DB_PATH || path.join(HERE, "data.db");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change-me";
const ALLOW_ORIGIN = (process.env.ALLOW_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean);
const SOURCES = ["direct", "scores", "other"];
const NUM_FIELDS = ["pending_last", "received", "resolved", "pending_total", "pending_gt3m", "avg_days"];
const SITE_KEYS = ["basl_no", "upi_id", "audit_status", "audit_findings", "fee_ongoing",
                   "last_updated", "ra_status", "ra_reg_no", "raasb_no"];

/* ------------------------------------------------------------------ database */

const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS complaints (
    month        TEXT NOT NULL,
    source       TEXT NOT NULL,
    pending_last INTEGER NOT NULL DEFAULT 0,
    received     INTEGER NOT NULL DEFAULT 0,
    resolved     INTEGER NOT NULL DEFAULT 0,
    pending_total INTEGER NOT NULL DEFAULT 0,
    pending_gt3m INTEGER NOT NULL DEFAULT 0,
    avg_days     REAL    NOT NULL DEFAULT 0,
    PRIMARY KEY (month, source)
  );
  CREATE TABLE IF NOT EXISTS complaint_months (
    month         TEXT PRIMARY KEY,
    impersonation INTEGER NOT NULL DEFAULT 0,
    updated_at    TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS enquiries (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL,
    city TEXT, residency TEXT, service TEXT, message TEXT,
    consent INTEGER NOT NULL DEFAULT 0,
    status  TEXT NOT NULL DEFAULT 'new',
    notes   TEXT,
    ip TEXT, user_agent TEXT
  );
  CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`);

// Seed the first reporting month once, so a fresh install matches the published page.
const seeded = db.prepare("SELECT COUNT(*) AS n FROM complaint_months").get().n;
if (!seeded) {
  const now = new Date().toISOString();
  db.prepare("INSERT INTO complaint_months (month, impersonation, updated_at) VALUES (?, 0, ?)").run("2026-09", now);
  for (const src of SOURCES) db.prepare("INSERT INTO complaints (month, source) VALUES (?, ?)").run("2026-09", src);
}
if (!db.prepare("SELECT COUNT(*) AS n FROM settings").get().n) {
  for (const k of SITE_KEYS) {
    db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)")
      .run(k, k === "ra_status" ? "pending" : k === "last_updated" ? "20 September 2026" : "");
  }
}

const q = {
  months: () => db.prepare("SELECT month, impersonation, updated_at FROM complaint_months ORDER BY month").all(),
  rows: (m) => db.prepare("SELECT * FROM complaints WHERE month = ?").all(m),
  upsertMonth: db.prepare(`INSERT INTO complaint_months (month, impersonation, updated_at) VALUES (?, ?, ?)
                           ON CONFLICT(month) DO UPDATE SET impersonation = excluded.impersonation, updated_at = excluded.updated_at`),
  upsertRow: db.prepare(`INSERT INTO complaints (month, source, pending_last, received, resolved, pending_total, pending_gt3m, avg_days)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                         ON CONFLICT(month, source) DO UPDATE SET
                           pending_last = excluded.pending_last, received = excluded.received, resolved = excluded.resolved,
                           pending_total = excluded.pending_total, pending_gt3m = excluded.pending_gt3m, avg_days = excluded.avg_days`),
  settings: () => Object.fromEntries(db.prepare("SELECT key, value FROM settings").all().map((r) => [r.key, r.value])),
  setSetting: db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"),
  insertEnquiry: db.prepare(`INSERT INTO enquiries (created_at, name, email, phone, city, residency, service, message, consent, ip, user_agent)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
  enquiries: (status) => status && status !== "all"
    ? db.prepare("SELECT * FROM enquiries WHERE status = ? ORDER BY id DESC").all(status)
    : db.prepare("SELECT * FROM enquiries ORDER BY id DESC").all(),
  updateEnquiry: db.prepare("UPDATE enquiries SET status = ?, notes = ? WHERE id = ?")
};

function complaintsPayload() {
  const all = q.months();
  const months = all.map((m) => {
    const rows = {};
    for (const r of q.rows(m.month)) {
      rows[r.source] = Object.fromEntries(NUM_FIELDS.map((f) => [f, r[f]]));
    }
    for (const src of SOURCES) if (!rows[src]) rows[src] = Object.fromEntries(NUM_FIELDS.map((f) => [f, 0]));
    return { month: m.month, impersonation: m.impersonation, rows };
  });
  const updated = all.reduce((t, m) => (m.updated_at > t ? m.updated_at : t), "");
  return { updated_at: updated.slice(0, 10), months };
}

/* ------------------------------------------------------------------- sessions */

const sessions = new Map();
const SESSION_MS = 8 * 60 * 60 * 1000;
const sha = (s) => createHash("sha256").update(String(s)).digest();

function passwordMatches(candidate) {
  const a = sha(candidate), b = sha(ADMIN_PASSWORD);
  return a.length === b.length && timingSafeEqual(a, b);
}
function newSession() {
  const token = randomBytes(32).toString("hex");
  sessions.set(token, Date.now() + SESSION_MS);
  return token;
}
function validSession(req) {
  const raw = req.headers.cookie || "";
  const match = /(?:^|;\s*)mf_admin=([a-f0-9]{64})/.exec(raw);
  if (!match) return false;
  const exp = sessions.get(match[1]);
  if (!exp || exp < Date.now()) { sessions.delete(match[1]); return false; }
  return match[1];
}

/* --------------------------------------------------------------- rate limits */

const hits = new Map();
function rateLimited(key, max = 5, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  return list.length > max;
}

/* ------------------------------------------------------------- notifications */

async function notifyWebhook(enquiry) {
  const url = process.env.NOTIFY_WEBHOOK_URL;
  if (!url) return { skipped: "no NOTIFY_WEBHOOK_URL" };
  const res = await fetch(url, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(enquiry)
  });
  return { status: res.status };
}

function smtpSend({ host, port, user, pass, from, to, subject, text }) {
  return new Promise((resolve, reject) => {
    const CRLF = "\r\n";
    const socket = tlsConnect({ host, port: Number(port), servername: host });
    let stage = 0, buffer = "", done = false;
    const body =
      "From: " + from + CRLF + "To: " + to + CRLF + "Subject: " + subject + CRLF +
      "MIME-Version: 1.0" + CRLF + "Content-Type: text/plain; charset=utf-8" + CRLF + CRLF +
      text.replace(/^\./gm, "..") + CRLF + "." + CRLF;
    const steps = [
      "EHLO myfinancial" + CRLF,
      "AUTH LOGIN" + CRLF,
      Buffer.from(user).toString("base64") + CRLF,
      Buffer.from(pass).toString("base64") + CRLF,
      "MAIL FROM:<" + from + ">" + CRLF,
      "RCPT TO:<" + to + ">" + CRLF,
      "DATA" + CRLF,
      body,
      "QUIT" + CRLF
    ];
    const fail = (e) => { if (done) return; done = true; try { socket.destroy(); } catch (_) {} reject(e); };
    socket.setTimeout(15000, () => fail(new Error("SMTP timeout")));
    socket.on("error", fail);
    socket.on("data", (chunk) => {
      buffer += chunk.toString();
      if (!buffer.endsWith(CRLF)) return;
      const code = Number(buffer.slice(0, 3));
      buffer = "";
      if (code >= 400) return fail(new Error("SMTP " + code));
      if (stage >= steps.length) return;
      socket.write(steps[stage++]);
      if (stage === steps.length && !done) {
        done = true;
        socket.end();
        resolve({ sent: true });
      }
    });
  });
}

async function notifyEmail(enquiry) {
  const env = process.env;
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return { skipped: "no SMTP settings" };
  const text = [
    "New enquiry from the MyFinancial website", "",
    "Name:        " + enquiry.name,
    "Email:       " + enquiry.email,
    "Phone:       " + enquiry.phone,
    "City:        " + (enquiry.city || "-"),
    "Residency:   " + (enquiry.residency || "-"),
    "Looking for: " + (enquiry.service || "-"), "",
    enquiry.message || "(no message)", "",
    "Received " + enquiry.created_at
  ].join("\n");
  return smtpSend({
    host: env.SMTP_HOST, port: env.SMTP_PORT || 465, user: env.SMTP_USER, pass: env.SMTP_PASS,
    from: env.SMTP_FROM || env.SMTP_USER, to: env.SMTP_TO || env.SMTP_USER,
    subject: "Website enquiry - " + enquiry.name, text
  });
}

async function notify(enquiry) {
  const out = {};
  for (const [name, fn] of [["webhook", notifyWebhook], ["email", notifyEmail]]) {
    try { out[name] = await fn(enquiry); }
    catch (e) { out[name] = { error: String((e && e.message) || e) }; console.error("notify:" + name, e); }
  }
  return out;
}

/* -------------------------------------------------------------- http helpers */

const MIME = {
  ".html": "text/html; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp",
  ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8", ".md": "text/plain; charset=utf-8"
};

function cors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOW_ORIGIN.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  }
}
function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "same-origin"
  }, headers || {}));
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}
function readBody(req, limit) {
  const max = limit || 64 * 1024;
  return new Promise((resolve, reject) => {
    let data = "", size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > max) { reject(new Error("body too large")); req.destroy(); return; }
      data += c;
    });
    req.on("end", () => { try { resolve(data ? JSON.parse(data) : {}); } catch (_) { reject(new Error("bad JSON")); } });
    req.on("error", reject);
  });
}
const clean = (v, max) => String(v == null ? "" : v).replace(/[^\P{C}\n]/gu, "").trim().slice(0, max || 500);
const int = (v) => { const n = Math.round(Number(v)); return Number.isFinite(n) && n >= 0 ? n : 0; };
const real = (v) => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : 0; };
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

async function serveStatic(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath);
  if (rel === "/" || rel === "") rel = "/index.html";
  if (rel === "/admin" || rel === "/admin/") {
    const html = await readFile(path.join(HERE, "admin.html"));
    return send(res, 200, html, { "Content-Type": MIME[".html"], "Cache-Control": "no-store" });
  }
  const full = path.join(ROOT, rel);
  if (!full.startsWith(ROOT)) return send(res, 403, { error: "forbidden" });
  try {
    const info = await stat(full);
    if (!info.isFile()) throw new Error("not a file");
    const body = await readFile(full);
    const type = MIME[path.extname(full).toLowerCase()] || "application/octet-stream";
    return send(res, 200, body, { "Content-Type": type, "Cache-Control": rel.endsWith(".json") ? "no-store" : "no-cache" });
  } catch (_) {
    return send(res, 404, { error: "not found" });
  }
}

/* ---------------------------------------------------------------- the routes */

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const p = url.pathname;
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress || "";
  cors(req, res);
  if (req.method === "OPTIONS") return send(res, 204, "");

  try {
    /* ---- public ---- */
    if (p === "/api/complaints" && req.method === "GET") {
      return send(res, 200, complaintsPayload(), { "Cache-Control": "no-store" });
    }
    if (p === "/api/site" && req.method === "GET") {
      return send(res, 200, q.settings(), { "Cache-Control": "no-store" });
    }
    if (p === "/api/enquiries" && req.method === "POST") {
      const body = await readBody(req);
      if (clean(body.website, 50)) return send(res, 200, { ok: true });
      const e = {
        created_at: new Date().toISOString(),
        name: clean(body.name, 120), email: clean(body.email, 160), phone: clean(body.phone, 24),
        city: clean(body.city, 80), residency: clean(body.residency, 20),
        service: clean(body.service, 40), message: clean(body.message, 2000),
        consent: body.consent ? 1 : 0
      };
      if (!e.name || !isEmail(e.email) || e.phone.replace(/\D/g, "").length < 8 || !e.consent) {
        return send(res, 400, { error: "Please provide a name, a valid email, a phone number, and your consent." });
      }
      if (rateLimited("enq:" + ip)) {
        return send(res, 429, { error: "Too many enquiries from this address. Please email us instead." });
      }
      const info = q.insertEnquiry.run(e.created_at, e.name, e.email, e.phone, e.city, e.residency,
                                       e.service, e.message, e.consent, ip, clean(req.headers["user-agent"], 200));
      notify(Object.assign({ id: Number(info.lastInsertRowid) }, e));
      return send(res, 201, { ok: true });
    }

    /* ---- admin auth ---- */
    if (p === "/api/admin/login" && req.method === "POST") {
      const body = await readBody(req);
      if (rateLimited("login:" + ip, 10, 10 * 60 * 1000)) {
        return send(res, 429, { error: "Too many attempts. Wait ten minutes." });
      }
      if (!passwordMatches(body.password || "")) return send(res, 401, { error: "Wrong password." });
      const token = newSession();
      const secure = String(req.headers["x-forwarded-proto"] || "").includes("https") ? " Secure;" : "";
      return send(res, 200, { ok: true }, {
        "Set-Cookie": "mf_admin=" + token + "; HttpOnly; Path=/; SameSite=Lax;" + secure + " Max-Age=" + (SESSION_MS / 1000)
      });
    }
    if (p === "/api/admin/logout" && req.method === "POST") {
      const t = validSession(req);
      if (t) sessions.delete(t);
      return send(res, 200, { ok: true }, { "Set-Cookie": "mf_admin=; HttpOnly; Path=/; Max-Age=0" });
    }
    if (p === "/api/admin/session") {
      return send(res, 200, {
        authenticated: Boolean(validSession(req)),
        default_password: ADMIN_PASSWORD === "change-me"
      });
    }

    if (p.startsWith("/api/admin/")) {
      if (!validSession(req)) return send(res, 401, { error: "Not signed in." });

      if (p === "/api/admin/complaints" && req.method === "GET") return send(res, 200, complaintsPayload());

      if (p === "/api/admin/complaints" && req.method === "PUT") {
        const body = await readBody(req);
        const month = clean(body.month, 7);
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return send(res, 400, { error: "month must look like 2026-09" });
        q.upsertMonth.run(month, int(body.impersonation), new Date().toISOString());
        for (const src of SOURCES) {
          const r = (body.rows && body.rows[src]) || {};
          q.upsertRow.run(month, src, int(r.pending_last), int(r.received), int(r.resolved),
                          int(r.pending_total), int(r.pending_gt3m), real(r.avg_days));
        }
        return send(res, 200, complaintsPayload());
      }

      if (p.startsWith("/api/admin/complaints/") && req.method === "DELETE") {
        const month = clean(p.split("/").pop(), 7);
        db.prepare("DELETE FROM complaints WHERE month = ?").run(month);
        db.prepare("DELETE FROM complaint_months WHERE month = ?").run(month);
        return send(res, 200, complaintsPayload());
      }

      if (p === "/api/admin/site" && req.method === "PUT") {
        const body = await readBody(req);
        for (const k of SITE_KEYS) if (k in body) q.setSetting.run(k, clean(body[k], 300));
        return send(res, 200, q.settings());
      }

      if (p === "/api/admin/enquiries" && req.method === "GET") {
        return send(res, 200, { enquiries: q.enquiries(url.searchParams.get("status") || "all") });
      }
      if (p === "/api/admin/enquiries.csv") {
        const rows = q.enquiries("all");
        const cols = ["id", "created_at", "name", "email", "phone", "city", "residency", "service", "message", "status", "notes"];
        const esc = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
        const csv = [cols.join(",")].concat(rows.map((r) => cols.map((c) => esc(r[c])).join(","))).join("\n");
        return send(res, 200, csv, {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="enquiries-' + new Date().toISOString().slice(0, 10) + '.csv"'
        });
      }
      if (p.startsWith("/api/admin/enquiries/") && req.method === "PATCH") {
        const id = Number(p.split("/").pop());
        const body = await readBody(req);
        const status = ["new", "replied", "closed"].indexOf(body.status) >= 0 ? body.status : "new";
        q.updateEnquiry.run(status, clean(body.notes, 1000), id);
        return send(res, 200, { ok: true });
      }
      if (p === "/api/admin/test-notify" && req.method === "POST") {
        const result = await notify({
          created_at: new Date().toISOString(), name: "Test enquiry", email: "test@example.com",
          phone: "0000000000", city: "-", residency: "resident", service: "test",
          message: "Notification test from the MyFinancial admin panel."
        });
        return send(res, 200, result);
      }
      return send(res, 404, { error: "unknown admin route" });
    }

    /* ---- static site + /admin ---- */
    if (req.method === "GET") return serveStatic(req, res, p);
    return send(res, 405, { error: "method not allowed" });
  } catch (err) {
    console.error(err);
    return send(res, 400, { error: String((err && err.message) || err) });
  }
});

server.listen(PORT, () => {
  console.log("MyFinancial server on http://localhost:" + PORT);
  console.log("  site   http://localhost:" + PORT + "/");
  console.log("  admin  http://localhost:" + PORT + "/admin");
  console.log("  db     " + DB_PATH);
  if (ADMIN_PASSWORD === "change-me") {
    console.log("  WARNING: ADMIN_PASSWORD is still the default. Set it before putting this on the internet.");
  }
});
