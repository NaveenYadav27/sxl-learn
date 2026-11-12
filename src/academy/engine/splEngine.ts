/**
 * Educational SPL engine — a deterministic, in-browser subset of Splunk's Search Processing Language
 * that runs over the Academy's synthetic scenario events. It is a teaching tool, not real Splunk.
 *
 * Supported: base search (field=value, !=, <, >, wildcards, quoted phrases, AND/OR/NOT, IN (...),
 * earliest=/latest=), and the commands in COMMAND_DOCS below.
 */
import type { SimEvent, SplExercise } from "../types";

export type Val = string | number;
export type Rec = Record<string, Val>;

export interface SplStage { command: string; name: string; text: string; rowsIn: number; rowsOut: number }

export interface SplRun {
  mode: "events" | "table";
  columns: string[];
  rows: Rec[];
  eventCount: number;          // events matched by the base search
  scanned: number;             // events in the dataset after the time range
  stages: SplStage[];
  error?: string;
  warning?: string;
}

/* ============================== command docs (Explain buttons) ============================== */
export interface CommandDoc { name: string; purpose: string; syntax: string; example: string; tip: string }

export const COMMAND_DOCS: Record<string, CommandDoc> = {
  search: { name: "search", purpose: "Finds the events you want. Every word or field=value you type is a filter; they are all required (AND) unless you write OR.", syntax: "index=<name> field=value \"exact phrase\" NOT field=value", example: "index=auth action=failure user=j.doe", tip: "Always start with index= — it tells Splunk which bucket of logs to look in and makes searches fast." },
  where: { name: "where", purpose: "Keeps only the rows where a condition is true. Use it after stats to filter on calculated numbers.", syntax: "| where <field> <op> <value>", example: "| where count > 20", tip: "Text values need double quotes: | where user=\"j.doe\"" },
  stats: { name: "stats", purpose: "Groups rows and calculates numbers for each group — count, distinct count, sum, average, min, max.", syntax: "| stats <function>(field) [as name] by <field>, <field>", example: "| stats count by src_ip", tip: "The fields after 'by' become the rows; everything else is thrown away. Pick 'by' fields that answer your question." },
  table: { name: "table", purpose: "Shows only the columns you list, in that order.", syntax: "| table field1 field2 ...", example: "| table _time user src_ip action", tip: "Use table at the end of a search to make results readable for your ticket." },
  fields: { name: "fields", purpose: "Keeps (or with a minus sign, removes) fields from results.", syntax: "| fields [+|-] field1 field2", example: "| fields - _raw", tip: "Removing fields you don't need makes big searches faster." },
  sort: { name: "sort", purpose: "Orders rows. A minus sign means biggest first (descending).", syntax: "| sort [limit] [-]field", example: "| sort - count", tip: "Combine with head to get a 'top N' list: | sort - count | head 5" },
  dedup: { name: "dedup", purpose: "Removes duplicates — keeps only the first (newest) row for each unique value.", syntax: "| dedup field1 [field2]", example: "| dedup user", tip: "Great for 'which users appear at all?' questions." },
  head: { name: "head", purpose: "Keeps the first N rows (default 10).", syntax: "| head N", example: "| head 5", tip: "Base searches return newest events first, so head shows the most recent ones." },
  tail: { name: "tail", purpose: "Keeps the last N rows (default 10).", syntax: "| tail N", example: "| tail 3", tip: "Base search results are newest first, so tail shows the oldest events." },
  rename: { name: "rename", purpose: "Gives a field a friendlier name.", syntax: "| rename old as new, old2 as \"New Name\"", example: "| rename src_ip as \"Source IP\"", tip: "Rename at the end — later commands must use the new name." },
  eval: { name: "eval", purpose: "Creates or changes a field with a calculation or condition.", syntax: "| eval new_field=<expression>", example: "| eval is_admin=if(like(user,\"adm.%\"),\"yes\",\"no\")", tip: "Functions: if, case, coalesce, round, len, lower, upper, substr, like, match, isnull, isnotnull." },
  top: { name: "top", purpose: "Shows the most common values of a field, with count and percent.", syntax: "| top [limit=N] field [by field]", example: "| top limit=5 src_ip", tip: "top is a quick shortcut for stats count by field | sort - count." },
  rare: { name: "rare", purpose: "Shows the least common values — useful for hunting odd one-offs.", syntax: "| rare field", example: "| rare process", tip: "Attackers are often rare: the process that ran once is more interesting than the one that ran 10,000 times." },
  timechart: { name: "timechart", purpose: "Counts events over time buckets — great for spotting bursts and beacons.", syntax: "| timechart span=<1m|5m|1h> count [by field]", example: "| timechart span=1m count by src_ip", tip: "A perfectly regular line every minute is a classic sign of beaconing." },
  bin: { name: "bin", purpose: "Rounds _time (or a number) into buckets so you can group by time window.", syntax: "| bin _time span=5m", example: "| bin _time span=5m | stats count by _time, user", tip: "bucket is the same command." },
  rex: { name: "rex", purpose: "Extracts a new field from text using a regular expression with a named group.", syntax: "| rex field=<field> \"(?<name>pattern)\"", example: "| rex field=query \"\\.(?<domain>[^.]+\\.[^.]+)$\"", tip: "Use it when the value you need is buried inside _raw or a long field." },
  fillnull: { name: "fillnull", purpose: "Fills empty fields with a value (default 0).", syntax: "| fillnull [value=X] [field ...]", example: "| fillnull value=0 bytes_out", tip: "Helpful before maths so blanks don't break calculations." },
  tstats: { name: "tstats", purpose: "Searches accelerated data models (normalised CIM data) very fast. Field names are prefixed with the data model.", syntax: "| tstats count from datamodel=Authentication where Authentication.action=failure by Authentication.user", example: "| tstats count from datamodel=Authentication by Authentication.src", tip: "Data models in this simulator: Authentication, Network_Traffic, Web, Endpoint, Network_Resolution." },
};
COMMAND_DOCS.bucket = { ...COMMAND_DOCS.bin, name: "bucket" };

const SUPPORTED = Object.keys(COMMAND_DOCS);

