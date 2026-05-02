// Cisco CCNA 200-301 v1.1 — full module explanations.
// One ModuleExplanation per slug declared in src/lib/curriculumCcna.ts.

import type { ModuleExplanation } from "./moduleExplanations";

/* ------------------------------------------------------------------ */
/* 0. Tool tour                                                        */
/* ------------------------------------------------------------------ */
const toolTour: ModuleExplanation = {
  moduleSlug: "ccna-tool-tour",
  tagline: "Touch every CCNA tool — Packet Tracer, IOS CLI, WLC GUI, Postman — in 60 minutes.",
  overview:
    "A 60-minute hands-on tour through the four environments you'll live in for the rest of CCNA: Cisco Packet Tracer, the IOS / IOS-XE CLI, the Wireless LAN Controller GUI, and Postman for REST API calls.",
  whyItMatters:
    "CCNA is a hands-on exam. Knowing where to click and which prompt mode you're in saves you minutes per question.",
  what: {
    heading: "What is the tool tour?",
    body: "Four 12-minute stops + a 12-minute wrap, each producing one screenshot artefact.",
    bullets: [
      "Packet Tracer — drag a router, switch, PC; build an L2 link.",
      "IOS CLI — user, privileged, global config and interface modes.",
      "WLC GUI — log in, browse the dashboard, locate the WLAN page.",
      "Postman — fire a GET against a Cisco DevNet sandbox API.",
    ],
  },
  why: {
    heading: "Why start with a tour?",
    body: "Removes friction. By Day 2 you stop fighting the tools and focus on networking.",
  },
  who: {
    heading: "Who runs these tasks?",
    body: "Network engineers, helpdesk technicians, NetOps, and anyone preparing for the 200-301 exam.",
  },
  when: {
    heading: "When do you use this tour?",
    body: "Day one of CCNA prep, before any deeper module.",
  },
  where: {
    heading: "Where does this happen?",
    body: "Inside the simulated Cisco IOS console and Packet Tracer-style canvas in the lab.",
  },
  how: {
    heading: "How is the hour structured?",
    body: "Five short stops; each ends with a verifiable command output or screenshot.",
    bullets: [
      "0–12m — Packet Tracer canvas tour.",
      "12–24m — IOS CLI prompts and `?` help.",
      "24–36m — WLC GUI navigation.",
      "36–48m — Postman REST GET against DevNet sandbox.",
      "48–60m — Wrap: which tool solves which CCNA task?",
    ],
  },
  conceptDeepDives: [],
  comparisons: [],
  realExamples: [
    {
      title: "Verify a router's IOS version",
      scenario: "You SSH into R1 and need its software version for a TAC case.",
      outcome: "`show version` returns the IOS image, uptime and config register.",
    },
  ],
  keyTerms: [
    { term: "Packet Tracer", definition: "Cisco's free network simulator used for CCNA labs.", example: "Drag a 2911 router and a 2960 switch onto the canvas." },
    { term: "IOS CLI", definition: "The command-line interface running on Cisco routers and switches.", example: "Router> enable" },
    { term: "WLC", definition: "Wireless LAN Controller — central manager for Cisco APs.", alsoKnownAs: ["controller"] },
  ],
  commonPitfalls: [
    "Confusing user mode (`>`) with privileged mode (`#`).",
    "Forgetting `copy running-config startup-config` before powering off.",
  ],
  faqs: [
    { q: "Do I need real Cisco hardware?", a: "No — Packet Tracer, the in-platform IOS simulator and Cisco DevNet sandboxes are enough for CCNA." },
  ],
  selfCheck: [
    {
      question: "Which prompt indicates IOS privileged EXEC mode?",
      options: ["Router>", "Router#", "Router(config)#", "Router(config-if)#"],
      correctIndex: 1,
      explanation: "`#` is privileged EXEC. `>` is user EXEC; `(config)#` is global config; `(config-if)#` is interface config.",
    },
  ],
  examTips: ["Always check the prompt mode before issuing a command — the exam tests this constantly."],
  furtherReading: [
    { label: "Cisco Packet Tracer (NetAcad)", url: "https://www.netacad.com/courses/packet-tracer" },
    { label: "Cisco DevNet sandboxes", url: "https://developer.cisco.com/site/sandbox/" },
  ],
};

