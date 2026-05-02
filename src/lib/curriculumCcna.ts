// Cisco CCNA 200-301 v1.1 — full curriculum mapped 1:1 to the official exam guide
// (6 sections, 49 sub-objectives). Designed as a 30-day cadence (~1h–1.5h / day).
// Mirrors the CDL/CSA/K8s shape so all course-aware UI works unchanged.

import type { DayPlan, ModuleNote } from "./curriculum";

/* ---------- Per-module notes (one module per CCNA section) ---------- */
export const ccnaModuleNotes: ModuleNote[] = [
  {
    moduleSlug: "ccna-network-fundamentals",
    domain: "concepts",
    title: "Module 1 — Network Fundamentals (20%)",
    code: "CCNA-M1",
    theoryMinutes: 360,
    labBudgetMinutes: 240,
    topics: [
      "1.1 Network components: routers, L2/L3 switches, NGFW/IPS, APs, controllers, endpoints, servers, PoE",
      "1.2 Topology architectures: two-tier, three-tier, spine-leaf, WAN, SOHO, on-prem & cloud",
      "1.3–1.4 Physical interfaces & cabling (SMF/MMF/copper); identify duplex/speed/collision/error issues",
      "1.5 TCP vs UDP — sockets, handshakes, use-cases",
      "1.6–1.7 IPv4 addressing, subnetting & private ranges (RFC1918)",
      "1.8–1.9 IPv6 addressing, prefix, unicast (global/ULA/link-local), anycast, multicast, EUI-64",
      "1.10 Verify IP parameters on Windows / macOS / Linux",
      "1.11 Wireless principles — non-overlapping channels, SSID, RF, encryption",
      "1.12 Virtualization fundamentals — server VMs, containers, VRFs",
      "1.13 Switching concepts — MAC learning/aging, frame switching, flooding, MAC table",
    ],
    labSlugs: [
      "ccna-packet-tracer-tour",
      "ccna-subnetting-workshop",
      "ccna-ipv6-addressing",
      "ccna-tcp-udp-capture",
      "ccna-mac-table-walkthrough",
    ],
  },
  {
    moduleSlug: "ccna-network-access",
    domain: "iam",
    title: "Module 2 — Network Access (20%)",
    code: "CCNA-M2",
    theoryMinutes: 330,
    labBudgetMinutes: 270,
    topics: [
      "2.1 VLANs (normal range) across multiple switches — access (data + voice), default VLAN, inter-VLAN connectivity",
      "2.2 Interswitch connectivity — trunk ports, 802.1Q, native VLAN",
      "2.3 L2 discovery — CDP and LLDP",
      "2.4 EtherChannel (L2/L3) with LACP",
      "2.5 Rapid PVST+ STP — root bridge, port roles/states, PortFast, root/loop guard, BPDU filter/guard",
      "2.6 Cisco Wireless architectures and AP modes",
      "2.7 WLAN physical infrastructure — AP, WLC, access/trunk ports, LAG",
      "2.8 Device management access — Telnet, SSH, HTTP/HTTPS, console, TACACS+/RADIUS, cloud-managed",
      "2.9 WLC GUI — WLAN creation, security, QoS profiles, advanced settings",
    ],
    labSlugs: [
      "ccna-vlan-trunk-config",
      "ccna-intervlan-routing",
      "ccna-cdp-lldp",
      "ccna-etherchannel-lacp",
      "ccna-rpvst-stp",
      "ccna-wlc-gui-wlan-create",
    ],
  },
  {
    moduleSlug: "ccna-ip-connectivity",
    domain: "entra",
    title: "Module 3 — IP Connectivity (25%)",
    code: "CCNA-M3",
    theoryMinutes: 360,
    labBudgetMinutes: 300,
    topics: [
      "3.1 Routing table components — protocol code, prefix, mask, next hop, AD, metric, gateway of last resort",
      "3.2 Forwarding decision — longest prefix match, AD, metric tie-breakers",
      "3.3 IPv4/IPv6 static routing — default, network, host, floating static",
      "3.4 Single-area OSPFv2 — adjacencies, point-to-point, broadcast (DR/BDR), router ID",
      "3.5 First Hop Redundancy Protocols — purpose, functions and concepts (HSRP/VRRP/GLBP)",
    ],
    labSlugs: [
      "ccna-static-routing-ipv4",
      "ccna-static-routing-ipv6",
      "ccna-floating-static",
      "ccna-ospfv2-single-area",
      "ccna-ospf-dr-bdr",
      "ccna-fhrp-hsrp",
    ],
  },
  {
    moduleSlug: "ccna-ip-services",
    domain: "security",
    title: "Module 4 — IP Services (10%)",
    code: "CCNA-M4",
    theoryMinutes: 240,
    labBudgetMinutes: 240,
    topics: [
      "4.1 Inside source NAT — static and pools",
      "4.2 NTP — client and server modes",
      "4.3 DHCP and DNS roles within the network",
      "4.4 SNMP function in network operations",
      "4.5 Syslog — facilities and severity levels",
      "4.6 DHCP client and relay configuration",
      "4.7 QoS per-hop behavior — classification, marking, queuing, congestion, policing, shaping",
      "4.8 Configure remote access using SSH",
      "4.9 TFTP / FTP capabilities and use",
    ],
    labSlugs: [
      "ccna-static-nat",
      "ccna-pat-overload",
      "ccna-ntp-client-server",
      "ccna-dhcp-relay",
      "ccna-syslog-severity",
      "ccna-ssh-remote-access",
    ],
  },
  {
    moduleSlug: "ccna-security-fundamentals",
    domain: "compliance",
    title: "Module 5 — Security Fundamentals (15%)",
    code: "CCNA-M5",
    theoryMinutes: 300,
    labBudgetMinutes: 240,
    topics: [
      "5.1 Key security concepts — threats, vulnerabilities, exploits, mitigations",
      "5.2 Security program elements — user awareness, training, physical access control",
      "5.3 Device access control with local passwords",
      "5.4 Password policy — management, complexity, MFA, certificates, biometrics",
      "5.5 IPsec remote-access and site-to-site VPNs",
      "5.6 Access Control Lists — standard and extended",
      "5.7 L2 security — DHCP snooping, dynamic ARP inspection (DAI), port security",
      "5.8 AAA — authentication, authorization, accounting",
      "5.9 Wireless security — WPA, WPA2, WPA3",
      "5.10 WLAN with WPA2 PSK in the WLC GUI",
    ],
    labSlugs: [
      "ccna-device-hardening",
      "ccna-acl-extended",
      "ccna-port-security",
      "ccna-dhcp-snooping-dai",
      "ccna-aaa-radius",
      "ccna-wpa2-psk-wlan",
    ],
  },
  {
    moduleSlug: "ccna-automation-programmability",
    domain: "exam",
    title: "Module 6 — Automation & Programmability (10%)",
    code: "CCNA-M6",
    theoryMinutes: 240,
    labBudgetMinutes: 180,
    topics: [
      "6.1 How automation impacts network management",
      "6.2 Traditional vs controller-based networking",
      "6.3 Controller-based / SDN architecture — overlay, underlay, fabric; control vs data plane; NB/SB APIs",
      "6.4 AI (generative & predictive) and ML in network operations",
      "6.5 REST APIs — auth types, CRUD, HTTP verbs, data encoding",
      "6.6 Configuration management — Ansible and Terraform capabilities",
      "6.7 JSON-encoded data — structure and components",
    ],
    labSlugs: [
      "ccna-rest-api-postman",
      "ccna-json-parsing",
      "ccna-ansible-playbook-tour",
      "ccna-sdn-controller-tour",
    ],
  },
];

