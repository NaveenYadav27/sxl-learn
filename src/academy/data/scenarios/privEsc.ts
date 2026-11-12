import type { Scenario } from "../../types";
import { ScenarioEvents, addNoise, STANDARD_USERS } from "./builder";

/** Scenario 5 — web shell on Linux → SUID abuse → root → backdoor account (intermediate). */
function build(): Scenario {
  const ev = new ScenarioEvents("PE");
  addNoise(ev, { start: "2026-05-07 11:00:00", minutes: 40, count: 50, seed: 55, users: STANDARD_USERS });
  const L = (time: string, fields: Record<string, string | number>, mitre?: string[], risk?: { object: string; objectType: "user" | "system"; score: number; rule: string }) =>
    ev.add({ time, index: "linux_secure", sourcetype: "linux:audit", host: "app-srv-03", fields, mitre, risk });

  const web = ev.add({ time: "2026-05-07 11:04:10", index: "web", sourcetype: "access_combined", host: "app-srv-03",
    fields: { src_ip: "45.155.205.12", http_method: "POST", uri: "/uploads/img_2231.php", status: 200, useragent: "curl/8.1", bytes_in: 912 },
    mitre: ["T1059"] });
  const id = L("2026-05-07 11:04:12", { user: "www-data", uid: 33, process: "sh", CommandLine: "sh -c id; uname -a", parent_process: "php-fpm" }, ["T1059"],
    { object: "app-srv-03", objectType: "system", score: 40, rule: "Linux - Web Server Spawning Shell" });
  const sudoFail = ev.repeat(3, "2026-05-07 11:05:01", 4, () => ({ index: "linux_secure", sourcetype: "linux:secure", host: "app-srv-03",
    fields: { user: "www-data", process: "sudo", action: "failure", CommandLine: "sudo -l", message: "user NOT in sudoers" } }));
  const suid = L("2026-05-07 11:06:30", { user: "www-data", uid: 33, process: "find", CommandLine: "find / -perm -4000 -type f 2>/dev/null" }, ["T1548"]);
  const root = L("2026-05-07 11:07:15", { user: "root", uid: 0, auid: 33, process: "bash", CommandLine: "/usr/bin/find . -exec /bin/bash -p \\; -quit", parent_process: "find" }, ["T1548"],
    { object: "app-srv-03", objectType: "system", score: 80, rule: "Linux - SUID Binary Used To Spawn Root Shell" });
  const add = L("2026-05-07 11:08:02", { user: "root", uid: 0, auid: 33, process: "useradd", CommandLine: "useradd -m -s /bin/bash -G sudo sysbackup", new_user: "sysbackup" }, ["T1136.001"],
    { object: "app-srv-03", objectType: "system", score: 50, rule: "Linux - Account Created With Sudo Group" });
  const ssh = ev.add({ time: "2026-05-07 11:21:44", index: "linux_secure", sourcetype: "linux:secure", host: "app-srv-03",
    fields: { user: "sysbackup", process: "sshd", action: "success", src_ip: "45.155.205.12", message: "Accepted password for sysbackup" },
    mitre: ["T1078"], risk: { object: "sysbackup", objectType: "user", score: 40, rule: "Linux - New Account External SSH" } });
  // Benign admin sudo
  ev.add({ time: "2026-05-07 11:15:00", index: "linux_secure", sourcetype: "linux:secure", host: "app-srv-03",
    fields: { user: "ops.admin", process: "sudo", action: "success", CommandLine: "sudo systemctl restart nginx", message: "COMMAND=/usr/bin/systemctl restart nginx" } });

  return {
    id: "priv-esc",
    name: "Linux Web Shell → Root Privilege Escalation",
    tagline: "From the web user to root in three minutes.",
    difficulty: "intermediate",
    attackStory: [
      "An attacker uploads a PHP web shell (img_2231.php) and runs commands as www-data.",
      "sudo is denied, so they search for SUID binaries with find -perm -4000.",
      "/usr/bin/find has the SUID bit — they abuse it to spawn a root shell (auid 33 shows the real origin).",
      "As root they create a backdoor account 'sysbackup' in the sudo group and SSH back in from outside.",
    ],
    events: ev.all(),
    notables: [{
      id: "ACAD-NOT-5001", title: "Linux - Root Shell Spawned via SUID Binary (app-srv-03)", urgency: "critical", rule: "Linux - SUID Abuse", entity: "app-srv-03",
      description: "find executed /bin/bash -p as uid 0 with audit uid 33 (www-data).", eventIds: [suid, root],
      recommendedActions: ["Isolate app-srv-03", "Remove the web shell and sysbackup account", "Remove SUID bit from /usr/bin/find", "Rotate credentials stored on the server"],
    }],
    intel: [{ indicator: "45.155.205.12", type: "ip", threat: "Web exploitation scanner / bulletproof hosting", source: "AbuseIPDB", confidence: 83, eventIds: [web, ssh] }],
    entities: [
      { type: "host", value: "app-srv-03", role: "compromised", note: "Linux web server." },
      { type: "user", value: "www-data", role: "compromised", note: "Web server account the shell ran as." },
      { type: "user", value: "sysbackup", role: "attacker", note: "Backdoor account created as root." },
      { type: "ip", value: "45.155.205.12", role: "attacker", note: "Uploaded the shell and later SSH'd in." },
      { type: "user", value: "ops.admin", role: "benign", note: "Normal sudo to restart nginx." },
    ],
    mitreMap: [
      { techniqueId: "T1059", evidence: "php-fpm spawning sh -c id; uname -a.", eventIds: [web, id] },
      { techniqueId: "T1548", evidence: "SUID find used to spawn bash -p as root.", eventIds: [suid, root] },
      { techniqueId: "T1136.001", evidence: "useradd sysbackup -G sudo as root.", eventIds: [add] },
      { techniqueId: "T1078", evidence: "External SSH login with the new account.", eventIds: [ssh] },
    ],
    timeline: [
      { phase: "Web shell used", tacticId: "TA0002", summary: "Commands as www-data.", eventIds: [web, id] },
      { phase: "Tries sudo", tacticId: "TA0007", summary: "sudo -l denied, SUID search.", eventIds: [...sudoFail, suid] },
      { phase: "Becomes root", tacticId: "TA0004", summary: "SUID find → root shell.", eventIds: [root] },
      { phase: "Backdoor account", tacticId: "TA0003", summary: "sysbackup created + SSH.", eventIds: [add, ssh] },
    ],
    patientZero: { entity: "app-srv-03", explanation: "The intrusion started with the web shell upload on app-srv-03." },
  };
}

export const PRIV_ESC = build();
