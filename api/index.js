// Back-end do Eternamax Rising (Vercel Serverless Function).
// Todas as rotas passam por aqui: /api/auth/*, /api/stats, /api/tournaments, /api/polls, /api/minecraft/info
const crypto = require("crypto");

/* ---------- Config (variáveis de ambiente) ---------- */
const E = process.env;
const REDIS_URL = E.KV_REST_API_URL || E.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = E.KV_REST_API_TOKEN || E.UPSTASH_REDIS_REST_TOKEN;
const ADMIN_IDS = (E.ADMIN_IDS || "").split(",").map(s => s.trim()).filter(Boolean);
const COOKIE = "er_session", STATE_COOKIE = "er_state", DAY = 86400;

/* ---------- Utilidades ---------- */
const b64 = b => Buffer.from(b).toString("base64url");
function sign(v) {
  if (!E.SESSION_SECRET) throw new HttpError(500, "Falta a variável SESSION_SECRET no servidor.");
  const p = b64(JSON.stringify(v));
  return p + "." + crypto.createHmac("sha256", E.SESSION_SECRET).update(p).digest("base64url");
}
function unsign(s) {
  try {
    const [p, m] = String(s || "").split(".");
    if (!p || !m || !E.SESSION_SECRET) return null;
    const ok = crypto.createHmac("sha256", E.SESSION_SECRET).update(p).digest("base64url");
    if (m.length !== ok.length || !crypto.timingSafeEqual(Buffer.from(m), Buffer.from(ok))) return null;
    const v = JSON.parse(Buffer.from(p, "base64url").toString());
    return v.exp && v.exp < Date.now() / 1000 ? null : v;
  } catch { return null; }
}
class HttpError extends Error { constructor(s, m) { super(m); this.status = s; } }
const cookies = req => Object.fromEntries((req.headers.cookie || "").split(/;\s*/).filter(Boolean).map(c => { const i = c.indexOf("="); return [c.slice(0, i), decodeURIComponent(c.slice(i + 1))]; }));
const setCookie = (res, name, val, maxAge) => {
  const c = `${name}=${encodeURIComponent(val)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
  const prev = res.getHeader("Set-Cookie");
  res.setHeader("Set-Cookie", prev ? [].concat(prev, c) : c);
};
const json = (res, code, data) => { res.statusCode = code; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(data)); };
const origin = req => (E.BASE_URL || `https://${req.headers["x-forwarded-host"] || req.headers.host}`).replace(/\/$/, "");

/* ---------- Redis (Upstash, via REST) ---------- */
async function redis(...cmd) {
  if (!REDIS_URL || !REDIS_TOKEN) throw new HttpError(500, "Banco de dados não configurado (Upstash Redis).");
  const r = await fetch(REDIS_URL, { method: "POST", headers: { Authorization: `Bearer ${REDIS_TOKEN}` }, body: JSON.stringify(cmd) });
  const d = await r.json();
  if (d.error) throw new Error(d.error);
  return d.result;
}
const hashToObj = a => { const o = {}; for (let i = 0; i < (a || []).length; i += 2) o[a[i]] = a[i + 1]; return o; };

/* ---------- Corpo da requisição (JSON ou multipart) ---------- */
async function rawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body);
  if (req.body && typeof req.body === "object") return Buffer.from(JSON.stringify(req.body));
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}
function parseMultipart(buf, ct) {
  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(ct);
  const fields = {}, files = [];
  if (!m) return { fields, files };
  const b = Buffer.from("--" + (m[1] || m[2]));
  let pos = buf.indexOf(b);
  while (pos !== -1) {
    const start = pos + b.length;
    if (buf[start] === 45 && buf[start + 1] === 45) break;
    const hEnd = buf.indexOf("\r\n\r\n", start), next = buf.indexOf(b, hEnd);
    if (hEnd < 0 || next < 0) break;
    const head = buf.slice(start, hEnd).toString("utf8"), body = buf.slice(hEnd + 4, next - 2);
    const name = /name="([^"]*)"/i.exec(head)?.[1], file = /filename="([^"]*)"/i.exec(head)?.[1];
    if (name) {
      if (file) { if (body.length) files.push({ name, filename: file, type: /content-type:\s*([^\r\n]+)/i.exec(head)?.[1] || "application/octet-stream", data: body }); }
      else { const k = name.replace(/\[\]$/, ""); (fields[k] ||= []).push(body.toString("utf8")); }
    }
    pos = next;
  }
  return { fields, files };
}
async function readBody(req) {
  const ct = req.headers["content-type"] || "", buf = await rawBody(req);
  if (ct.includes("multipart/form-data")) return parseMultipart(buf, ct);
  if (ct.includes("application/json")) {
    let o = {}; try { o = JSON.parse(buf.toString() || "{}"); } catch { throw new HttpError(400, "JSON inválido."); }
    const fields = {}; for (const k in o) fields[k] = [].concat(o[k]).map(String);
    return { fields, files: [] };
  }
  return { fields: {}, files: [] };
}
const one = (f, k) => (f[k] && f[k][0] != null ? String(f[k][0]).trim() : "");

