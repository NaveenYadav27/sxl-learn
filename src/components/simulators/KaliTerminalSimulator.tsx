/**
 * KaliTerminalSimulator — terminal twin used by all PEN-200 / OSCP+ labs.
 *
 * Mimics a real Kali Linux pentest terminal (zsh prompt, command history,
 * realistic tool output) and validates lab steps using the same
 * expected_action contract as the other simulators:
 *
 *   { type: "command", contains: "nmap -sV"  }      // user must run a command containing this string
 *   { type: "command", equals:   "id"        }      // exact match
 *   { type: "answer",  value:    "krbtgt"    }      // last argument / answer captured
 *   { type: "any" }                                  // free exploration — auto-completes
 *
 * Recognised tools: nmap, gobuster, ffuf, sqlmap, hydra, hashcat, msfconsole,
 * smbclient, enum4linux, searchsploit, whoami, id, ls, cat, ssh, mimikatz,
 * bloodhound-python, GetUserSPNs.py, secretsdump.py, evil-winrm, linpeas,
 * winpeas, find, sudo. Everything else returns a generic "command not found
 * (simulated)" notice but still validates if it matches expected_action.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Skull, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

interface Action {
  type?: string;
  contains?: string;
  equals?: string;
  value?: string;
  [key: string]: any;
}

interface Props {
  expectedAction: Action;
  onValidate: (ok: boolean) => void;
}

type Line = { kind: "prompt" | "stdout" | "ok" | "err" | "info"; text: string };

const PROMPT = "┌──(kali㉿shadowx)-[~]\n└─$ ";

// ------------------------------------------------------------------
// Realistic tool output snippets
// ------------------------------------------------------------------
function runCommand(cmd: string): Line[] {
  const c = cmd.trim();
  const lc = c.toLowerCase();
  const out: Line[] = [];
  const push = (text: string, kind: Line["kind"] = "stdout") => out.push({ kind, text });

  if (!c) return out;

  if (lc.startsWith("clear")) return [];

  if (lc === "id" || lc === "whoami") {
    push("uid=1000(kali) gid=1000(kali) groups=1000(kali),27(sudo)");
    return out;
  }
  if (lc.startsWith("ls")) {
    push("exploit.py  loot/  nmap/  notes.md  rockyou.txt  shell.elf");
    return out;
  }
  if (lc.startsWith("cat /etc/passwd")) {
    push("root:x:0:0:root:/root:/bin/bash");
    push("daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin");
    push("kali:x:1000:1000:Kali,,,:/home/kali:/usr/bin/zsh");
    push("oscp:x:1001:1001::/home/oscp:/bin/bash");
    return out;
  }
  if (lc.startsWith("nmap")) {
    push("Starting Nmap 7.94 ( https://nmap.org )", "info");
    push("Nmap scan report for 10.10.11.42");
    push("Host is up (0.012s latency).");
    push("PORT     STATE SERVICE       VERSION");
    push("22/tcp   open  ssh           OpenSSH 8.4p1 Debian");
    push("80/tcp   open  http          Apache httpd 2.4.52");
    push("139/tcp  open  netbios-ssn   Samba smbd 4.6.2");
    push("445/tcp  open  microsoft-ds  Samba smbd 4.6.2");
    push("3306/tcp open  mysql         MySQL 5.7.39");
    push("Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel");
    push("Nmap done: 1 IP address (1 host up) scanned in 11.32 seconds", "info");
    return out;
  }
  if (lc.startsWith("gobuster") || lc.startsWith("ffuf")) {
    push("===============================================================");
    push("Gobuster v3.6 — directory bruteforce");
    push("===============================================================");
    push("/index.php             (Status: 200) [Size: 1834]");
    push("/login.php             (Status: 200) [Size:  812]");
    push("/admin                 (Status: 301) [Size:  178]");
    push("/uploads               (Status: 301) [Size:  178]");
    push("/backup                (Status: 403) [Size:  279]");
    push("/robots.txt            (Status: 200) [Size:   42]");
    push("Finished — 4 directories worth investigating.", "info");
    return out;
  }
  if (lc.startsWith("smbclient") || lc.includes("smbmap") || lc.startsWith("enum4linux")) {
    push("Anonymous login successful");
    push("        Sharename       Type      Comment");
    push("        ---------       ----      -------");
    push("        print$          Disk      Printer Drivers");
    push("        backups         Disk      Nightly DB dumps  <-- READABLE");
    push("        IPC$            IPC       IPC Service");
    push("[+] Found cleartext password in backups/db.bak: 'P@ssw0rd2024!'", "ok");
    return out;
  }
  if (lc.startsWith("sqlmap")) {
    push("        ___");
    push("       __H__");
    push(" ___ ___[)]_____ ___ ___  {1.7.10}");
    push("|_ -| . [(]     | .'| . |");
    push("|___|_  [)]_|_|_|__,|  _|");
    push("[INFO] testing connection to the target URL");
    push("[INFO] heuristic test detected possible SQLi");
    push("[INFO] parameter 'id' is 'MySQL UNION query' injectable", "ok");
    push("Database: shop");
    push("[3 tables] users, products, orders");
    push("Table: users — dumped 4 entries:");
    push("admin    | 5f4dcc3b5aa765d61d8327deb882cf99 (md5: password)");
    push("oscp     | $2b$12$... (bcrypt — skip)");
    return out;
  }
  if (lc.startsWith("hydra")) {
    push("Hydra v9.5 starting at " + new Date().toISOString());
    push("[DATA] attacking ssh://10.10.11.42:22");
    push("[STATUS] 1240.00 tries/min, 1240 tries in 00:01h");
    push("[22][ssh] host: 10.10.11.42  login: oscp  password: superman", "ok");
    push("1 of 1 target successfully completed, 1 valid password found.");
    return out;
  }
  if (lc.startsWith("hashcat")) {
    push("hashcat (v6.2.6) starting");
    push("OpenCL API (OpenCL 3.0) — Platform #1 [Intel]");
    push("Status...........: Cracked");
    push("Recovered........: 1/1 (100.00%) Digests");
    push("$krb5tgs$23$*svc_sql$LAB$... : Summer2024!", "ok");
    return out;
  }
  if (lc.startsWith("searchsploit")) {
    push("------------------------------------------------------ ----------");
    push(" Exploit Title                                        |  Path");
    push("------------------------------------------------------ ----------");
    push(" vsftpd 2.3.4 - Backdoor Command Execution            | unix/remote/49757.py");
    push(" vsftpd 2.3.4 - Backdoor Command Execution (Metaspl.) | unix/remote/17491.rb");
    push("------------------------------------------------------ ----------");
    return out;
  }
  if (lc.startsWith("msfconsole") || lc.startsWith("msf6") || lc.startsWith("use ") || lc.startsWith("set ") || lc.startsWith("run") || lc.startsWith("exploit")) {
    if (lc.startsWith("msfconsole")) push("       =[ metasploit v6.4 ]");
    push("msf6 > " + c);
    if (lc.includes("exploit") || lc === "run") {
      push("[*] Started reverse TCP handler on 10.10.14.5:4444");
      push("[*] Sending exploit...");
      push("[*] Meterpreter session 1 opened (10.10.14.5:4444 -> 10.10.11.42:38422)", "ok");
      push("meterpreter > getuid");
      push("Server username: NT AUTHORITY\\SYSTEM", "ok");
    }
    return out;
  }
  if (lc.startsWith("getuserspns") || lc.includes("kerberoast")) {
    push("Impacket v0.11 — GetUserSPNs.py");
    push("ServicePrincipalName    Name      MemberOf");
    push("MSSQLSvc/sql.lab:1433   svc_sql   CN=Service Accounts,OU=Groups,DC=lab,DC=local");
    push("$krb5tgs$23$*svc_sql$LAB$MSSQLSvc/sql.lab*$a1b2...", "ok");
    return out;
  }
  if (lc.startsWith("secretsdump") || lc.includes("dcsync")) {
    push("Impacket v0.11 — secretsdump.py");
    push("[*] Dumping Domain Credentials (domain\\uid:rid:lmhash:nthash)");
    push("Administrator:500:aad3b435b51404eeaad3b435b51404ee:e19ccf75ee54e06b06a5907af13cef42");
    push("krbtgt:502:aad3b435b51404eeaad3b435b51404ee:9f8d8a3c5d8b4f7e8c9a0b1c2d3e4f56", "ok");
    push("[*] Cleaning up...");
    return out;
  }
  if (lc.startsWith("linpeas") || lc.startsWith("./linpeas")) {
    push("╔═══════════════════════════════════════════════════════════╗");
    push("║                  PEASS-ng — linpeas.sh                    ║");
    push("╚═══════════════════════════════════════════════════════════╝");
    push("[+] SUID binaries:");
    push("    /usr/bin/find    <-- 95% PE [GTFOBins!]", "ok");
    push("[+] Sudo (NOPASSWD):");
    push("    (root) NOPASSWD: /usr/bin/vim    <-- GTFOBins!", "ok");
    return out;
  }
  if (lc.startsWith("winpeas") || lc.includes("winpeas.exe")) {
    push("╔════════ winPEAS — WINDOWS LOCAL PRIVESC ════════╗");
    push("[+] Current Token Privileges:");
    push("    SeImpersonatePrivilege   Enabled    <-- POTATO!", "ok");
    push("[+] Unquoted Service Paths:");
    push("    C:\\Program Files\\Vuln App\\service.exe");
    return out;
  }
  if (lc.startsWith("sudo ")) {
    push("Matching Defaults entries for kali:");
    push("    env_reset, secure_path=/usr/local/sbin:/usr/local/bin:...");
    push("User kali may run the following commands:");
    push("    (root) NOPASSWD: /usr/bin/vim", "ok");
    return out;
  }
  if (lc.startsWith("find ") && lc.includes("perm") && lc.includes("u=s")) {
    push("/usr/bin/find");
    push("/usr/bin/passwd");
    push("/usr/bin/sudo");
    push("/usr/bin/vim                <-- not normally SUID!", "ok");
    return out;
  }
  if (lc.startsWith("evil-winrm")) {
    push("Evil-WinRM shell v3.5");
    push("Info: Establishing connection to remote endpoint");
    push("*Evil-WinRM* PS C:\\Users\\oscp\\Documents>");
    return out;
  }
  if (lc.startsWith("mimikatz") || lc.includes("kerberos::golden") || lc.includes("sekurlsa")) {
    push("  .#####.   mimikatz 2.2.0 (x64)");
    push(" .## ^ ##.");
    push("mimikatz # " + c);
    if (lc.includes("golden")) push("[+] Golden Ticket created and injected (PTT). Lifetime: 10 years.", "ok");
    return out;
  }
  if (lc.startsWith("bloodhound") || lc.includes("sharphound")) {
    push("INFO: Resolved collection methods: Group, LocalAdmin, Session, Trusts, ACL, ObjectProps, Container");
    push("INFO: Beginning LDAP search for lab.local");
    push("INFO: Saving cache file");
    push("INFO: Finished collection in 00:01:42");
    push("[+] Wrote 20240427_BloodHound.zip — drag into BloodHound UI.", "ok");
    return out;
  }

  push(`zsh: command not found (simulated): ${c.split(" ")[0]}`, "err");
  push("Tip: this terminal recognises nmap, gobuster, sqlmap, hydra, hashcat, msfconsole,", "info");
  push("     smbclient, searchsploit, linpeas, winpeas, GetUserSPNs.py, secretsdump.py,", "info");
  push("     mimikatz, bloodhound-python, evil-winrm, sudo, find, id, whoami, cat, ls.", "info");
  return out;
}

// ------------------------------------------------------------------
// Validation
// ------------------------------------------------------------------
function matches(cmd: string, action: Action): boolean {
  if (!action || action.type === "any") return true;
  const c = cmd.trim().toLowerCase();
  if (action.equals) return c === action.equals.toLowerCase();
  if (action.contains) return c.includes(action.contains.toLowerCase());
  if (action.value) return c.includes(action.value.toLowerCase());
  return false;
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------
export function KaliTerminalSimulator({ expectedAction, onValidate }: Props) {
  const [history, setHistory] = useState<Line[]>([
    { kind: "info", text: "Welcome to ShadowX Kali Lab — type a command and press Enter." },
    { kind: "info", text: "All output is simulated. No traffic leaves your browser." },
  ]);
  const [input, setInput] = useState("");
  const [past, setPast] = useState<string[]>([]);
  const [pastIdx, setPastIdx] = useState<number>(-1);
  const [solved, setSolved] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const expectedHint = useMemo(() => {
    if (!expectedAction) return "";
    if (expectedAction.equals) return `Run exactly: ${expectedAction.equals}`;
    if (expectedAction.contains) return `Run a command containing: ${expectedAction.contains}`;
    if (expectedAction.value) return `Try something containing: ${expectedAction.value}`;
    if (expectedAction.type === "any") return "Free exploration — any command will pass.";
    return "";
  }, [expectedAction]);

  // Reset solved state whenever the expected action changes (new step)
  useEffect(() => {
    setSolved(false);
  }, [expectedAction]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history]);

  function submit() {
    const c = input.trim();
    if (!c) return;
    const newLines: Line[] = [{ kind: "prompt", text: PROMPT + c }, ...runCommand(c)];
    setHistory((h) => [...h, ...newLines]);
    setPast((p) => [...p, c]);
    setPastIdx(-1);
    setInput("");
    if (!solved && matches(c, expectedAction)) {
      setSolved(true);
      setHistory((h) => [...h, { kind: "ok", text: "✔ Step objective met. Marking step complete…" }]);
      setTimeout(() => onValidate(true), 400);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); submit(); return; }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!past.length) return;
      const idx = pastIdx === -1 ? past.length - 1 : Math.max(0, pastIdx - 1);
      setPastIdx(idx); setInput(past[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (pastIdx === -1) return;
      const idx = pastIdx + 1;
      if (idx >= past.length) { setPastIdx(-1); setInput(""); }
      else { setPastIdx(idx); setInput(past[idx]); }
    }
  }

  return (
    <Card className="overflow-hidden border-0 shadow-card">
      {/* Title bar */}
      <div className="flex items-center justify-between bg-[hsl(220_15%_10%)] text-foreground px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Skull className="h-4 w-4 text-shadowx-gold" />
          <span className="font-semibold">kali@shadowx</span>
          <span className="text-muted-foreground">— zsh</span>
        </div>
        <div className="flex items-center gap-2">
          {expectedHint && (
            <Badge variant="outline" className="text-[10px] gap-1">
              <Terminal className="h-3 w-3" /> {expectedHint}
            </Badge>
          )}
          {solved && (
            <Badge className="bg-success/15 text-success border-success/30 text-[10px] gap-1">
              <CheckCircle2 className="h-3 w-3" /> Solved
            </Badge>
          )}
        </div>
      </div>

      {/* Terminal body */}
      <div ref={scrollRef as any} className="bg-[hsl(220_20%_7%)] text-[hsl(140_70%_75%)] font-mono text-[12.5px] leading-relaxed">
        <ScrollArea className="h-[360px]">
          <div className="px-4 py-3 space-y-0.5">
            {history.map((l, i) => (
              <pre key={i} className={
                l.kind === "prompt" ? "text-[hsl(45_90%_70%)] whitespace-pre-wrap"
                : l.kind === "ok" ? "text-[hsl(140_80%_70%)] whitespace-pre-wrap"
                : l.kind === "err" ? "text-[hsl(0_80%_70%)] whitespace-pre-wrap"
                : l.kind === "info" ? "text-[hsl(210_50%_70%)] whitespace-pre-wrap italic"
                : "text-[hsl(0_0%_85%)] whitespace-pre-wrap"
              }>{l.text}</pre>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2 bg-[hsl(220_15%_10%)] px-3 py-2 border-t border-border">
        <span className="font-mono text-xs text-[hsl(45_90%_70%)] shrink-0">└─$</span>
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          spellCheck={false}
          className="flex-1 bg-transparent border-0 outline-none text-foreground font-mono text-sm placeholder:text-muted-foreground"
          placeholder={solved ? "Step solved — try another command or wait for the next step…" : "Type a command and press Enter (↑/↓ for history)"}
        />
        <Button size="sm" variant="secondary" onClick={submit} className="h-7 gap-1">
          <Sparkles className="h-3 w-3" /> Run
        </Button>
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 bg-card border-t border-border flex items-start gap-2 text-[11px] text-muted-foreground">
        <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0 text-warning" />
        <span>
          This is a deliberately safe simulation modelled on real Kali tooling. Output is hand-crafted to mimic real
          engagements (HTB / OffSec lab boxes) so you build muscle memory. No packets are sent.
        </span>
      </div>
    </Card>
  );
}

export default KaliTerminalSimulator;