/* ------------------------------------------------------------------ */
/* Helper to build module explanations with consistent shape           */
/* ------------------------------------------------------------------ */
function makeModule(opts: {
  slug: string;
  title: string;
  pct: string;
  tagline: string;
  overview: string;
  whyItMatters: string;
  whatBullets: string[];
  whoBody: string;
  whenBody: string;
  whereBody: string;
  howBullets: string[];
  keyTerms: { term: string; definition: string; example?: string }[];
  pitfalls: string[];
  faqs: { q: string; a: string }[];
  selfCheck: { question: string; options: string[]; correctIndex: number; explanation: string }[];
  examTips: string[];
  reading: { label: string; url: string }[];
}): ModuleExplanation {
  return {
    moduleSlug: opts.slug,
    tagline: opts.tagline,
    overview: opts.overview,
    whyItMatters: opts.whyItMatters,
    what: {
      heading: `What is ${opts.title}?`,
      body: `${opts.title} accounts for ${opts.pct} of the CCNA 200-301 v1.1 exam blueprint.`,
      bullets: opts.whatBullets,
    },
    why: {
      heading: `Why does ${opts.title} matter?`,
      body: opts.whyItMatters,
    },
    who: { heading: "Who works with this?", body: opts.whoBody },
    when: { heading: "When do you use it?", body: opts.whenBody },
    where: { heading: "Where does it live?", body: opts.whereBody },
    how: {
      heading: "How do you implement it?",
      body: "Day-by-day cadence in the 30-day plan; each topic ends with a verifiable Packet Tracer or IOS lab.",
      bullets: opts.howBullets,
    },
    conceptDeepDives: [],
    comparisons: [],
    realExamples: [],
    keyTerms: opts.keyTerms,
    commonPitfalls: opts.pitfalls,
    faqs: opts.faqs,
    selfCheck: opts.selfCheck,
    examTips: opts.examTips,
    furtherReading: opts.reading,
  };
}

/* ------------------------------------------------------------------ */
/* Module 1 — Network Fundamentals (20%)                               */
/* ------------------------------------------------------------------ */
const m1 = makeModule({
  slug: "ccna-network-fundamentals",
  title: "Network Fundamentals",
  pct: "20%",
  tagline: "Components, topologies, cabling, IPv4/IPv6, TCP/UDP, wireless and virtualization — the bedrock of CCNA.",
  overview:
    "Module 1 establishes the vocabulary used across the rest of the exam: what a router, switch, NGFW, AP and controller actually do; how copper, multimode and singlemode fibre differ; how IPv4 subnetting and IPv6 addressing work; and what TCP vs UDP buys you. Master this and every later module becomes a configuration exercise on top of these primitives.",
  whyItMatters:
    "Half of CCNA exam questions assume fluency in this vocabulary. You can't troubleshoot OSPF if you can't subnet, and you can't pick the right cable if you don't know SMF vs MMF.",
  whatBullets: [
    "Network components: routers, L2/L3 switches, NGFW/IPS, APs, WLC, endpoints, servers, PoE.",
    "Topology architectures: two-tier, three-tier, spine-leaf, WAN, SOHO, on-prem & cloud.",
    "Physical interfaces and cabling (SMF/MMF/copper); duplex/speed/collision/error issues.",
    "TCP vs UDP — sockets, handshakes, real-world use-cases.",
    "IPv4 addressing, subnetting, RFC1918 private ranges.",
    "IPv6 addressing — prefix, unicast (global/ULA/link-local), anycast, multicast, EUI-64.",
    "Wireless principles, virtualization fundamentals (VMs, containers) and switching concepts (MAC table, frame switching).",
  ],
  whoBody: "Every networking, cybersecurity, and cloud engineer — and every CCNA candidate.",
  whenBody: "Days 1–7 of the 30-day plan. This is the foundation; do not skip it.",
  whereBody: "Inside Packet Tracer topologies and the simulated IOS CLI.",
  howBullets: [
    "Day 1 — Components, topologies, cabling.",
    "Day 2 — Physical interfaces, duplex/speed/error troubleshooting.",
    "Day 3 — TCP vs UDP, sockets, port numbers.",
    "Day 4–5 — IPv4 addressing & subnetting workshops.",
    "Day 6 — IPv6 addressing, prefixes, EUI-64.",
    "Day 7 — Wireless and virtualization concepts.",
  ],
  keyTerms: [
    { term: "RFC1918", definition: "Reserved private IPv4 ranges (10/8, 172.16/12, 192.168/16) not routable on the public Internet." },
    { term: "EUI-64", definition: "Method to auto-build the IPv6 interface ID from the MAC address with FFFE inserted." },
    { term: "PoE", definition: "Power over Ethernet — delivers DC power to APs/phones over the same UTP cable." },
    { term: "Spine-leaf", definition: "A two-tier datacenter topology where every leaf connects to every spine; predictable east-west latency." },
  ],
  pitfalls: [
    "Confusing /24 (256 addresses) with /25 (128) when subnetting under exam pressure.",
    "Picking copper for a 10 km link instead of singlemode fibre.",
    "Forgetting that link-local IPv6 (fe80::/10) is mandatory on every IPv6 interface.",
  ],
  faqs: [
    { q: "Do I really need to subnet by hand on the exam?", a: "Yes — no calculator. Practice /24, /25, /26, /27, /28, /29, /30 daily." },
    { q: "TCP or UDP for DNS?", a: "Both. UDP/53 for queries, TCP/53 for zone transfer and large responses." },
  ],
  selfCheck: [
    {
      question: "How many usable host addresses does a /27 subnet provide?",
      options: ["14", "30", "32", "62"],
      correctIndex: 1,
      explanation: "/27 = 32 addresses − 2 (network + broadcast) = 30 usable.",
    },
    {
      question: "Which IPv6 prefix is link-local?",
      options: ["2000::/3", "fe80::/10", "fc00::/7", "ff00::/8"],
      correctIndex: 1,
      explanation: "fe80::/10 is link-local. 2000::/3 = global unicast, fc00::/7 = ULA, ff00::/8 = multicast.",
    },
  ],
  examTips: [
    "Memorise common subnet boundaries cold — /24 → /30.",
    "Know cable types vs distance: Cat6 100m, MMF ~550m, SMF many km.",
  ],
  reading: [
    { label: "Cisco CCNA 200-301 exam topics", url: "https://learningnetwork.cisco.com/s/ccna-exam-topics" },
  ],
});