/* ============================== helpers ============================== */
const isNum = (v: unknown): v is number => typeof v === "number" && !Number.isNaN(v);
function toNum(v: unknown): number | null {
  if (isNum(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  return null;
}
function fmtNum(n: number): number { return Math.round(n * 100) / 100; }

function getField(r: Rec, name: string): Val | undefined {
  if (name in r) return r[name];
  const lower = name.toLowerCase();
  for (const k of Object.keys(r)) if (k.toLowerCase() === lower) return r[k];
  return undefined;
}
function fieldKey(r: Rec, name: string): string {
  if (name in r) return name;
  const lower = name.toLowerCase();
  for (const k of Object.keys(r)) if (k.toLowerCase() === lower) return k;
  return name;
}

function wildcardToRegex(pattern: string, anchored: boolean): RegExp {
  const esc = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(anchored ? `^${esc}$` : esc, "i");
}

function unquote(s: string): string {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"') && t.length >= 2) || (t.startsWith("'") && t.endsWith("'") && t.length >= 2)) return t.slice(1, -1);
  return t;
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}
function suggest(cmd: string): string | undefined {
  let best: string | undefined; let d = 3;
  for (const s of SUPPORTED) { const x = levenshtein(cmd, s); if (x < d) { d = x; best = s; } }
  return best;
}

/** Split on a delimiter character outside quotes/parens. */
function splitTop(s: string, delim: string): string[] {
  const out: string[] = []; let cur = ""; let q: string | null = null; let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { cur += c; if (c === q && s[i - 1] !== "\\") q = null; continue; }
    if (c === '"' || c === "'") { q = c; cur += c; continue; }
    if (c === "(") depth++;
    if (c === ")") depth = Math.max(0, depth - 1);
    if (c === delim && depth === 0) { out.push(cur); cur = ""; continue; }
    cur += c;
  }
  out.push(cur);
  return out;
}

export function splitPipeline(spl: string): string[] {
  return splitTop(spl.replace(/\r?\n/g, " "), "|").map((x) => x.trim());
}

/* ============================== search expression ============================== */
type SNode =
  | { k: "and" | "or"; a: SNode; b: SNode }
  | { k: "not"; a: SNode }
  | { k: "cmp"; field: string; op: string; value: string; quoted: boolean }
  | { k: "in"; field: string; values: string[] }
  | { k: "term"; value: string; quoted: boolean }
  | { k: "true" };

interface STok { t: string; quoted: boolean }

function tokenizeSearch(s: string): STok[] {
  const toks: STok[] = []; let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === "(" || c === ")") { toks.push({ t: c, quoted: false }); i++; continue; }
    let cur = ""; let quoted = false;
    while (i < s.length && !/\s/.test(s[i]) && s[i] !== "(" && s[i] !== ")") {
      if (s[i] === '"') {
        quoted = true; cur += s[i++];
        while (i < s.length && s[i] !== '"') cur += s[i++];
        if (i < s.length) cur += s[i++];
        continue;
      }
      if (s[i] === ",") { if (cur) { toks.push({ t: cur, quoted }); cur = ""; quoted = false; } toks.push({ t: ",", quoted: false }); i++; continue; }
      cur += s[i++];
    }
    if (cur) toks.push({ t: cur, quoted });
  }
  return toks;
}

const CMP_RE = /^([A-Za-z_][\w.:-]*)(!=|>=|<=|==|=|>|<)(.*)$/s;

function parseSearch(s: string): SNode {
  const toks = tokenizeSearch(s); let p = 0;
  const peek = () => toks[p]; const next = () => toks[p++];
  const kw = (t: STok | undefined, w: string) => !!t && !t.quoted && t.t.toUpperCase() === w;

  function primary(): SNode {
    const t = next();
    if (!t) throw new Error("Search ended unexpectedly.");
    if (t.t === "(") { const e = andExpr(); if (peek()?.t !== ")") throw new Error("Missing a closing ')'."); next(); return e; }
    if (t.t === ")") throw new Error("Unexpected ')'.");
    // field IN (a, b)
    if (/^[A-Za-z_][\w.]*$/.test(t.t) && kw(peek(), "IN")) {
      next(); if (peek()?.t !== "(") throw new Error("IN must be followed by a list in parentheses, e.g. user IN (a, b).");
      next(); const values: string[] = [];
      while (peek() && peek()!.t !== ")") { const v = next()!; if (v.t !== ",") values.push(unquote(v.t)); }
      if (!peek()) throw new Error("Missing ')' after IN list."); next();
      return { k: "in", field: t.t, values };
    }
    const m = !t.t.startsWith('"') ? CMP_RE.exec(t.t) : null;
    if (m) {
      let value = m[3];
      if (value === "" && peek() && peek()!.t !== ")") value = next()!.t; // field= "value"
      return { k: "cmp", field: m[1], op: m[2] === "==" ? "=" : m[2], value: unquote(value), quoted: value.trim().startsWith('"') };
    }
    return { k: "term", value: unquote(t.t), quoted: t.quoted };
  }
  function notExpr(): SNode { if (kw(peek(), "NOT")) { next(); return { k: "not", a: notExpr() }; } return primary(); }
  function orExpr(): SNode { let a = notExpr(); while (kw(peek(), "OR")) { next(); a = { k: "or", a, b: notExpr() }; } return a; }
  function andExpr(): SNode {
    if (!peek()) return { k: "true" };
    let a = orExpr();
    while (peek() && peek()!.t !== ")") { if (kw(peek(), "AND")) next(); a = { k: "and", a, b: orExpr() }; }
    return a;
  }
  const node = andExpr();
  if (p < toks.length) throw new Error("Unbalanced parentheses in the search.");
  return node;
}

function matchValue(actual: Val | undefined, op: string, expected: string): boolean {
  if (actual === undefined || actual === "") return false;
  const an = toNum(actual); const en = toNum(expected);
  if (op === ">" || op === "<" || op === ">=" || op === "<=") {
    if (an === null || en === null) return false;
    return op === ">" ? an > en : op === "<" ? an < en : op === ">=" ? an >= en : an <= en;
  }
  const eq = expected.includes("*") ? wildcardToRegex(expected, true).test(String(actual)) : String(actual).toLowerCase() === expected.toLowerCase();
  return op === "!=" ? !eq : eq;
}

function evalSearch(n: SNode, r: Rec): boolean {
  switch (n.k) {
    case "true": return true;
    case "and": return evalSearch(n.a, r) && evalSearch(n.b, r);
    case "or": return evalSearch(n.a, r) || evalSearch(n.b, r);
    case "not": return !evalSearch(n.a, r);
    case "in": { const v = getField(r, n.field); return n.values.some((x) => matchValue(v, "=", x)); }
    case "cmp": {
      const f = n.field.toLowerCase();
      if (f === "earliest" || f === "latest") return true; // handled as time bounds
      const v = getField(r, n.field);
      if (n.op === "!=" && v === undefined) return false;
      return matchValue(v, n.op, n.value);
    }
    case "term": {
      const raw = String(r._raw ?? "");
      return n.value.includes("*") ? wildcardToRegex(n.value, false).test(raw) : raw.toLowerCase().includes(n.value.toLowerCase());
    }
  }
}

