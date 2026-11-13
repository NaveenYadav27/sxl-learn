import type { Lesson } from "../../types";
import { BRUTE_FORCE } from "../scenarios";

export const LESSON_01: Lesson = {
  id: "l01",
  number: 1,
  title: "Foundations of SOC & Alert Triage",
  tagline: "Understand SOC architecture, analyst tiers, and prioritize incoming alerts.",
  durationMin: 60,
  scenarioId: BRUTE_FORCE.id,
  heroTermIds: [
    "soc",
    "siem",
    "analyst-tiers",
    "alert",
    "notable",
    "incident",
    "triage",
    "false-positive",
    "true-positive",
    "incident-review"
  ],
  objectives: [
    "Understand the core function and architecture of a modern Security Operations Center (SOC).",
    "Distinguish between raw log events, detection alerts, notable events, and confirmed incidents.",
    "Learn the tier escalation path: L1 triage, L2 deep investigation, and L3 hunting/engineering.",
    "Classify alert urgency using asset context, adversary intent, and impact."
  ],
  concept: [
    {
      kind: "heading",
      text: "The Role of the Modern SOC"
    },
    {
      kind: "p",
      text: "A [[soc|Security Operations Center (SOC)]] is the defensive nerve center of an enterprise. It continuously monitors, identifies, investigates, and responds to cybersecurity incidents. Rather than inspecting every mundane packet manually, the SOC relies on a [[siem|SIEM]] to ingest telemetry across servers, endpoints, cloud services, and network firewalls."
    },
    {
      kind: "flow",
      title: "The SOC Alert-to-Incident Lifecycle",
      steps: [
        "Raw Telemetry Ingestion (Sysmon, EventLogs, Firewall, Cloud)",
        "Correlation & Detection Rules Trigger in SIEM",
        "Notable Event Generated in Incident Review",
        "Tier-1 Analyst Triage & Initial Disposition",
        "Tier-2 Deep Investigation & Evidence Gathering",
        "Containment, Eradication & Post-Incident Review"
      ]
    },
    {
      kind: "heading",
      text: "Analyst Tiers and Responsibilities"
    },
    {
      kind: "p",
      text: "Enterprise security operations are structured into specialized [[analyst-tiers|analyst tiers]]. Tier 1 focuses on alert monitoring, initial validation, and dispositioning benign noise from true attacks. Tier 2 performs forensic pivoting, timeline reconstruction, and playbook execution. Tier 3 drives proactive threat hunting, malware reverse engineering, and detection engineering."
    },
    {
      kind: "table",
      title: "SOC Roles Comparison",
      cols: ["Tier", "Primary Role", "Key Activities", "Time Spent"],
      rows: [
        ["Tier 1 (Triage Analyst)", "First responder", "Review alerts in Incident Review, weed out false positives, escalate real threats", "10-20 min per notable"],
        ["Tier 2 (IR Analyst)", "Incident investigator", "Root-cause analysis, host isolation, timeline building, evidence collection", "Hours to days"],
        ["Tier 3 (Hunter / Engineer)", "Advanced defense", "Hypothesis-driven threat hunting, SPL correlation search tuning, tool development", "Long-term projects"]
      ]
    },
    {
      kind: "heading",
      text: "Alert vs Notable vs Incident"
    },
    {
      kind: "p",
      text: "One of the most important concepts for a junior analyst is the distinction between an **alert**, a **notable event**, and an **incident**. An alert is an automated signal that a rule matched. A [[notable|notable event]] is a correlation event surfaced in Splunk ES [[incident-review|Incident Review]]. An [[incident|incident]] is an escalated, confirmed event that jeopardizes business confidentiality, integrity, or availability."
    },
    {
      kind: "callout",
      tone: "info",
      title: "Triage Golden Rule",
      text: "Never disposition an alert as false positive without evidence. Document the exact field, user context, or host behavior that justifies your verdict."
    }
  ],
  visual: [
    {
      kind: "heading",
      text: "SOC Operational Architecture"
    },
    {
      kind: "layers",
      title: "Enterprise Defense-in-Depth Architecture",
      lanes: [
        { label: "Data Sources", items: ["Endpoints (Sysmon/EDR)", "Network Firewalls", "Cloud Audit (AWS/Azure)", "Identity (Active Directory/Okta)"] },
        { label: "Ingestion & Normalization", items: ["Splunk Universal Forwarders", "Syslog-ng", "CIM Data Models"] },
        { label: "Analytics & Detection", items: ["Correlation Searches", "Risk-Based Alerting", "Threat Intel Lookups"] },
        { label: "Triage & Response", items: ["Incident Review Queue", "SOAR Automated Actions", "Analyst Escalation Hand-off"] }
      ]
    },
    {
      kind: "funnel",
      title: "Daily Telemetry Funnel",
      stages: [
        { label: "Raw Daily Events", value: "50,000,000+", note: "Across all enterprise endpoints and network sensors" },
        { label: "Filtered Telemetry", value: "2,500,000", note: "Security-relevant indices (auth, sysmon, network)" },
        { label: "Detection Alerts", value: "450", note: "Correlation rules and threshold triggers" },
        { label: "Triaged Notables", value: "35", note: "Surfaced in Incident Review for Tier 1 review" },
        { label: "Confirmed Incidents", value: "1 - 3", note: "Escalated for immediate cross-team containment" }
      ]
    }
  ],
  demo: [
    {
      id: "d01",
      title: "Starting the Shift: Incident Review",
      narration: "When beginning a SOC shift, open [[incident-review|Incident Review]] to inspect newly generated [[notable|notables]]. Prioritize Critical and High urgency items first.",
      screen: {
        area: "Incident Review",
        focus: "Urgency and Time columns",
        detail: [
          "Check the urgency badge: Critical notables take immediate precedence.",
          "Inspect the rule name: does it indicate credential abuse, malware, or perimeter scanning?",
          "Review the affected asset and identity before opening the drill-down."
        ]
      }
    },
    {
      id: "d02",
      title: "Evaluating Context: Benign vs Threat",
      narration: "A single failed login is usually a human typo. A burst of 40 failures followed by success indicates a [[true-positive|True Positive]] brute force intrusion.",
      screen: {
        area: "Notable Details Panel",
        focus: "Event count and source IP",
        detail: [
          "Compare the user account to standard business hours.",
          "Check the source IP against known VPN pools or external threat lists.",
          "Distinguish noise from active lateral movement."
        ]
      }
    }
  ],
  lab: {
    kind: "console",
    scenarioId: BRUTE_FORCE.id,
    objectives: [
      {
        id: "l01-obj-1",
        title: "Navigate to Security Posture",
        instruction: "Open the [[security-posture|Security Posture]] dashboard in the Splunk ES console to inspect high-level notable metrics.",
        action: { type: "navigate", to: "security-posture" },
        hints: [
          "Look at the navigation tabs at the top of the Splunk ES simulator.",
          "Security Posture gives an executive overview of all notable events.",
          "Click the 'Security Posture' button in the simulator navigation bar.",
          "The top-left navigation options include Search, Security Posture, Incident Review.",
          "Click 'Security Posture' in the top navigation bar."
        ],
        why: "Every shift starts with checking enterprise security posture and current notable distribution.",
        skill: "foundations"
      },
      {
        id: "l01-obj-2",
        title: "Open Incident Review",
        instruction: "Navigate to [[incident-review|Incident Review]] to view the live queue of notable events awaiting triage.",
        action: { type: "navigate", to: "incident-review" },
        hints: [
          "Find the 'Incident Review' tab in the top navigation bar.",
          "Incident Review is where Tier-1 analysts spend the majority of their shift.",
          "Click the 'Incident Review' button next to Security Posture.",
          "Incident Review displays all notable events generated by correlation searches.",
          "Click 'Incident Review' in the top bar."
        ],
        why: "Incident Review is the operational workspace where analysts claim, triage, and disposition notables.",
        skill: "triage"
      },
      {
        id: "l01-obj-3",
        title: "Classify Triage Alert Queue",
        instruction: "Review the incoming alerts on the Triage Board below the simulator and classify each alert by priority (Critical, High, Medium, Low).",
        action: { type: "click", target: "triage-all-correct" },
        hints: [
          "Look at the Triage Board located below the Splunk ES console.",
          "Evaluate asset criticality and adversary intent for each of the 5 alerts.",
          "Mimikatz on DC01 is Critical; firewall blocked port scans are Low.",
          "C2 beaconing and brute-force with geo-anomaly are High priority.",
          "Classify all 5 cards correctly to trigger the completion event."
        ],
        why: "Accurate triage ensures critical endpoint compromises are contained before damage occurs.",
        skill: "triage"
      }
    ],
    triageAlerts: [
      {
        id: "al-1",
        title: "Critical Domain Controller Privilege Escalation",
        source: "Active Directory / EDR",
        detail: "Mimikatz LSASS memory read detected on DC01 by user svc_backup",
        answer: "critical",
        why: "Direct credential extraction on primary identity infrastructure requires immediate containment."
      },
      {
        id: "al-2",
        title: "Outbound C2 Beaconing to Uncategorized Domain",
        source: "Palo Alto Firewall",
        detail: "Periodic 60-second jittered HTTPS requests from ws-fin-12 to darkfleet-c2.top",
        answer: "high",
        why: "Command & Control beaconing confirms an established foothold requiring workstation isolation."
      },
      {
        id: "al-3",
        title: "Repeated External SSH Port Scan",
        source: "Edge Perimeter Firewall",
        detail: "15 connection attempts from external IP 198.51.100.99 to DMZ port 22 dropped by policy FW-DENY",
        answer: "low",
        why: "Standard internet background reconnaissance already blocked by edge perimeter policy."
      },
      {
        id: "al-4",
        title: "Multiple Failed Logins Followed by Successful VPN Auth",
        source: "Cisco ASA VPN / Okta",
        detail: "42 bad password attempts followed by successful logon from Moldova IP 203.0.113.5",
        answer: "high",
        why: "Password spray / brute force ending in successful authentication from an unexpected geography."
      },
      {
        id: "al-5",
        title: "PowerShell Execution Policy Bypass Attempt",
        source: "Defender for Endpoint",
        detail: "Developer workstation dev-test-box executed script with -ExecutionPolicy Bypass",
        answer: "medium",
        why: "Potential policy violation or developer activity; requires verification before escalation."
      }
    ]
  },
  assessment: [
    {
      id: "l01-q1",
      prompt: "What is the primary operational role of a Tier-1 SOC analyst?",
      options: [
        "First-look alert triage, false-positive elimination, and incident escalation",
        "Authoring complex kernel drivers for threat mitigation",
        "Conducting external red team attacks against competitors",
        "Configuring data center hardware switches and cabling"
      ],
      answer: 0,
      explain: "Tier-1 analysts are the first line of defense, responsible for triaging incoming notables and escalating verified threats.",
      skill: "foundations"
    },
    {
      id: "l01-q2",
      prompt: "What is the fundamental difference between an 'alert' and an 'incident'?",
      options: [
        "An alert is an automated detection signal; an incident is a confirmed security threat that requires active response",
        "An alert only comes from firewalls, while incidents come from antivirus",
        "Incidents are always false positives, while alerts are always true positives",
        "There is no difference; they are exact synonyms in modern SOCs"
      ],
      answer: 0,
      explain: "An alert is triggered whenever a detection rule matches. An incident is declared only when triage confirms an actual security breach.",
      skill: "triage"
    },
    {
      id: "l01-q3",
      prompt: "Why is a Mimikatz memory dump on a Domain Controller classified as Critical?",
      options: [
        "It represents direct credential access on the core identity server of the entire organization",
        "It consumes too much CPU bandwidth on the domain controller",
        "Because it is an expired software license warning",
        "Because it only affects print servers"
      ],
      answer: 0,
      explain: "Domain controllers house Kerberos keys and Active Directory hashes. Compromise of a DC is an enterprise-wide catastrophic event.",
      skill: "triage"
    },
    {
      id: "l01-q4",
      prompt: "Which Splunk Enterprise Security dashboard provides the primary workspace for analysts to review, assign, and disposition notables?",
      options: [
        "Incident Review",
        "Glass Tables",
        "User Activity Audit",
        "Data Model Acceleration"
      ],
      answer: 0,
      explain: "Incident Review is the central analyst queue where notables are tracked, triaged, and dispositioned.",
      skill: "foundations"
    },
    {
      id: "l01-q5",
      prompt: "When is it acceptable to close a notable as a False Positive?",
      options: [
        "When corroborated evidence proves the observed behavior is benign, authorized, or caused by a flawed rule",
        "Whenever the queue is too long and the shift is ending",
        "Only when the attacker sends an email apologizing",
        "Never; every notable must result in shutting down the entire enterprise"
      ],
      answer: 0,
      explain: "False positive dispositioning must always be supported by documented, verifiable evidence (such as approved change tickets or benign behavior).",
      skill: "triage"
    },
    {
      id: "l01-q6",
      prompt: "What is the consequence of an analyst improperly categorizing a True Positive alert as False Positive?",
      options: [
        "An active adversary intrusion remains undetected and uncontained inside the network",
        "The SIEM software automatically uninstalls itself",
        "All user passwords are automatically rotated",
        "Network latency increases by 5%"
      ],
      answer: 0,
      explain: "Dismissing a true attack allows the adversary to establish persistence, move laterally, and exfiltrate sensitive data without interference.",
      skill: "triage"
    }
  ],
  reflection: [
    {
      id: "l01-r1",
      prompt: "Why must SOC triage prioritize alerts based on asset criticality and potential business impact rather than first-come first-served order?",
      placeholder: "Explain the risks of FIFO queue processing in high-volume security operations..."
    },
    {
      id: "l01-r2",
      prompt: "What information would you require in a handoff note when escalating an alert from Tier 1 to Tier 2?",
      placeholder: "List the essential evidence points (host, user, IOC, timestamps, reason for escalation)..."
    }
  ],
  mentorBriefing: "Welcome to Lesson 1! I am your AI SOC Mentor. In this foundational lesson, focus on understanding how telemetry flows from endpoints and firewalls into Splunk ES, why Tier 1 triage is crucial, and how to assess alert priority using asset context.",
  challenges: [
    "Why might a legitimate system administrator action trigger a High urgency notable?",
    "What telemetry source would you check first if you suspect an alert is a benign backup job?",
    "How does the concept of 'dwell time' relate to analyst triage efficiency?",
    "What is the difference between a False Positive and a Benign Positive?"
  ]
};