/* ------------------------------------------------------------------ */
/* Module 2 — Network Access (20%)                                     */
/* ------------------------------------------------------------------ */
const m2 = makeModule({
  slug: "ccna-network-access",
  title: "Network Access",
  pct: "20%",
  tagline: "VLANs, trunks, EtherChannel, Rapid PVST+ and Cisco wireless architectures.",
  overview:
    "Module 2 covers everything happening at Layer 2 inside the campus: VLAN segmentation, 802.1Q trunking, neighbor discovery (CDP/LLDP), link bundling with EtherChannel/LACP, loop prevention via Rapid PVST+, plus Cisco wireless deployment models and a tour of the WLC GUI.",
  whyItMatters:
    "L2 misconfiguration is the #1 cause of campus outages. The exam aggressively tests VLAN, trunk and STP scenarios.",
  whatBullets: [
    "VLAN configuration, voice VLAN, native VLAN.",
    "802.1Q trunks — tagging, native VLAN mismatch troubleshooting.",
    "CDP and LLDP for neighbor discovery.",
    "Layer-2 EtherChannel using LACP (active/passive).",
    "Rapid PVST+: root bridge election, port roles, port states.",
    "Cisco wireless architectures: autonomous, cloud-based, split-MAC.",
    "WLC GUI: build a WPA2-PSK WLAN end to end.",
  ],
  whoBody: "Campus network admins, wireless engineers, NetOps and CCNA candidates.",
  whenBody: "Days 8–13 of the 30-day plan, immediately after fundamentals.",
  whereBody: "Packet Tracer for switching labs; simulated WLC GUI for wireless.",
  howBullets: [
    "Day 8 — VLANs and access ports.",
    "Day 9 — 802.1Q trunks, native VLAN, DTP.",
    "Day 10 — CDP/LLDP and EtherChannel/LACP.",
    "Day 11 — Rapid PVST+ root bridge and port roles.",
    "Day 12 — Wireless architectures and AP modes.",
    "Day 13 — WLC GUI: build a WLAN.",
  ],
  keyTerms: [
    { term: "Native VLAN", definition: "The untagged VLAN on an 802.1Q trunk; default 1; mismatches cause silent drops." },
    { term: "LACP", definition: "Standards-based link aggregation protocol; modes 'active' and 'passive'." },
    { term: "Rapid PVST+", definition: "Cisco per-VLAN rapid spanning tree; faster convergence than 802.1D." },
    { term: "Split-MAC", definition: "Wireless model where the WLC handles control while the AP handles real-time RF (CAPWAP)." },
  ],
  pitfalls: [
    "Mismatched native VLANs on a trunk — generates STP errors.",
    "Configuring EtherChannel with mismatched modes (active/active works; passive/passive does NOT).",
    "Forgetting `switchport mode access` before assigning a VLAN.",
  ],
  faqs: [
    { q: "Difference between PVST+ and Rapid PVST+?", a: "Rapid PVST+ converges in seconds (802.1w) vs ~50s for legacy PVST+." },
    { q: "Which EtherChannel mode pairs work?", a: "LACP active/active and active/passive; PAgP desirable/desirable and desirable/auto. Never on/anything-else with negotiation." },
  ],
  selfCheck: [
    {
      question: "Which command makes interface Gi0/1 a trunk allowing only VLANs 10 and 20?",
      options: [
        "switchport mode access; switchport access vlan 10",
        "switchport trunk encapsulation dot1q; switchport mode trunk; switchport trunk allowed vlan 10,20",
        "vlan 10,20",
        "switchport voice vlan 10",
      ],
      correctIndex: 1,
      explanation: "You set encapsulation, switch to trunk mode, then prune the allowed list.",
    },
  ],
  examTips: [
    "Root bridge = lowest bridge ID (priority + MAC).",
    "Always check `show interfaces trunk` for native VLAN matches.",
  ],
  reading: [
    { label: "Catalyst VLAN configuration guide", url: "https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/17-3/configuration_guide/vlan/b_173_vlan_9300_cg.html" },
  ],
});