function describeSearch(n: SNode): string {
  switch (n.k) {
    case "true": return "everything";
    case "and": return `${describeSearch(n.a)} AND ${describeSearch(n.b)}`;
    case "or": return `(${describeSearch(n.a)} OR ${describeSearch(n.b)})`;
    case "not": return `NOT ${describeSearch(n.a)}`;
    case "in": return `${n.field} is one of ${n.values.map((v) => `"${v}"`).join(", ")}`;
    case "cmp": {
      const f = n.field.toLowerCase();
      if (f === "earliest") return `time is after ${n.value}`;
      if (f === "latest") return `time is before ${n.value}`;
      const ops: Record<string, string> = { "=": "is", "!=": "is not", ">": "is greater than", "<": "is less than", ">=": "is at least", "<=": "is at most" };
      return `${n.field} ${ops[n.op]} "${n.value}"${n.value.includes("*") ? " (wildcard)" : ""}`;
    }
    case "term": return `the raw text contains "${n.value}"`;
  }
}

function collectTimeBounds(n: SNode, out: { earliest?: string; latest?: string }) {
  if (n.k === "and" || n.k === "or") { collectTimeBounds(n.a, out); collectTimeBounds(n.b, out); }
  else if (n.k === "cmp") { const f = n.field.toLowerCase(); if (f === "earliest") out.earliest = n.value; if (f === "latest") out.latest = n.value; }
}

function relSeconds(spec: string): number | null {
  const m = /^-(\d+)\s*(s|m|min|h|d)$/i.exec(spec.trim());
  if (!m) return spec.trim() === "now" ? 0 : null;
  const n = Number(m[1]); const u = m[2].toLowerCase();
  return n * (u === "s" ? 1 : u === "m" || u === "min" ? 60 : u === "h" ? 3600 : 86400);
}

/* ============================== eval / where expressions ============================== */
type ETok = { k: "num"; v: number } | { k: "str"; v: string } | { k: "id"; v: string } | { k: "op"; v: string };

function tokenizeExpr(s: string): ETok[] {
  const out: ETok[] = []; let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(s[i + 1] ?? ""))) { let n = ""; while (i < s.length && /[0-9.]/.test(s[i])) n += s[i++]; out.push({ k: "num", v: Number(n) }); continue; }
    if (c === '"') { let v = ""; i++; while (i < s.length && s[i] !== '"') { if (s[i] === "\\" && i + 1 < s.length) i++; v += s[i++]; } i++; out.push({ k: "str", v }); continue; }
    if (c === "'") { let v = ""; i++; while (i < s.length && s[i] !== "'") v += s[i++]; i++; out.push({ k: "id", v }); continue; }
    if (/[A-Za-z_]/.test(c)) { let v = ""; while (i < s.length && /[\w.]/.test(s[i])) v += s[i++]; out.push({ k: "id", v }); continue; }
    const two = s.slice(i, i + 2);
    if (["==", "!=", ">=", "<="].includes(two)) { out.push({ k: "op", v: two }); i += 2; continue; }
    if ("=<>+-*/%(),.".includes(c)) { out.push({ k: "op", v: c }); i++; continue; }
    throw new Error(`Unexpected character "${c}" in expression.`);
  }
  return out;
}

type ENode =
  | { k: "lit"; v: Val | null }
  | { k: "field"; name: string }
  | { k: "bin"; op: string; a: ENode; b: ENode }
  | { k: "not"; a: ENode }
  | { k: "neg"; a: ENode }
  | { k: "call"; fn: string; args: ENode[] };

function parseExpr(s: string): ENode {
  const t = tokenizeExpr(s); let p = 0;
  const peek = () => t[p];
  const isOp = (v: string) => peek()?.k === "op" && (peek() as { v: string }).v === v;
  const isKw = (v: string) => peek()?.k === "id" && String((peek() as { v: string }).v).toUpperCase() === v;
  function or(): ENode { let a = and(); while (isKw("OR")) { p++; a = { k: "bin", op: "OR", a, b: and() }; } return a; }
  function and(): ENode { let a = not(); while (isKw("AND")) { p++; a = { k: "bin", op: "AND", a, b: not() }; } return a; }
  function not(): ENode { if (isKw("NOT")) { p++; return { k: "not", a: not() }; } return cmp(); }
  function cmp(): ENode {
    let a = add();
    while (peek()?.k === "op" && ["=", "==", "!=", ">", "<", ">=", "<="].includes((peek() as { v: string }).v)) {
      const op = (t[p++] as { v: string }).v; a = { k: "bin", op: op === "==" ? "=" : op, a, b: add() };
    }
    return a;
  }
  function add(): ENode { let a = mul(); while (isOp("+") || isOp("-") || isOp(".")) { const op = (t[p++] as { v: string }).v; a = { k: "bin", op, a, b: mul() }; } return a; }
  function mul(): ENode { let a = unary(); while (isOp("*") || isOp("/") || isOp("%")) { const op = (t[p++] as { v: string }).v; a = { k: "bin", op, a, b: unary() }; } return a; }
  function unary(): ENode { if (isOp("-")) { p++; return { k: "neg", a: unary() }; } return prim(); }
  function prim(): ENode {
    const x = t[p++];
    if (!x) throw new Error("Expression ended unexpectedly.");
    if (x.k === "num") return { k: "lit", v: x.v };
    if (x.k === "str") return { k: "lit", v: x.v };
    if (x.k === "op" && x.v === "(") { const e = or(); if (!isOp(")")) throw new Error("Missing ')' in expression."); p++; return e; }
    if (x.k === "id") {
      if (isOp("(")) {
        p++; const args: ENode[] = [];
        if (!isOp(")")) { args.push(or()); while (isOp(",")) { p++; args.push(or()); } }
        if (!isOp(")")) throw new Error(`Missing ')' after ${x.v}(...).`); p++;
        return { k: "call", fn: x.v.toLowerCase(), args };
      }
      if (x.v.toLowerCase() === "true") return { k: "lit", v: 1 };
      if (x.v.toLowerCase() === "false") return { k: "lit", v: 0 };
      if (x.v.toLowerCase() === "null") return { k: "lit", v: null };
      return { k: "field", name: x.v };
    }
    throw new Error(`Unexpected "${(x as { v: unknown }).v}" in expression.`);
  }
  const e = or();
  if (p < t.length) throw new Error(`Unexpected "${(t[p] as { v: unknown }).v}" in expression.`);
  return e;
}

const truthy = (v: Val | null | undefined) => v !== null && v !== undefined && v !== "" && v !== 0 && v !== false as unknown;

function likeToRegex(pattern: string): RegExp {
  return new RegExp("^" + pattern.replace(/[.+?^${}()|[\]\\*]/g, "\\$&").replace(/%/g, ".*").replace(/_/g, ".") + "$", "i");
}

