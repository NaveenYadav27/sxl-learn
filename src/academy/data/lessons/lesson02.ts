import type { Lesson, LabObjective, LogQuestion } from "../../types";
import { BRUTE_FORCE } from "../scenarios";

const failEvents = BRUTE_FORCE.events.filter((e) => e.fields.EventCode === 4625);
const successEvents = BRUTE_FORCE.events.filter((e) => e.fields.EventCode === 4624 && e.fields.user === "j.doe");
const vpnEvents = BRUTE_FORCE.events.filter((e) => e.index === "vpn");
const rdpEvents = BRUTE_FORCE.events.filter((e) => e.fields.app === "win:rdp");

const curatedEventIds = [
  failEvents[0]?.id,
  failEvents[5]?.id,
  failEvents[Math.floor(failEvents.length / 2)]?.id,
  failEvents[failEvents.length - 1]?.id,
  successEvents[0]?.id,
  vpnEvents[0]?.id,
  rdpEvents[0]?.id,
].filter((id): id is string => typeof id === "string");

const q1: LogQuestion = {
  id: "l02-q1-ec",
  prompt: "What Windows Security EventCode denotes a failed logon attempt?",
  kind: "choice",
  options: ["4624", "4625", "4688", "1102"],
  answer: "4625"
};

const q2: LogQuestion = {
  id: "l02-q2-ip",
  prompt: "Which external IP address generated the repetitive authentication failures?",
  kind: "choice",
  options: ["10.0.3.7", "203.0.113.5", "198.51.100.1", "10.8.0.44"],
  answer: "203.0.113.5"
};

const q3: LogQuestion = {
  id: "l02-q3-user",
  prompt: "Which specific user account was targeted in the rapid brute force sequence?",
  kind: "choice",
  options: ["administrator", "a.kumar", "j.doe", "svc_backup"],
  answer: "j.doe"
};

const q4: LogQuestion = {
  id: "l02-q4-success",
  prompt: "Which Windows Security EventCode denotes a successful logon immediately following the burst?",
  kind: "choice",
  options: ["4624", "4625", "4672", "4720"],
  answer: "4624"
};

const q5: LogQuestion = {
  id: "l02-q5-rdp",
  prompt: "Which service/application did the attacker connect to after establishing VPN access?",
  kind: "choice",
  options: ["win:rdp", "ssh", "smb", "http"],
  answer: "win:rdp"
};

const objectives: LabObjective[] = [
  {
    id: q1.id,
    title: "Identify Logon Failure EventCode",
    instruction: "Inspect the raw Windows event logs and identify the EventCode representing an authentication failure.",
    action: { type: "select", target: "log-answer", value: `${q1.id}=${q1.answer}` },
    hints: [
      "Review the raw event list in the lab panel.",
      "Look for events with action='failure' under sourcetype WinEventLog:Security.",
      "EventCode 4624 is success; EventCode 4625 is failure.",
      "Select EventCode 4625 from the options.",
      "Choose 4625."
    ],
    why: "EventCode 4625 is the universal telemetry signal for Windows logon failures.",
    skill: "logs"
  },
  {
    id: q2.id,
    title: "Identify Adversary Source IP",
    instruction: "Locate the external source IP address originating the password attack against j.doe.",
    action: { type: "select", target: "log-answer", value: `${q2.id}=${q2.answer}` },
    hints: [
      "Look at the src_ip field inside the EventCode 4625 raw events.",
      "Compare internal subnet 10.0.3.x with the external public IP.",
      "The external IP begins with 203.0.113.x.",
      "Select 203.0.113.5.",
      "Choose 203.0.113.5."
    ],
    why: "Isolating the attacker's source IP is critical for perimeter blocking and firewall shunning.",
    skill: "logs"
  },
  {
    id: q3.id,
    title: "Identify Compromised Account Target",
    instruction: "Determine the targeted user account that sustained dozens of repeated password guesses.",
    action: { type: "select", target: "log-answer", value: `${q3.id}=${q3.answer}` },
    hints: [
      "Look at the 'user' field in the repeated failure events.",
      "Notice a.kumar only had 3 typos, whereas another user had over 40 attempts.",
      "The victim username is j.doe.",
      "Select j.doe from the options.",
      "Choose j.doe."
    ],
    why: "Knowing the targeted account dictates password resets and credential revocation.",
    skill: "logs"
  },
  {
    id: q4.id,
    title: "Identify Successful Logon EventCode",
    instruction: "Identify the Windows EventCode that proved the attacker successfully guessed the password.",
    action: { type: "select", target: "log-answer", value: `${q4.id}=${q4.answer}` },
    hints: [
      "Look at the event immediately following the failure sequence from 203.0.113.5.",
      "Notice the action flips from 'failure' to 'success'.",
      "EventCode 4624 records a successful Windows authentication.",
      "Select 4624 from the options.",
      "Choose 4624."
    ],
    why: "Confirming a success turns an uncoordinated brute force attempt into a critical Account Takeover.",
    skill: "logs"
  },
  {
    id: q5.id,
    title: "Identify Post-Auth Lateral Application",
    instruction: "Identify the internal application protocol used once the attacker authenticated via VPN.",
    action: { type: "select", target: "log-answer", value: `${q5.id}=${q5.answer}` },
    hints: [
      "Check the host ws-fin-12 telemetry following the VPN connection.",
      "Look for app or protocol field values.",
      "The attacker initiated Remote Desktop Protocol.",
      "Select win:rdp from the options.",
      "Choose win:rdp."
    ],
    why: "Detecting RDP following VPN access indicates immediate interactive workstation control.",
    skill: "investigation"
  }
];