/* ------------------------------------------------------------------ */
/* Module 3 — IP Connectivity (25%)                                    */
/* ------------------------------------------------------------------ */
const m3 = makeModule({
  slug: "ccna-ip-connectivity",
  title: "IP Connectivity",
  pct: "25%",
  tagline: "Routing table anatomy, static routes, single-area OSPFv2 and First Hop Redundancy.",
  overview:
    "Module 3 is the largest section of CCNA. You learn how routers decide where to forward packets, how to write IPv4 and IPv6 static routes (including default and floating), how single-area OSPFv2 elects neighbors and builds the LSDB, and how FHRPs (HSRP/VRRP/GLBP) provide gateway redundancy.",
  whyItMatters:
    "25% of the blueprint. OSPF and static routing show up in nearly every troubleshooting and lab simulation question.",
  whatBullets: [
    "Routing table components: prefix, AD, metric, next-hop, exit interface.",
    "Forwarding decision: longest match, AD tiebreak, metric tiebreak, ECMP.",
    "IPv4 & IPv6 static routing — connected, recursive, fully-specified, default, floating.",
    "Single-area OSPFv2: neighbor states, DR/BDR election, router-id, network types.",
    "FHRP concepts (HSRP, VRRP, GLBP) — virtual IP/MAC, active/standby.",
  ],
  whoBody: "Routing engineers, NOC, and every CCNA candidate.",
  whenBody: "Days 14–20 of the 30-day plan.",
  whereBody: "Packet Tracer multi-router topologies + simulated IOS.",
  howBullets: [
    "Day 14 — Routing table & forwarding decision.",
    "Day 15 — IPv4 static routing.",
    "Day 16 — IPv6 static routing & default route.",
    "Day 17–18 — OSPFv2 single-area config & verification.",
    "Day 19 — DR/BDR election & network types.",
    "Day 20 — FHRP overview (HSRP focus).",
  ],
  keyTerms: [
    { term: "Administrative Distance", definition: "Trustworthiness of a routing source. Lower wins. Connected=0, Static=1, OSPF=110, RIP=120." },
    { term: "Floating static", definition: "A static route with AD higher than the dynamic protocol so it activates only on failover." },
    { term: "DR/BDR", definition: "Designated and Backup Designated Router on broadcast OSPF segments — reduces adjacency mesh." },
    { term: "HSRP", definition: "Cisco-proprietary FHRP; one active router answers ARP for the virtual IP." },
  ],
  pitfalls: [
    "Forgetting `no shutdown` after configuring an interface.",
    "Mismatched OSPF hello/dead timers preventing neighbor formation.",
    "Setting AD too low on a floating static so it becomes the preferred path.",
  ],
  faqs: [
    { q: "Why does OSPF stay in EXSTART/EXCHANGE?", a: "Almost always an MTU mismatch on the link." },
    { q: "Default AD of OSPF vs EIGRP?", a: "OSPF=110, internal EIGRP=90, external EIGRP=170." },
  ],
  selfCheck: [
    {
      question: "Which route wins: 10.0.0.0/24 via OSPF (AD 110) vs 10.0.0.0/24 via static (AD 1)?",
      options: ["OSPF", "Static", "Both load-balance", "Neither — conflict"],
      correctIndex: 1,
      explanation: "Lower AD wins. Static = 1 beats OSPF = 110.",
    },
    {
      question: "On a broadcast network, OSPF elects:",
      options: ["Root and backup root", "DR and BDR", "Active and standby", "Master and slave"],
      correctIndex: 1,
      explanation: "DR/BDR election occurs on broadcast and NBMA networks.",
    },
  ],
  examTips: [
    "Always verify with `show ip route`, `show ip ospf neighbor`, `show ip protocols`.",
    "Router-ID = highest loopback, then highest active interface — unless set manually.",
  ],
  reading: [
    { label: "OSPF design guide", url: "https://www.cisco.com/c/en/us/support/docs/ip/open-shortest-path-first-ospf/7039-1.html" },
  ],
});