function evalExpr(n: ENode, r: Rec): Val | null {
  switch (n.k) {
    case "lit": return n.v;
    case "field": { const v = getField(r, n.name); return v === undefined ? null : v; }
    case "neg": { const v = toNum(evalExpr(n.a, r)); return v === null ? null : -v; }
    case "not": return truthy(evalExpr(n.a, r)) ? 0 : 1;
    case "bin": {
      if (n.op === "AND") return truthy(evalExpr(n.a, r)) && truthy(evalExpr(n.b, r)) ? 1 : 0;
      if (n.op === "OR") return truthy(evalExpr(n.a, r)) || truthy(evalExpr(n.b, r)) ? 1 : 0;
      const a = evalExpr(n.a, r); const b = evalExpr(n.b, r);
      if (n.op === ".") return `${a ?? ""}${b ?? ""}`;
      if (["+", "-", "*", "/", "%"].includes(n.op)) {
        const x = toNum(a); const y = toNum(b);
        if (n.op === "+" && (x === null || y === null)) return a === null || b === null ? null : `${a}${b}`;
        if (x === null || y === null) return null;
        if (n.op === "+") return x + y; if (n.op === "-") return x - y; if (n.op === "*") return x * y;
        if (n.op === "/") return y === 0 ? null : x / y; return y === 0 ? null : x % y;
      }
      if (a === null || b === null) return n.op === "!=" ? (a !== b ? 1 : 0) : 0;
      const x = toNum(a); const y = toNum(b);
      if (x !== null && y !== null) {
        const res = n.op === "=" ? x === y : n.op === "!=" ? x !== y : n.op === ">" ? x > y : n.op === "<" ? x < y : n.op === ">=" ? x >= y : x <= y;
        return res ? 1 : 0;
      }
      const sa = String(a).toLowerCase(); const sb = String(b).toLowerCase();
      const res = n.op === "=" ? sa === sb : n.op === "!=" ? sa !== sb : n.op === ">" ? sa > sb : n.op === "<" ? sa < sb : n.op === ">=" ? sa >= sb : sa <= sb;
      return res ? 1 : 0;
    }
    case "call": {
      const A = n.args.map((x) => () => evalExpr(x, r));
      switch (n.fn) {
        case "if": return truthy(A[0]?.()) ? (A[1]?.() ?? null) : (A[2]?.() ?? null);
        case "case": for (let i = 0; i + 1 < A.length; i += 2) if (truthy(A[i]())) return A[i + 1](); return null;
        case "coalesce": for (const f of A) { const v = f(); if (v !== null && v !== "") return v; } return null;
        case "round": { const v = toNum(A[0]?.()); const d = toNum(A[1]?.() ?? 0) ?? 0; return v === null ? null : Math.round(v * 10 ** d) / 10 ** d; }
        case "abs": { const v = toNum(A[0]?.()); return v === null ? null : Math.abs(v); }
        case "floor": { const v = toNum(A[0]?.()); return v === null ? null : Math.floor(v); }
        case "ceil": case "ceiling": { const v = toNum(A[0]?.()); return v === null ? null : Math.ceil(v); }
        case "len": { const v = A[0]?.(); return v === null || v === undefined ? null : String(v).length; }
        case "lower": { const v = A[0]?.(); return v === null || v === undefined ? null : String(v).toLowerCase(); }
        case "upper": { const v = A[0]?.(); return v === null || v === undefined ? null : String(v).toUpperCase(); }
        case "substr": { const v = A[0]?.(); if (v === null || v === undefined) return null; const s = toNum(A[1]?.()) ?? 1; const l = A[2] ? toNum(A[2]()) ?? undefined : undefined; return String(v).substr(s - 1, l); }
        case "isnull": { const v = A[0]?.(); return v === null || v === undefined || v === "" ? 1 : 0; }
        case "isnotnull": { const v = A[0]?.(); return v === null || v === undefined || v === "" ? 0 : 1; }
        case "like": { const v = A[0]?.(); const pat = A[1]?.(); return v === null || pat === null ? 0 : likeToRegex(String(pat)).test(String(v)) ? 1 : 0; }
        case "match": { const v = A[0]?.(); const pat = A[1]?.(); try { return v === null || pat === null ? 0 : new RegExp(String(pat), "i").test(String(v)) ? 1 : 0; } catch { throw new Error("Invalid regular expression in match()."); } }
        case "tonumber": return toNum(A[0]?.());
        case "tostring": { const v = A[0]?.(); return v === null || v === undefined ? null : String(v); }
        default: throw new Error(`Function ${n.fn}() isn't supported in this simulator. Try: if, case, coalesce, round, len, lower, upper, substr, like, match, isnull, isnotnull.`);
      }
    }
  }
}

/* ============================== stats ============================== */
interface Agg { fn: string; field?: string; as: string }

