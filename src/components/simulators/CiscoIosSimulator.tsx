/**
 * CiscoIosSimulator — interactive Cisco IOS-style CLI used by all CCNA labs.
 *
 * Mimics a Cisco router/switch CLI with prompt modes:
 *   Router>            (user EXEC)
 *   Router#            (privileged EXEC, after `enable`)
 *   Router(config)#    (global config, after `configure terminal`)
 *   Router(config-if)# (interface config)
 *
 * Validates lab steps using the same expected_action contract as the other
 * simulators:
 *
 *   { type: "command", contains: "show ip route" }
 *   { type: "command", equals:   "enable"        }
 *   { type: "any" }
 *
 * Recognised commands: enable, disable, configure terminal, exit, end, hostname,
 * interface, ip address, no shutdown, ip route, router ospf, network, vlan,
 * switchport, channel-group, spanning-tree, line vty, transport input ssh,
 * username, crypto key generate rsa, ip access-list, access-class, ip nat,
 * snmp-server, ntp, logging, ip dhcp pool, ip helper-address, banner motd,
 * show version, show ip interface brief, show running-config, show ip route,
 * show vlan brief, show cdp neighbors, show mac address-table, show etherchannel,
 * show spanning-tree, show ip ospf neighbor, show ip nat translations,
 * show access-lists, show ip dhcp binding, ping, traceroute, copy run start, etc.
 *
 * Anything unrecognised returns a "% Invalid input detected" notice but still
 * validates against expected_action so labs progress.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Network, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

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
type Mode = "user" | "priv" | "config" | "config-if" | "config-vlan" | "config-line" | "config-router";

let HOSTNAME = "Router";
let CUR_IF = "GigabitEthernet0/0";
let CUR_VLAN = "10";
let CUR_LINE = "vty 0 4";
let CUR_ROUTER = "ospf 1";

function promptFor(mode: Mode): string {
  switch (mode) {
    case "user":          return `${HOSTNAME}> `;
    case "priv":          return `${HOSTNAME}# `;
    case "config":        return `${HOSTNAME}(config)# `;
    case "config-if":     return `${HOSTNAME}(config-if)# `;
    case "config-vlan":   return `${HOSTNAME}(config-vlan)# `;
    case "config-line":   return `${HOSTNAME}(config-line)# `;
    case "config-router": return `${HOSTNAME}(config-router)# `;
  }
}

function runCommand(cmd: string, mode: Mode): { out: Line[]; mode: Mode } {
  const c = cmd.trim();
  const lc = c.toLowerCase();
  const out: Line[] = [];
  const push = (text: string, kind: Line["kind"] = "stdout") => out.push({ kind, text });

  if (!c) return { out, mode };
  if (lc === "clear" || lc === "cls") return { out: [], mode };

  // ---------- mode transitions ----------
  if (lc === "enable" || lc === "en") {
    if (mode === "user") return { out, mode: "priv" };
    return { out, mode };
  }
  if (lc === "disable") return { out, mode: "user" };
  if (lc === "exit") {
    if (mode === "config-if" || mode === "config-vlan" || mode === "config-line" || mode === "config-router") return { out, mode: "config" };
    if (mode === "config") return { out, mode: "priv" };
    if (mode === "priv") return { out, mode: "user" };
    return { out, mode };
  }
  if (lc === "end" || lc === "^z") {
    if (mode.startsWith("config")) return { out, mode: "priv" };
    return { out, mode };
  }
  if (lc === "configure terminal" || lc === "conf t" || lc === "config t") {
    if (mode !== "priv") { push("% Enter privileged EXEC first (type `enable`).", "err"); return { out, mode }; }
    push("Enter configuration commands, one per line. End with CNTL/Z.", "info");
    return { out, mode: "config" };
  }

  if (lc.startsWith("hostname ") && mode === "config") {
    HOSTNAME = c.split(/\s+/)[1] || "Router";
    return { out, mode };
  }

  if (lc.startsWith("interface ") && (mode === "config" || mode === "config-if")) {
    CUR_IF = c.replace(/^interface\s+/i, "");
    return { out, mode: "config-if" };
  }
  if (lc.startsWith("vlan ") && (mode === "config" || mode === "config-vlan") && /^\d+$/.test(lc.split(/\s+/)[1] || "")) {
    CUR_VLAN = lc.split(/\s+/)[1];
    return { out, mode: "config-vlan" };
  }
  if (lc.startsWith("line ") && (mode === "config" || mode === "config-line")) {
    CUR_LINE = c.replace(/^line\s+/i, "");
    return { out, mode: "config-line" };
  }
  if (lc.startsWith("router ") && mode === "config") {
    CUR_ROUTER = c.replace(/^router\s+/i, "");
    return { out, mode: "config-router" };
  }

  // ---------- common config-mode commands (silent ok) ----------
  if (mode === "config-if") {
    if (lc.startsWith("ip address ")) { push(`% Configured IPv4 address on ${CUR_IF} (simulated).`, "ok"); return { out, mode }; }
    if (lc.startsWith("ipv6 address ")) { push(`% Configured IPv6 address on ${CUR_IF} (simulated).`, "ok"); return { out, mode }; }
    if (lc === "no shutdown" || lc === "no shut") { push(`%LINK-3-UPDOWN: Interface ${CUR_IF}, changed state to up`, "info"); push(`%LINEPROTO-5-UPDOWN: Line protocol on ${CUR_IF} changed state to up`, "info"); return { out, mode }; }
    if (lc === "shutdown") { push(`%LINK-5-CHANGED: Interface ${CUR_IF}, changed state to administratively down`, "info"); return { out, mode }; }
    if (lc.startsWith("switchport mode ")) { push(`% Set ${CUR_IF} to ${c.split(/\s+/)[2]} mode.`, "ok"); return { out, mode }; }
    if (lc.startsWith("switchport access vlan ")) { push(`% ${CUR_IF} added to VLAN ${c.split(/\s+/)[3]}.`, "ok"); return { out, mode }; }
    if (lc.startsWith("switchport trunk ")) { return { out, mode }; }
    if (lc.startsWith("channel-group ")) { push(`Creating EtherChannel Po${(c.match(/\d+/) || ["1"])[0]}`, "ok"); return { out, mode }; }
    if (lc.startsWith("spanning-tree ")) return { out, mode };
    if (lc === "switchport port-security" || lc.startsWith("switchport port-security ")) { push("% Port-security applied.", "ok"); return { out, mode }; }
    if (lc.startsWith("ip nat ")) return { out, mode };
    if (lc.startsWith("description ")) return { out, mode };
    return { out, mode };
  }

  if (mode === "config-vlan") {
    if (lc.startsWith("name ")) { push(`% VLAN ${CUR_VLAN} named ${c.slice(5)}`, "ok"); return { out, mode }; }
    return { out, mode };
  }

  if (mode === "config-line") {
    if (lc === "transport input ssh") { push(`% Line ${CUR_LINE} restricted to SSH.`, "ok"); return { out, mode }; }
    if (lc === "transport input telnet") return { out, mode };
    if (lc === "login local") return { out, mode };
    if (lc.startsWith("password ")) return { out, mode };
    if (lc.startsWith("access-class ")) return { out, mode };
    return { out, mode };
  }

  if (mode === "config-router") {
    if (lc.startsWith("network ")) { push(`% Network statement added to ${CUR_ROUTER}.`, "ok"); return { out, mode }; }
    if (lc.startsWith("router-id ")) return { out, mode };
    if (lc.startsWith("passive-interface ")) return { out, mode };
    return { out, mode };
  }

  // ---------- global config one-liners ----------
  if (mode === "config") {
    if (lc.startsWith("ip route ")) { push("% Static route installed (simulated).", "ok"); return { out, mode }; }
    if (lc.startsWith("ipv6 route ")) { push("% IPv6 static route installed (simulated).", "ok"); return { out, mode }; }
    if (lc.startsWith("username ")) { push("% Local user added.", "ok"); return { out, mode }; }
    if (lc === "ip domain-name shadowx.local" || lc.startsWith("ip domain-name ")) return { out, mode };
    if (lc === "crypto key generate rsa" || lc.startsWith("crypto key generate rsa")) {
      push("The name for the keys will be: " + HOSTNAME + ".shadowx.local");
      push("Choose the size of the key modulus in the range of 360 to 4096... 1024");
      push("% Generating 1024 bit RSA keys, keys will be non-exportable...");
      push("[OK] (elapsed time was 1 seconds)", "ok");
      return { out, mode };
    }
    if (lc.startsWith("ip access-list ")) { push("% ACL created.", "ok"); return { out, mode }; }
    if (lc.startsWith("access-list ")) { push("% Numbered ACL entry installed.", "ok"); return { out, mode }; }
    if (lc.startsWith("ip nat inside source ")) { push("% NAT mapping installed.", "ok"); return { out, mode }; }
    if (lc.startsWith("ip nat pool ")) return { out, mode };
    if (lc.startsWith("ip dhcp pool ")) { push("% DHCP pool created.", "ok"); return { out, mode: "config" }; }
    if (lc.startsWith("ip helper-address ")) return { out, mode };
    if (lc.startsWith("ntp server ")) { push("% NTP server configured.", "ok"); return { out, mode }; }
    if (lc.startsWith("snmp-server ")) return { out, mode };
    if (lc.startsWith("logging ")) return { out, mode };
    if (lc.startsWith("ip ssh ")) return { out, mode };
    if (lc.startsWith("aaa ")) return { out, mode };
    if (lc.startsWith("radius-server ") || lc.startsWith("tacacs-server ")) return { out, mode };
    if (lc.startsWith("banner motd ")) return { out, mode };
    if (lc === "service password-encryption") return { out, mode };
    if (lc === "ip dhcp snooping" || lc.startsWith("ip dhcp snooping")) return { out, mode };
    if (lc.startsWith("ip arp inspection")) return { out, mode };
    return { out, mode };
  }

  // ---------- privileged EXEC: show / debug / utility ----------
  if (mode !== "user" && mode !== "priv") {
    push("% Use `end` to leave configuration mode before running show commands.", "err");
    return { out, mode };
  }

  if (lc === "show version" || lc === "sh ver") {
    push("Cisco IOS Software, C3900 Software (C3900-UNIVERSALK9-M), Version 15.7(3)M3, RELEASE SOFTWARE");
    push("Copyright (c) 1986-2024 by Cisco Systems, Inc.");
    push("ROM: System Bootstrap, Version 15.0(1r)M16, RELEASE SOFTWARE");
    push(`${HOSTNAME} uptime is 2 days, 4 hours, 12 minutes`);
    push("System image file is \"flash0:c3900-universalk9-mz.SPA.157-3.M3.bin\"");
    push("Cisco CISCO3925-CHASSIS (revision 1.0) with 1015808K/32768K bytes of memory.");
    push("Configuration register is 0x2102");
    return { out, mode };
  }

  if (lc === "show ip interface brief" || lc === "sh ip int br") {
    push("Interface              IP-Address      OK? Method Status                Protocol");
    push("GigabitEthernet0/0     192.168.1.1     YES manual up                    up");
    push("GigabitEthernet0/1     10.0.0.1        YES manual up                    up");
    push("GigabitEthernet0/2     unassigned      YES unset  administratively down down");
    push("Vlan1                  unassigned      YES unset  up                    up");
    return { out, mode };
  }

  if (lc === "show ipv6 interface brief") {
    push("GigabitEthernet0/0     [up/up]");
    push("    FE80::1");
    push("    2001:DB8:1::1");
    push("GigabitEthernet0/1     [up/up]");
    push("    FE80::2");
    return { out, mode };
  }

  if (lc.startsWith("show running-config") || lc === "sh run") {
    push(`! Last configuration change at 11:23 by admin`);
    push(`hostname ${HOSTNAME}`);
    push("ip ssh version 2");
    push("interface GigabitEthernet0/0");
    push(" ip address 192.168.1.1 255.255.255.0");
    push(" no shutdown");
    push("interface GigabitEthernet0/1");
    push(" ip address 10.0.0.1 255.255.255.252");
    push(" no shutdown");
    push("router ospf 1");
    push(" network 192.168.1.0 0.0.0.255 area 0");
    push("line vty 0 4");
    push(" transport input ssh");
    push(" login local");
    push("end");
    return { out, mode };
  }

  if (lc === "show startup-config" || lc === "sh start") {
    push("Using 1894 out of 262144 bytes");
    push("(startup-config equals running-config — simulated)");
    return { out, mode };
  }

  if (lc.startsWith("show ip route")) {
    push("Codes: L - local, C - connected, S - static, O - OSPF, E1/E2 - OSPF external");
    push("Gateway of last resort is 10.0.0.2 to network 0.0.0.0");
    push("");
    push("S*    0.0.0.0/0 [1/0] via 10.0.0.2");
    push("      10.0.0.0/30 is subnetted, 1 subnets");
    push("C        10.0.0.0 is directly connected, GigabitEthernet0/1");
    push("L        10.0.0.1/32 is directly connected, GigabitEthernet0/1");
    push("      192.168.1.0/24 is variably subnetted, 2 subnets");
    push("C        192.168.1.0/24 is directly connected, GigabitEthernet0/0");
    push("L        192.168.1.1/32 is directly connected, GigabitEthernet0/0");
    push("O        192.168.2.0/24 [110/2] via 10.0.0.2, 00:14:21, GigabitEthernet0/1");
    return { out, mode };
  }

  if (lc.startsWith("show ipv6 route")) {
    push("IPv6 Routing Table - default - 5 entries");
    push("C   2001:DB8:1::/64 [0/0]");
    push("     via GigabitEthernet0/0, directly connected");
    push("S   2001:DB8:2::/64 [1/0]");
    push("     via 2001:DB8:1::2");
    return { out, mode };
  }

  if (lc === "show vlan brief" || lc === "sh vlan br") {
    push("VLAN Name                             Status    Ports");
    push("---- -------------------------------- --------- -------------------------------");
    push("1    default                          active    Gi0/3, Gi0/4, Gi0/5");
    push("10   DATA                             active    Gi0/1, Gi0/2");
    push("20   VOICE                            active    Gi0/2");
    push("99   MGMT                             active    Gi0/24");
    push("1002 fddi-default                     act/unsup");
    return { out, mode };
  }

  if (lc === "show interfaces trunk" || lc === "sh int trunk") {
    push("Port        Mode             Encapsulation  Status        Native vlan");
    push("Gi0/24      on               802.1q         trunking      99");
    push("");
    push("Port        Vlans allowed on trunk");
    push("Gi0/24      1-4094");
    push("");
    push("Port        Vlans allowed and active in management domain");
    push("Gi0/24      1,10,20,99");
    return { out, mode };
  }

  if (lc.startsWith("show cdp neighbor")) {
    push("Capability Codes: R - Router, T - Trans Bridge, B - Source Route Bridge");
    push("                  S - Switch, H - Host, I - IGMP, r - Repeater, P - Phone");
    push("");
    push("Device ID    Local Intrfce   Holdtme   Capability  Platform   Port ID");
    push("SW1.shadowx  Gig 0/24        165       S I         WS-C2960   Gig 0/1");
    push("R2.shadowx   Gig 0/1         140       R           CISCO3925  Gig 0/0");
    return { out, mode };
  }

  if (lc.startsWith("show lldp neighbor")) {
    push("Capability codes: (R) Router, (B) Bridge, (T) Telephone, (W) WLAN AP");
    push("");
    push("Device ID    Local Intf       Hold-time  Capability  Port ID");
    push("SW1.shadowx  Gi0/24           120        B,R         Gi0/1");
    push("AP01         Gi0/2            120        W           radio0");
    return { out, mode };
  }

  if (lc === "show mac address-table" || lc === "show mac-address-table") {
    push("          Mac Address Table");
    push("-------------------------------------------");
    push("Vlan    Mac Address       Type        Ports");
    push("----    -----------       --------    -----");
    push("  10    0011.2233.4455    DYNAMIC     Gi0/1");
    push("  10    aabb.ccdd.eeff    DYNAMIC     Gi0/2");
    push("  20    1122.3344.5566    STATIC      Gi0/24");
    return { out, mode };
  }

  if (lc.startsWith("show etherchannel")) {
    push("Group  Port-channel  Protocol    Ports");
    push("------+-------------+-----------+-----------");
    push("1      Po1(SU)       LACP        Gi0/1(P)  Gi0/2(P)");
    push("Flags: P - bundled in port-channel, S - L2, U - in use");
    return { out, mode };
  }

  if (lc.startsWith("show spanning-tree")) {
    push("VLAN0010");
    push("  Spanning tree enabled protocol rstp");
    push("  Root ID    Priority    32778");
    push("             Address     0011.2233.4455");
    push("             This bridge is the root");
    push("Interface           Role Sts Cost      Prio.Nbr Type");
    push("Gi0/1               Desg FWD 19        128.1    P2p");
    push("Gi0/24              Desg FWD 4         128.24   P2p");
    return { out, mode };
  }

  if (lc.startsWith("show ip ospf neighbor")) {
    push("Neighbor ID     Pri   State           Dead Time   Address       Interface");
    push("10.0.0.2          1   FULL/BDR        00:00:34    10.0.0.2      GigabitEthernet0/1");
    return { out, mode };
  }

  if (lc.startsWith("show ip ospf")) {
    push(" Routing Process \"ospf 1\" with ID 192.168.1.1");
    push(" Reference bandwidth unit is 100 mbps");
    push(" Number of areas in this router is 1.");
    push("    Area BACKBONE(0)");
    push("        Number of interfaces in this area is 2");
    return { out, mode };
  }

  if (lc.startsWith("show ip nat translations")) {
    push("Pro Inside global       Inside local        Outside local       Outside global");
    push("tcp 203.0.113.5:34522   192.168.1.10:34522  198.51.100.7:443    198.51.100.7:443");
    push("tcp 203.0.113.5:34523   192.168.1.11:34523  93.184.216.34:80    93.184.216.34:80");
    return { out, mode };
  }

  if (lc.startsWith("show access-lists") || lc === "show ip access-lists") {
    push("Standard IP access list 10");
    push("    10 permit 192.168.1.0 0.0.0.255 (24 matches)");
    push("Extended IP access list WEB-IN");
    push("    10 permit tcp any host 192.168.1.50 eq 80 (152 matches)");
    push("    20 permit tcp any host 192.168.1.50 eq 443 (487 matches)");
    push("    30 deny   ip any any (12 matches)");
    return { out, mode };
  }

  if (lc.startsWith("show ip dhcp binding")) {
    push("IP address       Client-ID/Hardware address  Lease expiration       Type");
    push("192.168.1.100    0100.1122.3344.55           Apr 30 2026 11:42 PM   Automatic");
    push("192.168.1.101    0100.aabb.ccdd.ee           May 01 2026 09:13 AM   Automatic");
    return { out, mode };
  }

  if (lc.startsWith("show port-security")) {
    push("Secure Port  MaxSecureAddr  CurrentAddr  SecurityViolation  Security Action");
    push("----------------------------------------------------------------------------");
    push("    Gi0/1            2            1                 0          Restrict");
    push("    Gi0/2            2            2                 1          Shutdown");
    return { out, mode };
  }

  if (lc.startsWith("show ntp ") || lc === "show ntp status") {
    push("Clock is synchronized, stratum 3, reference is 132.163.97.1");
    push("nominal freq is 250.0000 Hz, actual freq is 250.0001 Hz, precision is 2**18");
    return { out, mode };
  }

  if (lc.startsWith("ping ")) {
    push(`Type escape sequence to abort.`);
    push(`Sending 5, 100-byte ICMP Echos to ${c.split(/\s+/)[1]}, timeout is 2 seconds:`);
    push(`!!!!!`);
    push(`Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms`, "ok");
    return { out, mode };
  }

  if (lc.startsWith("traceroute ") || lc.startsWith("trace ")) {
    push("Type escape sequence to abort.");
    push(`Tracing the route to ${c.split(/\s+/)[1]}`);
    push("  1 10.0.0.2          4 msec  4 msec  4 msec");
    push("  2 10.0.1.2          12 msec  8 msec 12 msec");
    push("  3 198.51.100.1     20 msec  *      24 msec");
    return { out, mode };
  }

  if (lc.startsWith("copy run") || lc === "write memory" || lc === "wr") {
    push("Destination filename [startup-config]?");
    push("Building configuration...");
    push("[OK]", "ok");
    return { out, mode };
  }

  if (lc === "reload") {
    push("Proceed with reload? [confirm] (simulated — not actually reloading)", "info");
    return { out, mode };
  }

  if (lc === "show clock") { push("11:42:18.342 UTC Fri Apr 30 2026"); return { out, mode }; }
  if (lc === "show users") { push("    Line       User       Host(s)              Idle       Location"); push("*  0 con 0    admin      idle                 00:00:00"); push("  98 vty 0   admin      idle                 00:01:24 192.168.1.50"); return { out, mode }; }
  if (lc === "?" || lc === "help") {
    push("Common commands: enable, configure terminal, interface, vlan, line, router,");
    push("show ip interface brief, show running-config, show ip route, show vlan brief,");
    push("show cdp neighbors, show mac address-table, show etherchannel, show spanning-tree,");
    push("show ip ospf neighbor, show ip nat translations, show access-lists, ping,");
    push("traceroute, copy running-config startup-config.");
    return { out, mode };
  }

  push(`% Invalid input detected at '^' marker.`, "err");
  return { out, mode };
}

function matches(cmd: string, action: Action): boolean {
  if (!action || action.type === "any") return true;
  const c = cmd.trim().toLowerCase();
  if (action.equals) return c === action.equals.toLowerCase();
  if (action.contains) return c.includes(action.contains.toLowerCase());
  if (action.value) return c.includes(action.value.toLowerCase());
  return false;
}

export function CiscoIosSimulator({ expectedAction, onValidate }: Props) {
  const [mode, setMode] = useState<Mode>("user");
  const [history, setHistory] = useState<Line[]>([
    { kind: "info", text: "ShadowX CCNA Lab — Cisco IOS CLI ready. Type a command and press Enter." },
    { kind: "info", text: "Try: `enable`, then `configure terminal`, `show ip int br`, `show ip route`. ↑/↓ for history." },
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

  useEffect(() => { setSolved(false); }, [expectedAction]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history]);

  function submit() {
    const c = input.trim();
    if (!c) return;
    const result = runCommand(c, mode);
    const newLines: Line[] = [{ kind: "prompt", text: promptFor(mode) + c }, ...result.out];
    setHistory((h) => [...h, ...newLines]);
    setMode(result.mode);
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
          <Network className="h-4 w-4 text-shadowx-azure" />
          <span className="font-semibold">{HOSTNAME}</span>
          <span className="text-muted-foreground">— Cisco IOS console · mode: {mode}</span>
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
      <div ref={scrollRef as any} className="bg-[hsl(220_20%_7%)] text-[hsl(195_70%_80%)] font-mono text-[12.5px] leading-relaxed">
        <ScrollArea className="h-[360px]">
          <div className="px-4 py-3 space-y-0.5">
            {history.map((l, i) => (
              <pre key={i} className={
                l.kind === "prompt" ? "text-[hsl(45_90%_70%)] whitespace-pre-wrap"
                : l.kind === "ok" ? "text-[hsl(140_80%_70%)] whitespace-pre-wrap"
                : l.kind === "err" ? "text-[hsl(0_80%_70%)] whitespace-pre-wrap"
                : l.kind === "info" ? "text-[hsl(210_50%_70%)] whitespace-pre-wrap italic"
                : "text-[hsl(0_0%_88%)] whitespace-pre-wrap"
              }>{l.text}</pre>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2 bg-[hsl(220_20%_7%)] px-3 py-2 border-t border-border">
        <span className="font-mono text-xs text-[hsl(45_90%_70%)] shrink-0">{promptFor(mode).trim()}</span>
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          style={{ color: "hsl(45 95% 75%)", caretColor: "hsl(45 95% 75%)" }}
          className="flex-1 bg-transparent border-0 outline-none font-mono text-sm placeholder:text-[hsl(210_30%_50%)]"
          placeholder={solved ? "Step solved — try another command or wait for the next step…" : "Type a Cisco IOS command and press Enter (↑/↓ for history)"}
        />
        <Button size="sm" variant="secondary" onClick={submit} className="h-7 gap-1">
          <Sparkles className="h-3 w-3" /> Run
        </Button>
      </div>

      <div className="px-3 py-2 bg-card border-t border-border flex items-start gap-2 text-[11px] text-muted-foreground">
        <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0 text-warning" />
        <span>
          Safe simulation modelled on real Cisco IOS output. No devices are actually configured —
          but prompts, modes and show-command output mirror a real router/switch console.
        </span>
      </div>
    </Card>
  );
}

export default CiscoIosSimulator;