/* ------------------------------------------------------------------ */
/* Module 4 — IP Services (10%)                                        */
/* ------------------------------------------------------------------ */
const m4 = makeModule({
  slug: "ccna-ip-services",
  title: "IP Services",
  pct: "10%",
  tagline: "NAT, NTP, DHCP, DNS, SNMP, syslog, QoS, SSH and file transfer.",
  overview:
    "Module 4 covers the everyday services that keep a network operational: inside-source NAT (static, dynamic, PAT), DHCP server/relay, DNS, NTP, SNMPv2c/v3, syslog severity levels, QoS per-hop behavior, and secure management with SSH plus TFTP/FTP for IOS image transfers.",
  whyItMatters:
    "Day-to-day operations live in this module. Misconfigured NAT or DHCP relay breaks user connectivity instantly.",
  whatBullets: [
    "Inside-source NAT: static, dynamic, PAT (overload).",
    "NTP modes: client, server, symmetric.",
    "DHCP server and DHCP relay (`ip helper-address`).",
    "DNS host resolution and `ip name-server`.",
    "SNMP v2c vs v3 (auth + priv).",
    "Syslog severity levels 0–7.",
    "QoS PHB: classification, marking, queuing, shaping, policing.",
    "SSH config + TFTP/FTP for IOS upgrades.",
  ],
  whoBody: "NetOps, NOC engineers and CCNA candidates.",
  whenBody: "Days 21–24 of the 30-day plan.",
  whereBody: "Simulated IOS CLI + Packet Tracer end-host PCs.",
  howBullets: [
    "Day 21 — NAT/PAT lab with inside/outside interfaces.",
    "Day 22 — DHCP server & relay across subnets.",
    "Day 23 — NTP, syslog severity, SNMP communities.",
    "Day 24 — SSH hardening and IOS image upgrade with TFTP.",
  ],
  keyTerms: [
    { term: "PAT", definition: "Port Address Translation — many private addresses share one public IP via L4 ports." },
    { term: "ip helper-address", definition: "Forwards DHCPDISCOVER broadcasts as unicast to a remote DHCP server." },
    { term: "Syslog severity", definition: "0=emergency … 7=debugging. Lower = more critical." },
    { term: "Stratum", definition: "NTP hierarchy level. Stratum 1 = directly attached to a reference clock." },
  ],
  pitfalls: [
    "Forgetting `ip nat inside` / `ip nat outside` on the right interfaces.",
    "Configuring DHCP exclude AFTER pool — exclusions still apply but order trips up new admins.",
    "Using SNMPv2c communities in production (no encryption).",
  ],
  faqs: [
    { q: "How do I let SSH but block Telnet?", a: "`transport input ssh` on the vty lines." },
  ],
  selfCheck: [
    {
      question: "Which command enables PAT using interface Gi0/1's IP?",
      options: [
        "ip nat inside source list 1 interface Gi0/1 overload",
        "ip nat outside source static 10.0.0.1 1.1.1.1",
        "ip nat pool POOL 1.1.1.1 1.1.1.10 prefix-length 24",
        "ip helper-address Gi0/1",
      ],
      correctIndex: 0,
      explanation: "`overload` keyword enables PAT using the named interface's address.",
    },
  ],
  examTips: [
    "Memorise syslog levels and the QoS DSCP markings (EF=46, AF31=26, CS6=48).",
    "DHCP relay = `ip helper-address` on the SVI / interface facing clients.",
  ],
  reading: [
    { label: "Cisco NAT configuration guide", url: "https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/ipaddr_nat/configuration/xe-16/nat-xe-16-book.html" },
  ],
});