function parseAggs(s: string): Agg[] {
  const out: Agg[] = [];
  const re = /([A-Za-z_]+)(?:\(\s*([^)]*?)\s*\))?(?:\s+as\s+("[^"]+"|[\w.]+))?/gi;
  const cleaned = s.replace(/,/g, " ");
  let m: RegExpExecArray | null;
  while ((m = re.exec(cleaned))) {
    const fn = m[1].toLowerCase();
    const allowed = ["count", "c", "dc", "distinct_count", "sum", "avg", "mean", "min", "max", "values", "list", "earliest", "latest", "first", "last", "range"];
    if (!allowed.includes(fn)) throw new Error(`stats function "${m[1]}" isn't supported. Try count, dc, sum, avg, min, max, values, earliest, latest.`);
    if (m[2] && /eval\s*\(/i.test(m[2])) throw new Error("count(eval(...)) isn't supported here — create a field with | eval first, then use sum().");
    const field = m[2] ? unquote(m[2]) : undefined;
    const norm = fn === "c" ? "count" : fn === "distinct_count" ? "dc" : fn === "mean" ? "avg" : fn;
    out.push({ fn: norm, field, as: m[3] ? unquote(m[3]) : field ? `${m[1]}(${field})` : m[1] });
  }
  if (!out.length) throw new Error("stats needs at least one function, e.g. | stats count by user");
  return out;
}

function splitBy(arg: string): { left: string; by: string[] } {
  const m = /^(.*?)(?:\s+by\s+(.+))?$/is.exec(arg.trim());
  const left = (m?.[1] ?? "").trim();
  const by = m?.[2] ? m[2].split(/[\s,]+/).map((x) => x.trim()).filter(Boolean) : [];
  return { left, by };
}

function computeAgg(a: Agg, rows: Rec[]): Val {
  const vals = a.field ? rows.map((r) => getField(r, a.field!)).filter((v): v is Val => v !== undefined && v !== "") : [];
  const nums = vals.map(toNum).filter((v): v is number => v !== null);
  switch (a.fn) {
    case "count": return a.field ? vals.length : rows.length;
    case "dc": return new Set(vals.map(String)).size;
    case "sum": return fmtNum(nums.reduce((x, y) => x + y, 0));
    case "avg": return nums.length ? fmtNum(nums.reduce((x, y) => x + y, 0) / nums.length) : "";
    case "min": return nums.length ? Math.min(...nums) : vals.length ? [...vals].map(String).sort()[0] : "";
    case "max": return nums.length ? Math.max(...nums) : vals.length ? [...vals].map(String).sort().slice(-1)[0] : "";
    case "range": return nums.length ? Math.max(...nums) - Math.min(...nums) : "";
    case "values": return [...new Set(vals.map(String))].sort().join(", ");
    case "list": return vals.map(String).slice(0, 100).join(", ");
    case "earliest": case "first": {
      const sorted = [...rows].filter((r) => !a.field || getField(r, a.field) !== undefined).sort((x, y) => Number(x._epoch ?? 0) - Number(y._epoch ?? 0));
      const pick = a.fn === "first" ? rows.find((r) => !a.field || getField(r, a.field) !== undefined) : sorted[0];
      return pick ? (a.field ? getField(pick, a.field) ?? "" : String(pick._time ?? "")) : "";
    }
    case "latest": case "last": {
      const sorted = [...rows].filter((r) => !a.field || getField(r, a.field) !== undefined).sort((x, y) => Number(y._epoch ?? 0) - Number(x._epoch ?? 0));
      const withField = rows.filter((r) => !a.field || getField(r, a.field) !== undefined);
      const pick = a.fn === "last" ? withField[withField.length - 1] : sorted[0];
      return pick ? (a.field ? getField(pick, a.field) ?? "" : String(pick._time ?? "")) : "";
    }
  }
  return "";
}

function groupRows(rows: Rec[], by: string[]): { key: Val[]; rows: Rec[] }[] {
  const map = new Map<string, { key: Val[]; rows: Rec[] }>();
  for (const r of rows) {
    const key = by.map((b) => getField(r, b));
    if (key.some((k) => k === undefined || k === "")) continue;
    const id = JSON.stringify(key);
    const g = map.get(id) ?? { key: key as Val[], rows: [] };
    g.rows.push(r); map.set(id, g);
  }
  return [...map.values()];
}

function compareVals(a: Val | undefined, b: Val | undefined): number {
  if (a === undefined && b === undefined) return 0;
  if (a === undefined) return 1; if (b === undefined) return -1;
  const x = toNum(a); const y = toNum(b);
  if (x !== null && y !== null) return x - y;
  return String(a).localeCompare(String(b));
}

function parseSpan(s: string | undefined, fallback = 3600): number {
  if (!s) return fallback;
  const m = /^(\d+)\s*(s|sec|m|min|h|hr|d|day)s?$/i.exec(s);
  if (!m) throw new Error(`Couldn't read span "${s}". Use values like 30s, 1m, 5m, 1h, 1d.`);
  const n = Number(m[1]); const u = m[2].toLowerCase();
  return n * (u.startsWith("s") ? 1 : u.startsWith("m") ? 60 : u.startsWith("h") ? 3600 : 86400);
}

function fmtEpoch(epoch: number): string {
  const d = new Date(epoch * 1000); const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
}

function parseOpts(arg: string): { opts: Record<string, string>; rest: string } {
  const opts: Record<string, string> = {};
  const rest = arg.replace(/\b(\w+)=("[^"]*"|\S+)/g, (_m, k: string, v: string) => { opts[k.toLowerCase()] = unquote(v); return ""; }).trim();
  return { opts, rest };
}

/* ============================== data models (tstats) ============================== */
const DATAMODELS: Record<string, { match: (r: Rec) => boolean; map: Record<string, string> }> = {
  Authentication: {
    match: (r) => [4624, 4625].includes(Number(r.EventCode)) || r.index === "auth" || r.sourcetype === "linux:secure" || r.index === "vpn",
    map: { user: "user", src_ip: "src", dest: "dest", action: "action", app: "app", host: "dest" },
  },
  Network_Traffic: { match: (r) => r.index === "firewall", map: { src_ip: "src", dest_ip: "dest", dest_port: "dest_port", action: "action", app: "app", bytes: "bytes" } },
  Web: { match: (r) => r.index === "proxy" || r.index === "web", map: { user: "user", src_ip: "src", url: "url", status: "status", http_method: "http_method", bytes_out: "bytes_out", category: "category" } },
  Endpoint: { match: (r) => r.index === "sysmon" && Number(r.EventCode) === 1, map: { user: "user", host: "dest", process: "process_name", parent_process: "parent_process_name", CommandLine: "process" } },
  Network_Resolution: { match: (r) => r.index === "dns", map: { src_ip: "src", query: "query", query_type: "record_type", reply_code: "reply_code" } },
};

/* ============================== runner ============================== */
export function eventsToRecords(events: SimEvent[]): Rec[] {
  return events.map((e) => ({
    _time: e.time, _epoch: e.epoch, index: e.index, sourcetype: e.sourcetype, host: e.host, _raw: e.raw, _id: e.id, ...e.fields,
  }));
}

const HIDDEN = new Set(["_epoch", "_id"]);

export interface RunOptions { timeRange?: "all" | "last_15m" | "last_60m" | "last_24h" | "last_7d" | "last_30d" | string }

const RANGE_SECS: Record<string, number> = { last_15m: 900, last_60m: 3600, last_24h: 86400, last_7d: 604800, last_30d: 2592000 };

export function runSpl(spl: string, events: SimEvent[], opts: RunOptions = {}): SplRun {
  const stages: SplStage[] = [];
  const empty = (error: string): SplRun => ({ mode: "events", columns: [], rows: [], eventCount: 0, scanned: 0, stages, error });
  const text = spl.trim();
  if (!text) return empty("Type a search first — for example: index=auth");

  let all = eventsToRecords(events);
  const maxEpoch = all.reduce((m, r) => Math.max(m, Number(r._epoch)), 0);
  const range = opts.timeRange && RANGE_SECS[opts.timeRange];
  if (range) all = all.filter((r) => Number(r._epoch) >= maxEpoch - range);
  const scanned = all.length;

  let segments = splitPipeline(text);
  let rows: Rec[] = [];
  let cols: string[] | null = null;
  let mode: "events" | "table" = "events";
  let eventCount = 0;
  let warning: string | undefined;

  try {
    if (segments[0] === "") segments = segments.slice(1);
    const first = segments[0] ?? "";
    const firstWord = first.split(/\s+/)[0].toLowerCase();

    if (firstWord === "tstats") {
      const r = runTstats(first, all);
      rows = r.rows; cols = r.cols; mode = "table"; eventCount = r.matched;
      stages.push({ command: first, name: "tstats", text: r.text, rowsIn: scanned, rowsOut: rows.length });
      segments = segments.slice(1);
    } else {
      const q = firstWord === "search" ? first.slice(6).trim() : first;
      if (SUPPORTED.includes(firstWord) && firstWord !== "search") throw new Error(`A search must start with search terms such as index=auth, not with "${firstWord}". Put "${firstWord}" after a pipe: index=auth | ${firstWord} ...`);
      const node = parseSearch(q);
      const bounds: { earliest?: string; latest?: string } = {}; collectTimeBounds(node, bounds);
      let pool = all;
      if (bounds.earliest) { const s = relSeconds(bounds.earliest); if (s !== null) pool = pool.filter((r) => Number(r._epoch) >= maxEpoch - s); }
      if (bounds.latest) { const s = relSeconds(bounds.latest); if (s !== null) pool = pool.filter((r) => Number(r._epoch) <= maxEpoch - s); }
      rows = pool.filter((r) => evalSearch(node, r)).sort((a, b) => Number(b._epoch) - Number(a._epoch));
      eventCount = rows.length;
      if (!/index\s*=/i.test(q)) warning = "Tip: start every search with index=<name> so you only scan the logs you need.";
      stages.push({ command: q || "*", name: "search", text: `Scanned ${scanned} events and kept the ${rows.length} where ${describeSearch(node)}. Newest events are listed first.`, rowsIn: scanned, rowsOut: rows.length });
      segments = segments.slice(1);
    }

    for (const seg of segments) {
      if (!seg) throw new Error("There is an empty pipe ( | | ). Remove the extra pipe or add a command after it.");
      const name = seg.split(/\s+/)[0].toLowerCase();
      const arg = seg.slice(name.length).trim();
      const before = rows.length;
      let textOut = "";
      switch (name) {
        case "search": {
          const node = parseSearch(arg);
          rows = rows.filter((r) => evalSearch(node, r));
          textOut = `Filtered again: kept ${rows.length} of ${before} rows where ${describeSearch(node)}.`;
          break;
        }
        case "where": {
          if (!arg) throw new Error("where needs a condition, e.g. | where count > 20");
          const e = parseExpr(arg);
          rows = rows.filter((r) => truthy(evalExpr(e, r)));
          textOut = `Checked "${arg}" on each of the ${before} rows and kept the ${rows.length} where it is true.`;
          break;
        }
        case "stats": {
          const { left, by } = splitBy(arg);
          const aggs = parseAggs(left);
          if (by.length === 0) {
            const r: Rec = {}; for (const a of aggs) r[a.as] = computeAgg(a, rows); rows = [r];
          } else {
            const groups = groupRows(rows, by);
            rows = groups.map((g) => { const r: Rec = {}; by.forEach((b, i) => { r[b] = g.key[i]; }); for (const a of aggs) r[a.as] = computeAgg(a, g.rows); return r; });
            rows.sort((a, b) => { for (const f of by) { const c = compareVals(a[f], b[f]); if (c) return c; } return 0; });
          }
          cols = [...by, ...aggs.map((a) => a.as)]; mode = "table";
          textOut = by.length
            ? `Grouped the ${before} rows by ${by.join(" + ")} and calculated ${aggs.map((a) => a.as).join(", ")} for each group → ${rows.length} row${rows.length === 1 ? "" : "s"} (one per unique ${by.join("/")} combination).`
            : `Calculated ${aggs.map((a) => a.as).join(", ")} across all ${before} rows → a single summary row.`;
          break;
        }
        case "timechart": {
          const { opts: o, rest } = parseOpts(arg);
          const { left, by } = splitBy(rest || "count");
          const aggs = parseAggs(left || "count");
          const span = parseSpan(o.span, 300);
          const buckets = new Map<number, Rec[]>();
          for (const r of rows) { const b = Math.floor(Number(r._epoch) / span) * span; buckets.set(b, [...(buckets.get(b) ?? []), r]); }
          const keys = [...buckets.keys()].sort((a, b) => a - b);
          const out: Rec[] = [];
          if (keys.length) {
            for (let b = keys[0]; b <= keys[keys.length - 1] && out.length < 500; b += span) {
              const inB = buckets.get(b) ?? [];
              const r: Rec = { _time: fmtEpoch(b), _epoch: b };
              if (by.length) {
                for (const g of groupRows(inB, [by[0]])) r[String(g.key[0])] = computeAgg(aggs[0], g.rows);
              } else for (const a of aggs) r[a.as] = computeAgg(a, inB);
              out.push(r);
            }
          }
          let series = aggs.map((a) => a.as);
          if (by.length) {
            const vals = new Set<string>(); groupRows(rows, [by[0]]).forEach((g) => vals.add(String(g.key[0])));
            series = [...vals].slice(0, 10);
            for (const r of out) for (const s of series) if (r[s] === undefined) r[s] = 0;
          }
          rows = out; cols = ["_time", ...series]; mode = "table";
          textOut = `Cut the ${before} rows into ${span >= 60 ? span / 60 + "-minute" : span + "-second"} time buckets and counted ${by.length ? `per ${by[0]}` : "each bucket"} → ${rows.length} buckets.`;
          break;
        }
        case "bin": case "bucket": {
          const { opts: o, rest } = parseOpts(arg);
          const field = rest.split(/\s+/)[0] || "_time";
          const span = parseSpan(o.span, 300);
          rows = rows.map((r) => {
            if (field === "_time") { const b = Math.floor(Number(r._epoch) / span) * span; return { ...r, _time: fmtEpoch(b), _epoch: b }; }
            const v = toNum(getField(r, field)); if (v === null) return r;
            const b = Math.floor(v / span) * span; return { ...r, [fieldKey(r, field)]: `${b}-${b + span}` };
          });
          textOut = `Rounded ${field} down into buckets of ${o.span ?? "5m"} so rows in the same window share one value.`;
          break;
        }
        case "table": {
          const fields = arg.split(/[\s,]+/).filter(Boolean);
          if (!fields.length) throw new Error("table needs field names, e.g. | table _time user src_ip");
          const avail = new Set<string>(); rows.forEach((r) => Object.keys(r).forEach((k) => avail.add(k)));
          const expanded: string[] = [];
          for (const f of fields) {
            if (f.includes("*")) { const re = wildcardToRegex(f, true); [...avail].filter((k) => re.test(k) && !HIDDEN.has(k)).forEach((k) => expanded.push(k)); }
            else expanded.push([...avail].find((k) => k.toLowerCase() === f.toLowerCase()) ?? f);
          }
          cols = [...new Set(expanded)]; mode = "table";
          const missing = cols.filter((c) => !avail.has(c));
          textOut = `Kept only the columns ${cols.join(", ")} for all ${rows.length} rows.${missing.length ? ` Note: ${missing.join(", ")} ${missing.length === 1 ? "doesn't" : "don't"} exist in these results, so ${missing.length === 1 ? "it shows" : "they show"} blank.` : ""}`;
          break;
        }
        case "fields": {
          const minus = arg.startsWith("-"); const list = arg.replace(/^[+-]/, "").split(/[\s,]+/).filter(Boolean);
          if (!list.length) throw new Error("fields needs field names, e.g. | fields user src_ip");
          const res = list.map((f) => wildcardToRegex(f, true));
          if (minus) {
            rows = rows.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => !res.some((re) => re.test(k)))));
            if (cols) cols = cols.filter((c) => !res.some((re) => re.test(c)));
            textOut = `Removed ${list.join(", ")} from the results.`;
          } else {
            rows = rows.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => k === "_epoch" || res.some((re) => re.test(k)))));
            if (mode === "table") cols = list; else { cols = list; mode = "table"; }
            textOut = `Kept only ${list.join(", ")}.`;
          }
          break;
        }
        case "sort": {
          let toks = arg.split(/[\s,]+/).filter(Boolean);
          let limit: number | undefined;
          if (toks[0] && /^\d+$/.test(toks[0])) { limit = Number(toks[0]); toks = toks.slice(1); }
          let reverseAll = false;
          if (toks.length && ["d", "desc"].includes(toks[toks.length - 1].toLowerCase())) { reverseAll = true; toks = toks.slice(0, -1); }
          const keys: { f: string; desc: boolean }[] = [];
          let pending: boolean | null = null;
          for (const t of toks) {
            if (t === "-" || t === "+") { pending = t === "-"; continue; }
            const desc = t.startsWith("-") ? true : t.startsWith("+") ? false : pending ?? false;
            keys.push({ f: t.replace(/^[+-]/, ""), desc: reverseAll ? !desc : desc }); pending = null;
          }
          if (!keys.length) throw new Error("sort needs a field, e.g. | sort - count");
          rows = [...rows].sort((a, b) => { for (const k of keys) { const c = compareVals(getField(a, k.f), getField(b, k.f)); if (c) return k.desc ? -c : c; } return 0; });
          if (limit) rows = rows.slice(0, limit);
          textOut = `Ordered the ${rows.length} rows by ${keys.map((k) => `${k.f} (${k.desc ? "largest first" : "smallest first"})`).join(", then ")}.`;
          break;
        }
        case "dedup": {
          let toks = arg.split(/[\s,]+/).filter(Boolean);
          let keep = 1; if (toks[0] && /^\d+$/.test(toks[0])) { keep = Number(toks[0]); toks = toks.slice(1); }
          const sb = toks.findIndex((t) => t.toLowerCase() === "sortby"); if (sb >= 0) toks = toks.slice(0, sb);
          if (!toks.length) throw new Error("dedup needs a field, e.g. | dedup user");
          const seen = new Map<string, number>();
          rows = rows.filter((r) => { const vals = toks.map((f) => getField(r, f)); if (vals.some((v) => v === undefined)) return false; const k = JSON.stringify(vals); const n = (seen.get(k) ?? 0) + 1; seen.set(k, n); return n <= keep; });
          textOut = `Removed duplicates: kept the first (newest) row for each unique ${toks.join(" + ")} → ${rows.length} of ${before} rows.`;
          break;
        }
        case "head": case "tail": {
          const { opts: o, rest } = parseOpts(arg);
          const n = Number(rest || o.limit || 10);
          if (!Number.isFinite(n) || n < 0) throw new Error(`${name} needs a number, e.g. | ${name} 5`);
          rows = name === "head" ? rows.slice(0, n) : rows.slice(-n);
          textOut = `Kept the ${name === "head" ? "first" : "last"} ${Math.min(n, before)} of ${before} rows.`;
          break;
        }
        case "rename": {
          const pairs = splitTop(arg, ",").map((p) => p.trim()).filter(Boolean);
          const done: string[] = [];
          for (const p of pairs) {
            const m = /^("[^"]+"|\S+)\s+as\s+("[^"]+"|\S+)$/i.exec(p);
            if (!m) throw new Error(`Couldn't read "${p}". Use: | rename old as new`);
            const from = unquote(m[1]); const to = unquote(m[2]);
            rows = rows.map((r) => { const k = fieldKey(r, from); if (!(k in r)) return r; const { [k]: v, ...rest2 } = r; return { ...rest2, [to]: v }; });
            if (cols) cols = cols.map((c) => (c.toLowerCase() === from.toLowerCase() ? to : c));
            done.push(`${from} → ${to}`);
          }
          textOut = `Renamed ${done.join(", ")}.`;
          break;
        }
        case "eval": {
          const parts = splitTop(arg, ",").map((p) => p.trim()).filter(Boolean);
          if (!parts.length) throw new Error("eval needs an assignment, e.g. | eval kb=bytes/1024");
          const assigns = parts.map((p) => {
            const m = /^([A-Za-z_][\w.]*|"[^"]+")\s*=(?!=)\s*(.+)$/s.exec(p);
            if (!m) throw new Error(`Couldn't read "${p}". eval needs name=expression.`);
            return { name: unquote(m[1]), expr: parseExpr(m[2]), src: m[2] };
          });
          rows = rows.map((r) => { const o2 = { ...r }; for (const a of assigns) { const v = evalExpr(a.expr, o2); if (v === null) delete o2[a.name]; else o2[a.name] = typeof v === "number" ? fmtNum(v) : v; } return o2; });
          if (cols) for (const a of assigns) if (!cols.includes(a.name)) cols = [...cols, a.name];
          textOut = `Calculated ${assigns.map((a) => `${a.name} = ${a.src}`).join("; ")} for each of the ${rows.length} rows.`;
          break;
        }
        case "top": case "rare": {
          const { opts: o, rest } = parseOpts(arg);
          const { left, by } = splitBy(rest);
          const fields = left.split(/[\s,]+/).filter(Boolean);
          if (!fields.length) throw new Error(`${name} needs a field, e.g. | ${name} src_ip`);
          const limit = Number(o.limit ?? 10);
          const outer = by.length ? groupRows(rows, by) : [{ key: [] as Val[], rows }];
          const out: Rec[] = [];
          for (const g of outer) {
            const groups = groupRows(g.rows, fields).map((x) => ({ x, count: x.rows.length }));
            groups.sort((a, b) => (name === "top" ? b.count - a.count : a.count - b.count));
            for (const { x, count } of groups.slice(0, limit)) {
              const r: Rec = {}; by.forEach((b, i) => { r[b] = g.key[i]; }); fields.forEach((f, i) => { r[f] = x.key[i]; });
              r.count = count; r.percent = fmtNum((count / Math.max(1, g.rows.length)) * 100); out.push(r);
            }
          }
          rows = out; cols = [...by, ...fields, "count", "percent"]; mode = "table";
          textOut = `Counted how often each ${fields.join(" + ")} appears in ${before} rows and listed the ${name === "top" ? "most" : "least"} common ${Math.min(limit, rows.length)}.`;
          break;
        }
        case "rex": {
          const { opts: o, rest } = parseOpts(arg);
          const field = o.field ?? "_raw";
          const pat = unquote(rest);
          let re: RegExp; try { re = new RegExp(pat, "i"); } catch { throw new Error("That regular expression isn't valid."); }
          if (!/\(\?<\w+>/.test(pat)) throw new Error('rex needs a named group, e.g. | rex field=url "https?://(?<domain>[^/]+)"');
          let hits = 0;
          rows = rows.map((r) => { const v = getField(r, field); const m = v === undefined ? null : re.exec(String(v)); if (!m?.groups) return r; hits++; return { ...r, ...m.groups }; });
          textOut = `Applied the pattern to ${field} and extracted ${Object.keys(re.exec("") ?? {}).length ? "" : ""}new field(s) on ${hits} of ${before} rows.`;
          break;
        }
        case "fillnull": {
          const { opts: o, rest } = parseOpts(arg);
          const value = o.value ?? "0";
          const fields = rest.split(/[\s,]+/).filter(Boolean);
          const targets = fields.length ? fields : cols ?? [];
          rows = rows.map((r) => { const o2 = { ...r }; for (const f of targets) if (o2[f] === undefined || o2[f] === "") o2[f] = toNum(value) ?? value; return o2; });
          textOut = `Filled empty ${targets.length ? targets.join(", ") : "fields"} with ${value}.`;
          break;
        }
        case "tstats": throw new Error("tstats must be the first command, written as: | tstats count from datamodel=Authentication by Authentication.user");
        default: {
          const s = suggest(name);
          throw new Error(`"${name}" isn't a command this simulator knows.${s ? ` Did you mean "${s}"?` : ""} Supported: ${SUPPORTED.filter((x) => x !== "bucket").join(", ")}.`);
        }
      }
      stages.push({ command: seg, name, text: textOut, rowsIn: before, rowsOut: rows.length });
    }
  } catch (e) {
    return { mode, columns: [], rows: [], eventCount, scanned, stages, error: e instanceof Error ? e.message : String(e) };
  }

  let columns: string[];
  if (mode === "table" && cols) columns = cols;
  else columns = ["_time", "host", "sourcetype", "_raw"];
  return { mode, columns, rows, eventCount, scanned, stages, warning };
}