/* ---------- Upload de imagens (Vercel Blob, opcional) ---------- */
async function uploadImage(f) {
  if (!f || !E.BLOB_READ_WRITE_TOKEN || !/^image\//.test(f.type) || f.data.length > 5e6) return null;
  try {
    const { put } = require("@vercel/blob");
    const safe = f.filename.replace(/[^\w.\-]/g, "_").slice(-60) || "img";
    const r = await put(`eternamax/${Date.now()}-${safe}`, f.data, { access: "public", contentType: f.type, addRandomSuffix: true });
    return r.url;
  } catch (e) { console.error("blob:", e.message); return null; }
}

/* ---------- Sessão ---------- */
function getUser(req) {
  const s = unsign(cookies(req)[COOKIE]);
  if (!s || !s.id) return null;
  return { id: s.id, username: s.username, global_name: s.global_name, avatar: s.avatar, isAdmin: ADMIN_IDS.includes(s.id) };
}
const needUser = req => { const u = getUser(req); if (!u) throw new HttpError(401, "Entre com o Discord para continuar."); return u; };
const needAdmin = req => { const u = needUser(req); if (!u.isAdmin) throw new HttpError(403, "Apenas administradores podem fazer isso."); return u; };

/* ---------- Rotas ---------- */
async function authDiscord(req, res, url) {
  if (!E.DISCORD_CLIENT_ID || !E.DISCORD_CLIENT_SECRET) throw new HttpError(500, "Faltam DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET no servidor.");
  const back = url.searchParams.get("redirect") || origin(req) + "/";
  const state = crypto.randomBytes(16).toString("hex");
  setCookie(res, STATE_COOKIE, sign({ state, back, exp: Date.now() / 1000 + 600 }), 600);
  const q = new URLSearchParams({ client_id: E.DISCORD_CLIENT_ID, redirect_uri: origin(req) + "/api/auth/callback", response_type: "code", scope: "identify", state, prompt: "none" });
  res.statusCode = 302; res.setHeader("Location", "https://discord.com/oauth2/authorize?" + q); res.end();
}
async function authCallback(req, res, url) {
  const st = unsign(cookies(req)[STATE_COOKIE]);
  if (!st || st.state !== url.searchParams.get("state") || !url.searchParams.get("code")) throw new HttpError(400, "Login inválido ou expirado. Tente entrar de novo.");
  const tr = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: E.DISCORD_CLIENT_ID, client_secret: E.DISCORD_CLIENT_SECRET, grant_type: "authorization_code", code: url.searchParams.get("code"), redirect_uri: origin(req) + "/api/auth/callback" })
  });
  const tk = await tr.json();
  if (!tr.ok || !tk.access_token) throw new HttpError(400, "O Discord recusou o login (confira o Redirect URI e o Client Secret).");
  const ur = await fetch("https://discord.com/api/users/@me", { headers: { Authorization: "Bearer " + tk.access_token } });
  const u = await ur.json();
  if (!u.id) throw new HttpError(502, "Não consegui ler seu perfil do Discord.");
  const avatar = u.avatar ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=128` : `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(u.id) >> 22n) % 6n)}.png`;
  setCookie(res, COOKIE, sign({ id: u.id, username: u.username, global_name: u.global_name || u.username, avatar, exp: Date.now() / 1000 + 30 * DAY }), 30 * DAY);
  setCookie(res, STATE_COOKIE, "", 0);
  let back = st.back || "/";
  try { if (new URL(back, origin(req)).host !== new URL(origin(req)).host) back = "/"; } catch { back = "/"; }
  res.statusCode = 302; res.setHeader("Location", back); res.end();
}

async function stats(req, res) {
  const code = E.DISCORD_INVITE || "G98ern6ZgK";
  let members = null;
  try {
    const r = await fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true`);
    const d = await r.json(); members = d.approximate_member_count ?? null;
  } catch {}
  let tournaments = null;
  try { tournaments = await redis("HLEN", "tournaments"); } catch {}
  res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600");
  json(res, 200, { members, tournaments });
}

async function listTournaments(req, res) {
  const all = Object.values(hashToObj(await redis("HGETALL", "tournaments"))).map(s => JSON.parse(s));
  all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  json(res, 200, all);
}
async function createTournament(req, res) {
  needAdmin(req);
  const { fields, files } = await readBody(req);
  const title = one(fields, "title"), description = one(fields, "description"), game = one(fields, "game");
  if (!title || !description || !game) throw new HttpError(400, "Preencha jogo, título e descrição.");
  const image = await uploadImage(files.find(f => f.name === "files"));
  const t = {
    id: crypto.randomUUID(), game: game.slice(0, 40), title: title.slice(0, 120), description: description.slice(0, 2000),
    extra: (fields.extra || []).map(s => s.trim()).filter(Boolean).slice(0, 10).map(s => s.slice(0, 200)),
    image, createdAt: new Date().toISOString()
  };
  await redis("HSET", "tournaments", t.id, JSON.stringify(t));
  json(res, 201, t);
}
async function registerTournament(req, res, id) {
  const u = needUser(req);
  if (!(await redis("HEXISTS", "tournaments", id))) throw new HttpError(404, "Torneio não encontrado.");
  const { fields } = await readBody(req);
  const nick = one(fields, "nick");
  if (!nick) throw new HttpError(400, "Informe seu nick.");
  const reg = { userId: u.id, discord: u.username, nick: nick.slice(0, 60), notes: one(fields, "notes").slice(0, 500), at: new Date().toISOString() };
  if (!(await redis("HSETNX", "regs:" + id, u.id, JSON.stringify(reg)))) throw new HttpError(409, "Você já está inscrito neste torneio.");
  json(res, 200, { ok: true });
}