const m = (slug: string) => ccnaModuleNotes.find((x) => x.moduleSlug === slug)!;

/* ---------- 30-day plan (~1h–1.5h / day) ---------- */
// Each module is split into themed days that walk through the official sub-objectives.
// Module-level theory & lab minutes stay in the ModuleNote — these day cards are the
// session schedule the instructor follows.
type DaySpec = { id: string; label: string; subtitle: string; description: string; module: string };

const ds: DaySpec[] = [
  // Module 1 — Network Fundamentals (Days 1–7)
  { id: "d01", label: "Day 1",  subtitle: "1.1 Network components (≈ 1h 15m)",            description: "Routers, L2/L3 switches, NGFW/IPS, APs, controllers, endpoints, servers and PoE — what each device does on the wire.", module: "ccna-network-fundamentals" },
  { id: "d02", label: "Day 2",  subtitle: "1.2 Topology architectures (≈ 1h)",            description: "Two-tier, three-tier, spine-leaf, WAN, SOHO and on-prem vs cloud — when each design wins.", module: "ccna-network-fundamentals" },
  { id: "d03", label: "Day 3",  subtitle: "1.3–1.4 Cabling & interface issues (≈ 1h)",    description: "SMF / MMF / copper, point-to-point vs shared media; troubleshoot collisions, errors, duplex and speed mismatches.", module: "ccna-network-fundamentals" },
  { id: "d04", label: "Day 4",  subtitle: "1.5–1.7 TCP/UDP & IPv4 subnetting (≈ 1h 30m)", description: "TCP vs UDP, IPv4 addressing & VLSM subnetting workshop, and RFC1918 private ranges.", module: "ccna-network-fundamentals" },
  { id: "d05", label: "Day 5",  subtitle: "1.8–1.9 IPv6 addressing (≈ 1h 15m)",           description: "IPv6 prefixes, unicast (global/ULA/link-local), anycast, multicast and modified EUI-64.", module: "ccna-network-fundamentals" },
  { id: "d06", label: "Day 6",  subtitle: "1.10–1.12 Client OS, wireless & virtualization (≈ 1h)", description: "Verify IP on Windows/macOS/Linux; non-overlapping Wi-Fi channels, SSID, RF & encryption; server VMs, containers and VRFs.", module: "ccna-network-fundamentals" },
  { id: "d07", label: "Day 7",  subtitle: "1.13 Switching concepts (≈ 1h)",               description: "MAC learning & aging, frame switching/flooding, MAC address table walk-through.", module: "ccna-network-fundamentals" },

  // Module 2 — Network Access (Days 8–13)
  { id: "d08", label: "Day 8",  subtitle: "2.1 VLANs across switches (≈ 1h 15m)",         description: "Normal-range VLANs, access ports (data + voice), default VLAN and inter-VLAN connectivity.", module: "ccna-network-access" },
  { id: "d09", label: "Day 9",  subtitle: "2.2 Trunks, 802.1Q & native VLAN (≈ 1h)",      description: "Configure and verify interswitch connectivity end-to-end.", module: "ccna-network-access" },
  { id: "d10", label: "Day 10", subtitle: "2.3 CDP & LLDP (≈ 45m)",                       description: "Layer-2 discovery protocols — when to enable, when to disable, and what they reveal.", module: "ccna-network-access" },
  { id: "d11", label: "Day 11", subtitle: "2.4 EtherChannel with LACP (≈ 1h)",            description: "Bundle L2 / L3 links with LACP; verify load distribution and fail-over.", module: "ccna-network-access" },
  { id: "d12", label: "Day 12", subtitle: "2.5 Rapid PVST+ STP (≈ 1h 30m)",               description: "Root bridge selection, port roles & states, PortFast, root/loop guard, BPDU filter & BPDU guard.", module: "ccna-network-access" },
  { id: "d13", label: "Day 13", subtitle: "2.6–2.9 Wireless & device management (≈ 1h 30m)", description: "Cisco wireless architectures, AP modes, WLAN physical infra (AP/WLC/LAG), device management (SSH/Telnet/HTTPS/TACACS+/RADIUS) and WLC GUI WLAN creation.", module: "ccna-network-access" },

  // Module 3 — IP Connectivity (Days 14–19)
  { id: "d14", label: "Day 14", subtitle: "3.1 Routing table anatomy (≈ 1h)",             description: "Protocol code, prefix, mask, next hop, administrative distance, metric and gateway of last resort.", module: "ccna-ip-connectivity" },
  { id: "d15", label: "Day 15", subtitle: "3.2 Forwarding decisions (≈ 1h)",              description: "Longest prefix match, AD vs metric tie-breakers — predict the path before you ping.", module: "ccna-ip-connectivity" },
  { id: "d16", label: "Day 16", subtitle: "3.3 Static routing — IPv4 (≈ 1h 15m)",         description: "Default, network and host routes; build and verify floating static routes.", module: "ccna-ip-connectivity" },
  { id: "d17", label: "Day 17", subtitle: "3.3 Static routing — IPv6 (≈ 1h)",             description: "IPv6 static, default and host routes side-by-side with the IPv4 equivalents.", module: "ccna-ip-connectivity" },
  { id: "d18", label: "Day 18", subtitle: "3.4 Single-area OSPFv2 (≈ 1h 45m)",            description: "Neighbor adjacencies, point-to-point and broadcast (DR/BDR) network types, router ID.", module: "ccna-ip-connectivity" },
  { id: "d19", label: "Day 19", subtitle: "3.5 First Hop Redundancy Protocols (≈ 1h)",    description: "Purpose, functions and concepts of HSRP / VRRP / GLBP.", module: "ccna-ip-connectivity" },

  // Module 4 — IP Services (Days 20–24)
  { id: "d20", label: "Day 20", subtitle: "4.1 Inside source NAT (≈ 1h 15m)",             description: "Static NAT and PAT/overload pools — configure, verify and troubleshoot.", module: "ccna-ip-services" },
  { id: "d21", label: "Day 21", subtitle: "4.2–4.3 NTP, DHCP & DNS (≈ 1h)",               description: "NTP client / server mode; DHCP and DNS roles inside the network.", module: "ccna-ip-services" },
  { id: "d22", label: "Day 22", subtitle: "4.4–4.5 SNMP & syslog (≈ 1h)",                 description: "What SNMP gives you in operations; syslog facilities and severity levels.", module: "ccna-ip-services" },
  { id: "d23", label: "Day 23", subtitle: "4.6–4.7 DHCP relay & QoS PHB (≈ 1h 15m)",      description: "DHCP client / relay configuration; QoS classification, marking, queuing, congestion, policing and shaping.", module: "ccna-ip-services" },
  { id: "d24", label: "Day 24", subtitle: "4.8–4.9 SSH, TFTP & FTP (≈ 1h)",               description: "Secure remote access via SSH; capabilities of TFTP and FTP for image and config transfer.", module: "ccna-ip-services" },

  // Module 5 — Security Fundamentals (Days 25–28)
  { id: "d25", label: "Day 25", subtitle: "5.1–5.4 Concepts, programs & passwords (≈ 1h 30m)", description: "Threats / vulnerabilities / exploits / mitigations; user awareness and physical access; local passwords, MFA, certificates, biometrics.", module: "ccna-security-fundamentals" },
  { id: "d26", label: "Day 26", subtitle: "5.5–5.6 VPNs & ACLs (≈ 1h 30m)",               description: "IPsec remote-access and site-to-site VPN concepts; configure and verify standard / extended ACLs.", module: "ccna-security-fundamentals" },
  { id: "d27", label: "Day 27", subtitle: "5.7–5.8 L2 security & AAA (≈ 1h 15m)",         description: "DHCP snooping, Dynamic ARP Inspection, port security; compare authentication, authorization and accounting.", module: "ccna-security-fundamentals" },
  { id: "d28", label: "Day 28", subtitle: "5.9–5.10 Wireless security & WLC GUI (≈ 1h)",  description: "WPA / WPA2 / WPA3 differences, then build a WPA2 PSK WLAN in the WLC GUI.", module: "ccna-security-fundamentals" },

  // Module 6 — Automation & Programmability (Days 29–30)
  { id: "d29", label: "Day 29", subtitle: "6.1–6.4 Automation, SDN, AI/ML (≈ 1h 45m)",    description: "Automation impact, traditional vs controller-based networks, SDN overlay/underlay/fabric, NB/SB APIs, AI & ML in netops.", module: "ccna-automation-programmability" },
  { id: "d30", label: "Day 30", subtitle: "6.5–6.7 REST, JSON, Ansible & Terraform + exam wrap (≈ 2h)", description: "REST API auth/CRUD/verbs/encoding, JSON anatomy, Ansible & Terraform capabilities — then full CCNA exam wrap and review.", module: "ccna-automation-programmability" },
];