function runTstats(seg: string, all: Rec[]): { rows: Rec[]; cols: string[]; matched: number; text: string } {
  const m = /^tstats\s+(.*?)\s+from\s+datamodel\s*=\s*([\w]+)(?:\.[\w]+)?(?:\s+where\s+(.*?))?(?:\s+by\s+(.+))?$/is.exec(seg.trim());
  if (!m) throw new Error("Couldn't read tstats. Use: | tstats count from datamodel=Authentication where Authentication.action=failure by Authentication.user");
  const dmName = Object.keys(DATAMODELS).find((k) => k.toLowerCase() === m[2].toLowerCase());
  if (!dmName) throw new Error(`Data model "${m[2]}" isn't in this simulator. Try: ${Object.keys(DATAMODELS).join(", ")}.`);
  const dm = DATAMODELS[dmName];
  let rows: Rec[] = all.filter(dm.match).map((r) => {
    const o: Rec = { _time: r._time, _epoch: r._epoch };
    for (const [src, dst] of Object.entries(dm.map)) { const v = getField(r, src); if (v !== undefined) o[`${dmName}.${dst}`] = v; }
    return o;
  });
  if (m[3]) { const node = parseSearch(m[3]); rows = rows.filter((r) => evalSearch(node, r)); }
  const matched = rows.length;
  const aggs = parseAggs(m[1]);
  const by = m[4] ? m[4].split(/[\s,]+/).filter(Boolean) : [];
  let out: Rec[];
  if (by.length) {
    out = groupRows(rows, by).map((g) => { const r: Rec = {}; by.forEach((b, i) => { r[b] = g.key[i]; }); for (const a of aggs) r[a.as] = computeAgg(a, g.rows); return r; });
    out.sort((a, b) => { for (const f of by) { const c = compareVals(a[f], b[f]); if (c) return c; } return 0; });
  } else { const r: Rec = {}; for (const a of aggs) r[a.as] = computeAgg(a, rows); out = [r]; }
  return { rows: out, cols: [...by, ...aggs.map((a) => a.as)], matched, text: `Read the ${dmName} data model (${matched} normalised records${m[3] ? " after the where filter" : ""}) and calculated ${aggs.map((a) => a.as).join(", ")}${by.length ? ` by ${by.join(", ")}` : ""} → ${out.length} rows.` };
}