export const LESSON_02: Lesson = {
  id: "l02",
  number: 2,
  title: "Log Telemetry & Event Analysis",
  tagline: "Decode Windows security event logs, Sysmon, and network telemetry fields.",
  durationMin: 60,
  scenarioId: BRUTE_FORCE.id,
  heroTermIds: [
    "log",
    "event",
    "field",
    "sourcetype",
    "index",
    "sysmon",
    "wineventlog",
    "edr",
    "dns"
  ],
  objectives: [
    "Read and interpret raw Windows Security Event Logs (EventCode 4624 and 4625).",
    "Extract key fields: timestamp, host, user, source IP, logon type, and failure reason.",
    "Correlate events across heterogeneous sources (Windows, Cisco ASA VPN, Palo Alto firewall).",
    "Reconstruct an attack sequence from unstructured log telemetry."
  ],
  concept: [
    {
      kind: "heading",
      text: "The Structure of a Security Event Log"
    },
    {
      kind: "p",
      text: "A [[log|log]] is an immutable, timestamped record of an action taken by a computer system, application, or user. In SIEM platforms like Splunk, events are organized into [[index|indices]] (such as index=wineventlog, index=auth, index=firewall) and assigned a [[sourcetype|sourcetype]] that dictates how fields are extracted."
    },
    {
      kind: "p",
      text: "Every [[event|event]] is comprised of two parts: the **raw unparsed string** (what the operating system emitted) and **extracted [[field|fields]]** (key-value pairs such as `user=j.doe`, `src_ip=203.0.113.5`, `EventCode=4625`)."
    },
    {
      kind: "heading",
      text: "Critical Windows Authentication EventCodes"
    },
    {
      kind: "table",
      title: "Essential Windows Security Log EventCodes",
      cols: ["EventCode", "Meaning", "Critical Fields to Inspect", "Analyst Context"],
      rows: [
        ["4624", "Successful Logon", "user, src_ip, Logon_Type, target_host", "Verify if time, location, and Logon Type match expected role."],
        ["4625", "Failed Logon", "user, src_ip, Failure_Reason, Logon_Type", "Check failure burst count and sub-status codes (bad password vs unknown user)."],
        ["4672", "Special Privileges Assigned", "user, privileges list", "Fires immediately upon logon for administrative accounts (SeDebugPrivilege, etc.)."],
        ["4688", "New Process Created", "NewProcessName, CommandLine, ParentProcessName", "Shows exact program and command flags executed by the user or script."],
        ["4720", "User Account Created", "TargetUserName, SubjectUserName", "High-risk administrative action; verify change management authorization."]
      ]
    },
    {
      kind: "heading",
      text: "Understanding Windows Logon Types"
    },
    {
      kind: "p",
      text: "Windows authentication events specify a `Logon_Type` numerical code that reveals how the user connected:"
    },
    {
      kind: "grid",
      title: "Logon Types Cheat Sheet",
      items: [
        { title: "Logon Type 2 (Interactive)", text: "Physical console logon at the local keyboard and monitor." },
        { title: "Logon Type 3 (Network)", text: "Connection from the network (SMB share access, IIS web server, domain auth)." },
        { title: "Logon Type 4 (Batch)", text: "Scheduled task running under service account credentials." },
        { title: "Logon Type 5 (Service)", text: "Windows service daemon startup by the Service Control Manager." },
        { title: "Logon Type 10 (RemoteInteractive)", text: "Remote Desktop Protocol (RDP), RemoteFX, or Terminal Services session." }
      ]
    },
    {
      kind: "callout",
      tone: "tip",
      title: "Pivoting Across Telemetry Sources",
      text: "An attack is rarely contained within a single log source. Notice how the brute force starts on `wineventlog` (DC01), transitions to `vpn` (Cisco ASA), and finishes in `wineventlog` Logon Type 10 (ws-fin-12). Following fields across sources is called pivoting."
    }
  ],
  visual: [
    {
      kind: "heading",
      text: "Telemetry Field Extraction Flow"
    },
    {
      kind: "flow",
      title: "Raw Event to Parsed Schema",
      steps: [
        "Endpoint OS Generates Event (09:12:04 DC01 Security-Auditing 4625)",
        "Splunk Forwarder Ingests Raw Line & Tags sourcetype=WinEventLog:Security",
        "Field Extraction Extracts user='j.doe', src_ip='203.0.113.5', Logon_Type=3",
        "Analyst Queries Parsed Fields in SPL or Investigates in Log Analysis Lab"
      ]
    },
    {
      kind: "timeline",
      title: "Scenario Attack Progression",
      items: [
        { time: "09:02:10", label: "Benign user a.kumar mistypes password 3 times, succeeds at 09:03", tone: "ok" },
        { time: "09:12:04", label: "Attacker 203.0.113.5 begins rapid 42-attempt password burst against j.doe", tone: "warn" },
        { time: "09:15:20", label: "Password guessed; successful EventCode 4624 recorded for j.doe from 203.0.113.5", tone: "danger" },
        { time: "09:16:02", label: "Attacker connects to corporate VPN from Moldova geo-location", tone: "danger" },
        { time: "09:18:45", label: "Attacker connects via RDP (Logon Type 10) to ws-fin-12 workstation", tone: "danger" }
      ]
    }
  ],
  demo: [
    {
      id: "d01",
      title: "Inspecting Raw Windows Events",
      narration: "Examine the fields of an EventCode 4625 record. Notice the `src_ip`, `user`, and `Failure_Reason` fields.",
      screen: {
        area: "Raw Event Viewer",
        focus: "EventCode, user, and src_ip fields",
        detail: [
          "EventCode: 4625 indicates failure.",
          "user: j.doe identifies the victim account.",
          "src_ip: 203.0.113.5 pins down the origin."
        ]
      }
    },
    {
      id: "d02",
      title: "Tracing the Success Pivot",
      narration: "Right after attempt 42, find the EventCode 4624 record with the identical source IP and username.",
      screen: {
        area: "Timeline View",
        focus: "Timestamp and EventCode flip",
        detail: [
          "Timestamp 09:15:20 is less than 30 seconds after the last failure.",
          "Same source IP: 203.0.113.5.",
          "Confirms credential discovery and account compromise."
        ]
      }
    }
  ],
  lab: {
    kind: "logs",
    scenarioId: BRUTE_FORCE.id,
    intro: "Analyze the curated raw event telemetry from Scenario 1 (Brute Force → Account Takeover). Read each event's fields and answer the analytical questions to reconstruct the adversary's actions.",
    objectives,
    logEventIds: curatedEventIds,
    logQuestions: [q1, q2, q3, q4, q5]
  },
  assessment: [
    {
      id: "l02-q1",
      prompt: "Which Windows Security EventCode indicates a successful logon?",
      options: [
        "4624",
        "4625",
        "4688",
        "7045"
      ],
      answer: 0,
      explain: "Windows Security EventCode 4624 records successful authentication across all logon types.",
      skill: "logs"
    },
    {
      id: "l02-q2",
      prompt: "What does Windows Logon Type 10 signify?",
      options: [
        "RemoteInteractive logon (Remote Desktop Protocol / RDP)",
        "Local physical keyboard console logon",
        "Network share access via SMB",
        "Scheduled background batch script"
      ],
      answer: 0,
      explain: "Logon Type 10 is RemoteInteractive, standard for RDP sessions.",
      skill: "logs"
    },
    {
      id: "l02-q3",
      prompt: "How can an analyst distinguish between an accidental typo and an automated brute force attack?",
      options: [
        "Typo errors typically show 1-3 failures over several minutes; brute force bursts generate dozens of failures in rapid succession",
        "Typo errors always produce EventCode 9999",
        "Brute force attacks never show source IP addresses",
        "There is no way to differentiate them in log telemetry"
      ],
      answer: 0,
      explain: "Volume, velocity, and repetition against single or multiple accounts characterize automated attacks.",
      skill: "logs"
    },
    {
      id: "l02-q4",
      prompt: "What information in a VPN log raises immediate red flags after credential testing?",
      options: [
        "Geographic anomaly (e.g. login from unexpected country) combined with matching source IP",
        "The connection used port 443",
        "The user connected on a Tuesday",
        "The VPN client was Cisco AnyConnect"
      ],
      answer: 0,
      explain: "Impossible travel or anomalous geo-location right after authentication failures strongly indicates compromised credentials.",
      skill: "investigation"
    },
    {
      id: "l02-q5",
      prompt: "Why is Sysmon (System Monitor) widely deployed alongside native Windows Event Logs?",
      options: [
        "Sysmon provides rich process creation (Event 1) with full command-line arguments and process hashes (SHA256)",
        "Sysmon completely replaces the need for Active Directory",
        "Sysmon automatically blocks all inbound network traffic",
        "Sysmon is used exclusively for printer auditing"
      ],
      answer: 0,
      explain: "Sysmon logs process parentage, full command-line arguments, file hashes, and network connections that standard Windows logs often lack.",
      skill: "logs"
    },
    {
      id: "l02-q6",
      prompt: "In log analysis terminology, what is a 'field'?",
      options: [
        "A parsed key-value pair extracted from raw event text (such as user, src_ip, or process_name)",
        "The physical soccer field where analysts exercise",
        "The encrypted hard drive of the domain controller",
        "A proprietary database format used only by antivirus vendors"
      ],
      answer: 0,
      explain: "Fields are parsed attributes from raw events that allow analysts to search, filter, and aggregate telemetry in SIEM platforms.",
      skill: "logs"
    }
  ],
  reflection: [
    {
      id: "l02-r1",
      prompt: "Why is timestamp synchronization (NTP) across enterprise servers, firewalls, and domain controllers essential for effective incident investigation?",
      placeholder: "Explain what happens when event timestamps from different servers disagree by even a few minutes..."
    },
    {
      id: "l02-r2",
      prompt: "If an attacker clears Windows Security event logs (EventCode 1102), what alternative telemetry sources could still prove their presence?",
      placeholder: "Think about network firewalls, VPN gateways, DNS logs, and EDR agent telemetry..."
    }
  ],
  mentorBriefing: "In Lesson 2, we dive into raw logs. Focus on EventCode 4624 (success) vs 4625 (failure), understand Windows Logon Types (especially Type 3 Network and Type 10 RDP), and practice extracting source IPs and usernames from the scenario events.",
  challenges: [
    "What sub-status failure code differentiates a bad password from an account that does not exist?",
    "Why might an adversary deliberately target multiple user accounts with only two passwords each (password spraying)?",
    "How does Logon Type 3 differ from Logon Type 2 in terms of physical attacker location?",
    "What field would you inspect to verify whether an account creation event (4720) was authorized?"
  ]
};