/* ------------------------------------------------------------------ */
/* Module 5 — Security Fundamentals (15%)                              */
/* ------------------------------------------------------------------ */
const m5 = makeModule({
  slug: "ccna-security-fundamentals",
  title: "Security Fundamentals",
  pct: "15%",
  tagline: "Threats & mitigations, ACLs, port security, DAI, AAA and wireless security.",
  overview:
    "Module 5 covers L2/L3 security primitives: common threats and mitigations, device hardening (passwords, banner, SSH-only), standard and extended ACLs, port security, DHCP snooping, Dynamic ARP Inspection, AAA with RADIUS/TACACS+, and the wireless security families WPA/WPA2/WPA3 + WPA-Enterprise (802.1X).",
  whyItMatters:
    "Every modern network is hostile. The exam tests both knowledge of attacks (MAC flooding, ARP spoofing, rogue DHCP) and the IOS commands that mitigate them.",
  whatBullets: [
    "Security concepts: threats, vulnerabilities, exploits, mitigations.",
    "Device hardening: enable secret, service password-encryption, banner, SSH-only.",
    "Standard & extended numbered + named ACLs.",
    "Port security (sticky MAC, violation modes).",
    "DHCP snooping + Dynamic ARP Inspection (DAI).",
    "AAA with RADIUS / TACACS+.",
    "Wireless security: WPA, WPA2, WPA3, PSK vs Enterprise (802.1X).",
  ],
  whoBody: "Network admins doubling as security engineers, plus every CCNA candidate.",
  whenBody: "Days 25–27 of the 30-day plan.",
  whereBody: "Packet Tracer + WLC GUI (for wireless security).",
  howBullets: [
    "Day 25 — Device hardening + SSH + banner.",
    "Day 26 — Standard and extended ACL labs.",
    "Day 27 — Port security, DHCP snooping, DAI; wireless WPA2/WPA3 PSK.",
  ],
  keyTerms: [
    { term: "Extended ACL", definition: "Filters by source, destination, protocol and L4 port (range 100–199 / 2000–2699)." },
    { term: "Sticky MAC", definition: "Port-security feature that learns then permanently assigns MAC addresses." },
    { term: "DAI", definition: "Dynamic ARP Inspection — uses the DHCP snooping binding table to drop spoofed ARPs." },
    { term: "WPA3-SAE", definition: "Replaces PSK 4-way handshake with Simultaneous Authentication of Equals — resists offline cracking." },
  ],
  pitfalls: [
    "Placing extended ACLs too far from the source (best practice = closest to source).",
    "Trusting an uplink port for DHCP snooping is required — forgetting `ip dhcp snooping trust` on it.",
    "Confusing `permit any` order — implicit deny at end means rule order matters.",
  ],
  faqs: [
    { q: "Difference between RADIUS and TACACS+?", a: "RADIUS = UDP 1812/1813, encrypts only password, AAA combined. TACACS+ = TCP 49, encrypts entire payload, AAA separated. Cisco prefers TACACS+ for device admin." },
  ],
  selfCheck: [
    {
      question: "On which interfaces should DHCP snooping `trust` be configured?",
      options: ["All access ports", "All trunk and DHCP-server-facing ports", "Only the SVI", "None — trust all"],
      correctIndex: 1,
      explanation: "Trust uplinks toward legitimate DHCP servers; leave end-user access ports untrusted.",
    },
  ],
  examTips: [
    "Standard ACL = source only, place close to destination. Extended = src+dst+L4, place close to source.",
    "WPA3 → SAE; WPA2-Enterprise → 802.1X + RADIUS.",
  ],
  reading: [
    { label: "Cisco IOS security configuration guide", url: "https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/security/config_library/15-mt/secuser-15-mt-library.html" },
  ],
});