/* ============================== static explanation (no data) ============================== */
export function explainPipeline(spl: string): { command: string; name: string; doc?: CommandDoc }[] {
  const segs = splitPipeline(spl.trim()).filter((s, i) => s || i > 0).filter(Boolean);
  return segs.map((seg, i) => {
    const w = seg.split(/\s+/)[0].toLowerCase();
    const name = i === 0 && w !== "tstats" ? "search" : w;
    return { command: seg, name, doc: COMMAND_DOCS[name] };
  });
}

/* ============================== exercise validation ============================== */
export function validateExercise(ex: SplExercise, spl: string, run: SplRun): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (run.error) return { ok: false, reasons: [run.error] };
  const norm = spl.toLowerCase().replace(/\s+/g, " ").replace(/\s*\|\s*/g, " | ").replace(/\s*=\s*/g, "=");
  for (const s of ex.validate.mustContain ?? []) {
    const want = s.toLowerCase().replace(/\s+/g, " ").replace(/\s*\|\s*/g, " | ").replace(/\s*=\s*/g, "=");
    if (!norm.includes(want)) reasons.push(`Your search should include "${s}".`);
  }
  if (ex.validate.minRows !== undefined && run.rows.length < ex.validate.minRows) reasons.push(`Expected at least ${ex.validate.minRows} result rows, got ${run.rows.length}.`);
  if (ex.validate.maxRows !== undefined && run.rows.length > ex.validate.maxRows) reasons.push(`Expected at most ${ex.validate.maxRows} result rows, got ${run.rows.length}.`);
  for (const c of ex.validate.mustProduceCols ?? []) {
    if (!run.columns.some((x) => x.toLowerCase() === c.toLowerCase())) reasons.push(`Results should have a "${c}" column.`);
  }
  return { ok: reasons.length === 0, reasons };
}

export function displayValue(v: Val | undefined): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "number") return v.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return String(v);
}

export function visibleColumns(run: SplRun): string[] {
  return run.columns.filter((c) => !HIDDEN.has(c));
}