export const ccnaThirtyDayPlan: DayPlan[] = ds.map((d) => ({
  id: d.id,
  label: d.label,
  subtitle: d.subtitle,
  description: d.description,
  modules: [m(d.module)],
}));

/* ---------- Compatibility plans for course-aware UI (5/2/1-day, 1-hour) ---------- */
// The recommended cadence is 30 days. The shorter plans below are condensed views
// that bucket the 30 day-themes into the standard slots so existing pickers work.

export const ccnaFiveDayPlan: DayPlan[] = [
  { id: "day1", label: "Day 1", subtitle: "Network Fundamentals (≈ 10h)", description: "Module 1 in full — components, topologies, cabling, TCP/UDP, IPv4 & IPv6, wireless, virtualization, switching.", modules: [m("ccna-network-fundamentals")] },
  { id: "day2", label: "Day 2", subtitle: "Network Access (≈ 10h)",       description: "Module 2 in full — VLANs, trunks, CDP/LLDP, EtherChannel, RPVST+, wireless and device management.", modules: [m("ccna-network-access")] },
  { id: "day3", label: "Day 3", subtitle: "IP Connectivity (≈ 11h)",      description: "Module 3 in full — routing table, forwarding, static routing, OSPFv2 and FHRPs.", modules: [m("ccna-ip-connectivity")] },
  { id: "day4", label: "Day 4", subtitle: "IP Services + Security (≈ 14h)", description: "Modules 4 & 5 — NAT, NTP, DHCP, DNS, SNMP, syslog, QoS, SSH; then security concepts, ACLs, L2 security, AAA, WLAN security.", modules: [m("ccna-ip-services"), m("ccna-security-fundamentals")] },
  { id: "day5", label: "Day 5", subtitle: "Automation, programmability & exam wrap (≈ 7h)", description: "Module 6 — automation impact, SDN, AI/ML, REST, JSON, Ansible & Terraform; then practice exam.", modules: [m("ccna-automation-programmability")] },
];