async function pollView(p, userId) {
  const votes = hashToObj(await redis("HGETALL", "votes:" + p.id));
  const counts = p.options.map(() => 0);
  for (const k in votes) { const i = +votes[k]; if (counts[i] != null) counts[i]++; }
  return { ...p, options: p.options.map((o, i) => ({ text: o.text, votes: counts[i] })), voted: userId && votes[userId] != null ? +votes[userId] : null, closed: new Date(p.endsAt) < new Date() };
}
async function listPolls(req, res) {
  const u = getUser(req);
  const all = Object.values(hashToObj(await redis("HGETALL", "polls"))).map(s => JSON.parse(s));
  all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  json(res, 200, await Promise.all(all.slice(0, 30).map(p => pollView(p, u?.id))));
}
async function createPoll(req, res) {
  needAdmin(req);
  const { fields, files } = await readBody(req);
  const question = one(fields, "question"), options = (fields.options || []).map(s => s.trim()).filter(Boolean).slice(0, 10);
  if (!question || options.length < 2) throw new HttpError(400, "Informe a pergunta e pelo menos 2 opções.");
  const hours = Math.min(Math.max(+one(fields, "hours") || 24, 1), 720);
  const p = {
    id: crypto.randomUUID(), question: question.slice(0, 300), options: options.map(t => ({ text: t.slice(0, 120) })),
    image: await uploadImage(files.find(f => f.name === "image")), createdAt: new Date().toISOString(), endsAt: new Date(Date.now() + hours * 3600e3).toISOString()
  };
  await redis("HSET", "polls", p.id, JSON.stringify(p));
  json(res, 201, p);
}
async function votePoll(req, res, id) {
  const u = needUser(req);
  const raw = await redis("HGET", "polls", id);
  if (!raw) throw new HttpError(404, "Votação não encontrada.");
  const p = JSON.parse(raw);
  if (new Date(p.endsAt) < new Date()) throw new HttpError(400, "Essa votação já foi encerrada.");
  const { fields } = await readBody(req), opt = Number(one(fields, "option"));
  if (!Number.isInteger(opt) || opt < 0 || opt >= p.options.length) throw new HttpError(400, "Opção inválida.");
  if (!(await redis("HSETNX", "votes:" + id, u.id, String(opt)))) throw new HttpError(409, "Você já votou nesta votação.");
  json(res, 200, { ok: true });
}

function mcInfo(req, res) {
  needUser(req);
  json(res, 200, { ip: E.MC_IP || null, port: E.MC_PORT || null, version: E.MC_VERSION || null });
}

/* ---------- Roteador ---------- */
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    const url = new URL(req.url, "http://x");
    const path = url.pathname.replace(/^\/api(\/index)?/, "").replace(/\/+$/, "") || "/";
    const m = req.method;
    let x;
    if (m === "GET" && path === "/auth/discord") return await authDiscord(req, res, url);
    if (m === "GET" && path === "/auth/callback") return await authCallback(req, res, url);
    if (m === "GET" && path === "/auth/me") return json(res, 200, { user: getUser(req) });
    if (m === "POST" && path === "/auth/logout") { setCookie(res, COOKIE, "", 0); return json(res, 200, { ok: true }); }
    if (m === "GET" && path === "/stats") return await stats(req, res);
    if (m === "GET" && path === "/minecraft/info") return mcInfo(req, res);
    if (m === "GET" && path === "/tournaments") return await listTournaments(req, res);
    if (m === "POST" && path === "/tournaments") return await createTournament(req, res);
    if (m === "POST" && (x = path.match(/^\/tournaments\/([\w-]+)\/register$/))) return await registerTournament(req, res, x[1]);
    if (m === "GET" && path === "/polls") return await listPolls(req, res);
    if (m === "POST" && path === "/polls") return await createPoll(req, res);
    if (m === "POST" && (x = path.match(/^\/polls\/([\w-]+)\/vote$/))) return await votePoll(req, res, x[1]);
    if (path === "/") return json(res, 200, { ok: true, name: "Eternamax Rising API" });
    json(res, 404, { error: "Rota não encontrada." });
  } catch (e) {
    if (!(e instanceof HttpError)) console.error(e);
    json(res, e.status || 500, { error: e instanceof HttpError ? e.message : "Erro interno no servidor." });
  }
};
