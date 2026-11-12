import type { Scenario } from "../../types";
import { ScenarioEvents, addNoise, STANDARD_USERS } from "./builder";

/** Scenario 8 — departing employee mass-downloads and uploads to personal cloud (intermediate). */
function build(): Scenario {
  const ev = new ScenarioEvents("IN");
  addNoise(ev, { start: "2026-05-07 21:30:00", minutes: 90, count: 40, seed: 88, users: STANDARD_USERS });

  const hr = ev.add({ time: "2026-05-06 17:00:00", index: "hr", sourcetype: "workday:events", host: "workday",
    fields: { user: "r.patel", event: "resignation_submitted", last_day: "2026-05-20", department: "Sales" },
    risk: { object: "r.patel", objectType: "user", score: 10, rule: "Identity - User On Departing Watchlist" } });
  const dls = ev.repeat(24, "2026-05-07 22:40:00", 30, (i) => ({ index: "cloud", sourcetype: "o365:management:activity", host: "sharepoint",
    fields: { user: "r.patel", Operation: "FileDownloaded", site: "Sales-Strategy", file_name: `Customer_Pricing_${2020 + (i % 6)}_${i}.xlsx`, src_ip: "10.0.6.2", files: 95 + (i % 5) },
    mitre: ["T1005"], risk: i === 10 ? { object: "r.patel", objectType: "user", score: 50, rule: "Cloud - Abnormal File Download Volume" } : undefined }));
  const zip = ev.add({ time: "2026-05-07 22:55:10", index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "ws-sales-02",
    fields: { EventCode: 1, user: "r.patel", process: "7z.exe", CommandLine: "7z.exe a -pSales2026 C:\\Users\\r.patel\\Desktop\\personal.7z C:\\Users\\r.patel\\Downloads\\*", parent_process: "explorer.exe" },
    mitre: ["T1005"], risk: { object: "r.patel", objectType: "user", score: 30, rule: "Endpoint - Password-Protected Archive Created" } });
  const ups = ev.repeat(6, "2026-05-07 23:01:00", 45, (i) => ({ index: "proxy", sourcetype: "bluecoat:proxysg", host: "proxy01",
    fields: { user: "r.patel", src_ip: "10.0.6.2", url: "https://content.dropboxapi.com/2/files/upload", http_method: "POST", status: 200, bytes_out: 700_000_000 + i * 15_000_000, bytes_in: 1200, category: "Personal Storage" },
    mitre: ["T1567.002"], risk: i === 2 ? { object: "r.patel", objectType: "user", score: 70, rule: "Network - Large Upload To Personal Cloud" } : undefined }));
  // Benign: a colleague downloads a handful of files during the day
  ev.repeat(3, "2026-05-07 14:10:00", 300, () => ({ index: "cloud", sourcetype: "o365:management:activity", host: "sharepoint",
    fields: { user: "s.okafor", Operation: "FileDownloaded", site: "Marketing", file_name: "Brand_Guide.pdf", src_ip: "10.0.5.11", files: 1 } }));
  const usb = ev.add({ time: "2026-05-07 23:10:00", index: "edr", sourcetype: "crowdstrike:events", host: "ws-sales-02",
    fields: { user: "r.patel", event: "RemovableMediaMounted", device: "SanDisk Ultra 128GB", severity: "low" } });

  return {
    id: "insider-exfil",
    name: "Insider Data Theft Before Resignation",
    tagline: "2,300 pricing files, a password-protected zip and a personal Dropbox.",
    difficulty: "intermediate",
    attackStory: [
      "r.patel submits a resignation on May 6 — HR adds her to the departing-employee watchlist.",
      "At 22:40 the next evening she downloads ~2,300 files from the Sales-Strategy SharePoint site.",
      "She bundles them into a password-protected 7z archive on her desktop.",
      "Between 23:01 and 23:05 she uploads ~4.4 GB to Dropbox, then plugs in a USB drive.",
    ],
    events: ev.all(),
    notables: [{
      id: "ACAD-NOT-8001", title: "Risk - r.patel Risk Threshold Exceeded (Insider)", urgency: "high", rule: "Risk - Threshold Exceeded", entity: "r.patel",
      description: "Departing user + abnormal downloads + encrypted archive + large personal-cloud upload.", eventIds: [dls[0], zip, ups[0]],
      recommendedActions: ["Engage HR and Legal before contacting the user", "Preserve evidence with chain of custody", "Suspend r.patel's cloud sessions", "Request Dropbox takedown via Legal"],
    }],
    intel: [],
    entities: [
      { type: "user", value: "r.patel", role: "suspicious", note: "Departing sales employee — the insider." },
      { type: "host", value: "ws-sales-02", role: "asset", note: "Her workstation (evidence source)." },
      { type: "domain", value: "content.dropboxapi.com", role: "suspicious", note: "Personal cloud upload destination." },
      { type: "user", value: "s.okafor", role: "benign", note: "Normal single-file downloads during business hours." },
    ],
    mitreMap: [
      { techniqueId: "T1005", evidence: "Bulk SharePoint downloads + 7z archive.", eventIds: [dls[0], zip] },
      { techniqueId: "T1567.002", evidence: "~4.4 GB POSTs to the Dropbox upload API.", eventIds: ups.slice(0, 2) },
    ],
    timeline: [
      { phase: "Motive", tacticId: "TA0043", summary: "Resignation submitted.", eventIds: [hr] },
      { phase: "Collection", tacticId: "TA0009", summary: "Bulk downloads + archive.", eventIds: [dls[0], zip] },
      { phase: "Exfiltration", tacticId: "TA0010", summary: "Dropbox uploads, USB mounted.", eventIds: [ups[0], usb] },
    ],
    patientZero: { entity: "r.patel", explanation: "This is an insider case — the user herself is the origin; there is no external attacker." },
  };
}

export const INSIDER_EXFIL = build();