export const ccnaTwoDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "Foundations & access — Modules 1-3 (≈ 31h — extended; condensed highlights only)",
    description: "Network fundamentals, network access and IP connectivity. Booked as a 30-day plan, this is multi-week material — use the day labels as a high-speed map.",
    modules: [m("ccna-network-fundamentals"), m("ccna-network-access"), m("ccna-ip-connectivity")],
  },
  {
    id: "day2",
    label: "Day 2",
    subtitle: "Services, security & automation — Modules 4-6 (≈ 21h — extended; condensed highlights only)",
    description: "IP services, security fundamentals and automation & programmability — followed by exam wrap.",
    modules: [m("ccna-ip-services"), m("ccna-security-fundamentals"), m("ccna-automation-programmability")],
  },
];

export const ccnaOneDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "Full CCNA bootcamp (≈ 52h total — condensed highlights in 8h)",
    description: "Whirlwind tour of all 49 official sub-objectives in one day. The full curriculum is built for the 30-day cadence — book that for hands-on coverage.",
    modules: ccnaModuleNotes,
  },
];

/* ---------- 1-hour Cisco IOS tool tour ---------- */
const ccnaToolTourModule: ModuleNote = {
  moduleSlug: "ccna-tool-tour",
  domain: "concepts",
  title: "Cisco IOS tool tour — 5 essentials in 60 minutes",
  code: "CCNA-T1",
  theoryMinutes: 10,
  labBudgetMinutes: 50,
  topics: [
    "1. Packet Tracer / EVE-NG — open a topology and read the device list",
    "2. show running-config & show ip interface brief — read a router state",
    "3. Configure and verify a VLAN + trunk on a switch",
    "4. Build a static route and confirm with show ip route",
    "5. Apply an extended ACL and read the hit counters",
  ],
  labSlugs: [
    "ccna-packet-tracer-tour",
    "ccna-vlan-trunk-config",
    "ccna-static-routing-ipv4",
    "ccna-acl-extended",
    "ccna-ssh-remote-access",
  ],
};

export const ccnaOneHourPlan: DayPlan[] = [
  {
    id: "session1",
    label: "Session",
    subtitle: "Cisco IOS tool tour — 5 essentials in 1h",
    description:
      "Express 60-minute walkthrough of the five things every CCNA candidate must be fluent with: Packet Tracer, show running-config, VLAN+trunk, static routing and extended ACLs.",
    modules: [ccnaToolTourModule],
  },
];