/* ------------------------------------------------------------------ */
/* Module 6 — Automation & Programmability (10%)                       */
/* ------------------------------------------------------------------ */
const m6 = makeModule({
  slug: "ccna-automation-programmability",
  title: "Automation & Programmability",
  pct: "10%",
  tagline: "SDN, controllers, REST APIs, JSON, Ansible, Terraform and AI/ML in NetOps.",
  overview:
    "Module 6 introduces the modern NetOps toolchain: traditional vs controller-based networking, software-defined networking concepts, Cisco DNA Center / Catalyst Center, REST APIs and JSON payloads, configuration management with Ansible and Terraform, and the role of AI/ML in network operations.",
  whyItMatters:
    "The industry is moving from box-by-box CLI to API-driven automation. CCNA v1.1 expanded this section — expect API/JSON questions on the exam.",
  whatBullets: [
    "Traditional vs controller-based architectures (SDN).",
    "Cisco DNA Center / Catalyst Center overview.",
    "REST API verbs (GET, POST, PUT, DELETE) and authentication.",
    "JSON syntax — objects, arrays, types.",
    "Ansible (agentless, YAML playbooks) vs Terraform (declarative, HCL).",
    "AI/ML use-cases in network operations (anomaly detection, predictive maintenance).",
  ],
  whoBody: "NetOps automation engineers, DevNet aspirants, CCNA candidates.",
  whenBody: "Days 28–30 of the 30-day plan.",
  whereBody: "Postman + Cisco DevNet sandbox; Ansible/Terraform on a local VM or Cloud Shell.",
  howBullets: [
    "Day 28 — SDN concepts + Catalyst Center tour.",
    "Day 29 — REST API + JSON walkthrough with Postman.",
    "Day 30 — Ansible playbook & Terraform plan against a sandbox.",
  ],
  keyTerms: [
    { term: "REST", definition: "Representational State Transfer — stateless HTTP API style using verbs and resource URIs." },
    { term: "JSON", definition: "JavaScript Object Notation — text format for key/value data exchanged by REST APIs." },
    { term: "Ansible", definition: "Agentless automation tool that pushes YAML playbooks over SSH or APIs." },
    { term: "Terraform", definition: "Declarative infrastructure-as-code tool using HashiCorp Configuration Language (HCL)." },
  ],
  pitfalls: [
    "Confusing PUT (replace) with PATCH (partial update).",
    "Forgetting Content-Type: application/json header on POST.",
    "Treating Ansible as agent-based — it is agentless.",
  ],
  faqs: [
    { q: "Is the CCNA exam programming-heavy?", a: "No. You read JSON and identify HTTP verbs; you don't write code." },
    { q: "DNA Center vs Catalyst Center?", a: "Same product — Cisco rebranded DNA Center to Catalyst Center in 2024." },
  ],
  selfCheck: [
    {
      question: "Which HTTP verb is idempotent and replaces a resource?",
      options: ["GET", "POST", "PUT", "PATCH"],
      correctIndex: 2,
      explanation: "PUT replaces and is idempotent. POST creates (not idempotent). PATCH partially updates.",
    },
    {
      question: "Which automation tool is agentless and uses YAML?",
      options: ["Puppet", "Chef", "Ansible", "Terraform"],
      correctIndex: 2,
      explanation: "Ansible is agentless over SSH/APIs and uses YAML playbooks.",
    },
  ],
  examTips: [
    "Memorise REST verbs and typical status codes (200, 201, 400, 401, 404, 500).",
    "Recognise JSON: `{}` = object, `[]` = array, strings always in double quotes.",
  ],
  reading: [
    { label: "Cisco DevNet learning labs", url: "https://developer.cisco.com/learning/" },
  ],
});

/* ------------------------------------------------------------------ */
/* Lookup                                                              */
/* ------------------------------------------------------------------ */
const all: Record<string, ModuleExplanation> = {
  "ccna-tool-tour": toolTour,
  "ccna-network-fundamentals": m1,
  "ccna-network-access": m2,
  "ccna-ip-connectivity": m3,
  "ccna-ip-services": m4,
  "ccna-security-fundamentals": m5,
  "ccna-automation-programmability": m6,
};

export function getCcnaModuleExplanation(slug: string): ModuleExplanation | undefined {
  return all[slug];
}
