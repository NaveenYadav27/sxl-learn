/**
 * Deterministic scenario builder — compact helpers so each scenario reads like an attack story.
 * Every scenario is pure data: same input → same events, so labs and grading are reproducible.
 */
import type { SimEvent } from "../../types";

type FieldMap = Record<string, string | number>;
type Risk = SimEvent["risk"];

export function toEpoch(time: string): number {
  // "2026-05-07 09:12:04" → seconds since epoch (UTC)
  const [d, t] = time.split(" ");
  const [y, m, day] = d.split("-").map(Number);
  const [hh, mm, ss] = t.split(":").map(Number);
  return Math.floor(Date.UTC(y, m - 1, day, hh, mm, ss ?? 0) / 1000);
}

export function fromEpoch(epoch: number): string {
  const d = new Date(epoch * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
}

export function addSeconds(time: string, secs: number): string {
  return fromEpoch(toEpoch(time) + secs);
}

function autoRaw(time: string, host: string, fields: FieldMap): string {
  const kv = Object.entries(fields)
    .map(([k, v]) => (typeof v === "string" && /\s/.test(v) ? `${k}="${v}"` : `${k}=${v}`))
    .join(" ");
  return `${time} host=${host} ${kv}`;
}

export interface EventSpec {
  time: string;
  index: string;
  sourcetype: string;
  host: string;
  fields: FieldMap;
  raw?: string;
  mitre?: string[];
  risk?: Risk;
}

/** Builds events with stable ids `${prefix}-NNN` in insertion order, then returns them time-sorted. */
export class ScenarioEvents {
  private list: SimEvent[] = [];
  private n = 0;
  constructor(private prefix: string) {}

  add(spec: EventSpec): string {
    this.n += 1;
    const id = `${this.prefix}-${String(this.n).padStart(3, "0")}`;
    this.list.push({
      id,
      time: spec.time,
      epoch: toEpoch(spec.time),
      index: spec.index,
      sourcetype: spec.sourcetype,
      host: spec.host,
      fields: spec.fields,
      raw: spec.raw ?? autoRaw(spec.time, spec.host, spec.fields),
      mitre: spec.mitre,
      risk: spec.risk,
    });
    return id;
  }

  /** Add the same event shape repeatedly, `every` seconds apart. Returns all ids. */
  repeat(count: number, start: string, every: number, make: (i: number, time: string) => Omit<EventSpec, "time">): string[] {
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      const time = addSeconds(start, Math.round(i * every));
      ids.push(this.add({ time, ...make(i, time) }));
    }
    return ids;
  }

  all(): SimEvent[] {
    return [...this.list].sort((a, b) => a.epoch - b.epoch || a.id.localeCompare(b.id));
  }
}

/* ---------- Deterministic benign background noise ---------- */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const BENIGN_DOMAINS = ["login.microsoftonline.com", "outlook.office365.com", "www.google.com", "github.com", "slack.com", "zoom.us", "cdn.jsdelivr.net", "update.microsoft.com"];
const BENIGN_URLS = ["https://outlook.office365.com/mail", "https://github.com/shadowx/app", "https://slack.com/api/rtm.connect", "https://intranet.corp.local/hr", "https://www.google.com/search"];

export interface NoiseOptions {
  start: string;
  minutes: number;
  count: number;
  seed: number;
  users: { user: string; host: string; ip: string }[];
  dc?: string;
}

/** Normal Monday-morning traffic: successful logons, DNS lookups, web browsing, allowed firewall flows. */
export function addNoise(ev: ScenarioEvents, o: NoiseOptions) {
  const rnd = lcg(o.seed);
  const dc = o.dc ?? "dc01";
  for (let i = 0; i < o.count; i++) {
    const u = o.users[Math.floor(rnd() * o.users.length)];
    const time = addSeconds(o.start, Math.floor(rnd() * o.minutes * 60));
    const kind = Math.floor(rnd() * 4);
    if (kind === 0) {
      ev.add({ time, index: "wineventlog", sourcetype: "WinEventLog:Security", host: dc,
        fields: { EventCode: 4624, action: "success", user: u.user, src_ip: u.ip, dest: dc, Logon_Type: 3, app: "win:remote" } });
    } else if (kind === 1) {
      const q = BENIGN_DOMAINS[Math.floor(rnd() * BENIGN_DOMAINS.length)];
      ev.add({ time, index: "dns", sourcetype: "stream:dns", host: "dns01",
        fields: { src_ip: u.ip, src_host: u.host, query: q, query_type: "A", reply_code: "NOERROR", query_length: q.length } });
    } else if (kind === 2) {
      const url = BENIGN_URLS[Math.floor(rnd() * BENIGN_URLS.length)];
      ev.add({ time, index: "proxy", sourcetype: "bluecoat:proxysg", host: "proxy01",
        fields: { user: u.user, src_ip: u.ip, url, http_method: "GET", status: 200, bytes_out: 400 + Math.floor(rnd() * 2400), bytes_in: 8000 + Math.floor(rnd() * 90000), category: "Business" } });
    } else {
      ev.add({ time, index: "firewall", sourcetype: "pan:traffic", host: "fw-edge-01",
        fields: { src_ip: u.ip, dest_ip: "52.96.0." + (10 + Math.floor(rnd() * 200)), dest_port: 443, action: "allowed", app: "ssl", bytes: 2000 + Math.floor(rnd() * 50000) } });
    }
  }
}

export const STANDARD_USERS = [
  { user: "j.doe", host: "ws-fin-12", ip: "10.0.4.12" },
  { user: "a.kumar", host: "ws-hr-07", ip: "10.0.3.7" },
  { user: "m.lee", host: "ws-eng-04", ip: "10.0.4.21" },
  { user: "r.patel", host: "ws-sales-02", ip: "10.0.6.2" },
  { user: "l.chen", host: "ws-rnd-02", ip: "10.0.7.2" },
  { user: "s.okafor", host: "ws-mkt-11", ip: "10.0.5.11" },
];
