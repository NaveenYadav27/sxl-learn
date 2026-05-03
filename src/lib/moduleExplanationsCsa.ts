// Certified SOC Analyst (CSA) module explanations.
// Currently authored: csa-tool-tour (1-hour SOC tool tour).
// Other CSA modules will be authored in a follow-up pass.

import type { ModuleExplanation } from "./moduleExplanations";

const toolTour: ModuleExplanation = {
  moduleSlug: "csa-tool-tour",
  tagline: "Meet the five tools every SOC L1 analyst opens on day one — in 60 minutes.",
  overview:
    "This 1-hour express session is a guided walkthrough of the core Microsoft security stack a SOC analyst lives in: Microsoft Sentinel (the SIEM), KQL (the query language), Microsoft Defender XDR (the incident graph), Microsoft Entra sign-in logs (identity telemetry), and a phishing playbook (an end-to-end IR drill). The goal is recognition and orientation, not mastery — by the end you should know which tool to open for which kind of question.",
  whyItMatters:
    "Most new SOC analysts fail their first week not because they lack knowledge, but because they don't know where to look. Knowing 'this lives in Sentinel, that lives in Defender XDR, sign-ins live in Entra' shaves hours off every triage and is the fastest way to look competent in your first SOC shift or interview.",

  what: {
    heading: "What is the SOC tool tour?",
    body:
      "A 60-minute lab-driven tour of the five tools that show up in nearly every SOC L1 job description and CSA exam scenario. Each stop is ~10 minutes: open the tool, see one real artefact (incident, query, sign-in), and learn the one question it answers best.",
    bullets: [
      "Microsoft Sentinel — the SIEM workspace, incidents and analytics rules.",
      "KQL — your first hunting query (where / project / summarize).",
      "Microsoft Defender XDR — the incident graph and evidence pivot.",
      "Microsoft Entra sign-in logs — identity triage (location, risk, MFA).",
      "Phishing playbook — an end-to-end IR drill from alert to closure.",
    ],
  },
  why: {
    heading: "Why start with a tour?",
    body:
      "Cybersecurity has too many tools to learn in order. A tour gives you a mental map: when an alert lands, you instantly know which console owns it. That map is what separates a confident L1 from one who freezes when an incident pages.",
  },
  who: {
    heading: "Who uses these tools?",
    body:
      "SOC L1/L2 analysts use them daily for triage and investigation. Threat hunters live in KQL. Incident responders pivot through Defender XDR. Identity engineers tune the Entra signals these tools consume. CSA and SC-200 candidates are tested on all five.",
    bullets: [
      "SOC L1 — triages incidents in Sentinel & Defender XDR.",
      "SOC L2 / Hunter — writes KQL, builds detections.",
      "Identity engineer — tunes Entra Conditional Access from sign-in patterns.",
      "IR lead — runs the phishing / ransomware playbooks.",
    ],
  },
  when: {
    heading: "When do you use this tour?",
    body:
      "Run this on day one of CSA prep, before your first SOC shift, or the night before an interview. It is also the right warm-up before tackling the deeper modules (KQL hunting, Defender XDR triage, IR playbooks) because it gives every later concept a place to land.",
  },
  where: {
    heading: "Where do these tools live?",
    body:
      "All five are Microsoft cloud portals reachable from a browser: Sentinel and Entra inside the Azure / Entra portal, Defender XDR at security.microsoft.com, and the playbook is executed inside Sentinel automation rules. No on-prem install needed.",
  },
  how: {
    heading: "How is the hour structured?",
    body:
      "Five 10-minute stops + a 10-minute wrap. Each stop has one objective ('open one incident', 'run one KQL query', 'isolate one device in a sandbox'), so you finish with five concrete artefacts you can screenshot for your notes or interview portfolio.",
    bullets: [
      "0–10m — Sentinel workspace tour & open one incident.",
      "10–20m — Write your first KQL query against SigninLogs.",
      "20–30m — Walk a Defender XDR incident graph end-to-end.",
      "30–40m — Triage one risky Entra sign-in (impossible travel).",
      "40–55m — Run the phishing playbook from alert to closure.",
      "55–60m — Wrap-up & cheatsheet.",
    ],
  },

  conceptDeepDives: [
    {
      id: "sentinel",
      name: "Microsoft Sentinel",
      oneLine: "Microsoft's cloud-native SIEM + SOAR, built on a Log Analytics workspace.",
      formal:
        "Microsoft Sentinel is a SaaS Security Information & Event Management (SIEM) and Security Orchestration, Automation & Response (SOAR) platform. It ingests logs via data connectors, correlates them with analytics rules, and produces incidents that analysts triage in the Sentinel portal.",
      plainEnglish:
        "Sentinel is the place where every interesting log from your cloud and on-prem world ends up, gets correlated, and becomes an incident an analyst can work.",
      analogy:
        "Think of Sentinel as the SOC's CCTV control room: every camera (log source) feeds in, the system flags suspicious moments (analytics rules), and analysts review the highlight reel (incidents).",
      howItWorks:
        "Data connectors stream logs into a Log Analytics workspace. Analytics rules run KQL on a schedule (or in near real-time), grouping matching events into alerts and then into incidents. Automation rules and Logic Apps playbooks can act on those incidents (notify, enrich, contain).",
      microsoftMapping:
        "Microsoft Sentinel inside the Azure portal (azure.portal.com) or the unified Defender portal (security.microsoft.com).",
      whenToUse:
        "Use Sentinel when you need cross-source correlation (Entra + Defender + firewall + custom apps), long retention, or SOAR automation across more than just Microsoft data.",
      whenNotToUse:
        "If you only care about Microsoft 365 + endpoints and don't need third-party logs or custom retention, Defender XDR alone may be enough.",
      commonMistake:
        "Treating Sentinel as 'just a log search'. The value is the analytics rules + automation, not the search box.",
      examAngle:
        "CSA / SC-200 questions frame Sentinel as the SIEM/SOAR layer that sits above Defender XDR. If a scenario mentions correlating non-Microsoft logs or running a playbook, the answer is almost always Sentinel.",
    },
    {
      id: "kql",
      name: "Kusto Query Language (KQL)",
      oneLine: "The read-only query language used across Sentinel, Defender XDR, Entra and Log Analytics.",
      formal:
        "KQL is a SQL-inspired, pipe-based query language designed for fast read-only analysis of large telemetry datasets. Every Microsoft security product that exposes raw logs uses KQL.",
      plainEnglish:
        "KQL is the one language you write to ask any Microsoft security tool 'show me everything that looks like X in the last 7 days'.",
      analogy:
        "KQL is to security telemetry what Excel formulas are to spreadsheets — once you know the basics, you can answer almost any question without leaving the tool.",
      howItWorks:
        "Queries are pipelines: you start with a table (e.g. SigninLogs), pipe it through where to filter, project to pick columns, summarize to aggregate, and render to chart. Results are returned in seconds even over billions of rows.",
      microsoftMapping:
        "Sentinel 'Logs' blade, Defender XDR 'Advanced hunting', Log Analytics, Azure Data Explorer, Entra workbooks.",
      whenToUse:
        "Whenever a built-in dashboard doesn't answer your question — hunting, custom detections, ad-hoc investigation, building Workbooks.",
      whenNotToUse:
        "Don't write KQL when an existing analytics rule or dashboard already answers the question; reuse first.",
      commonMistake:
        "Forgetting the time filter (`| where TimeGenerated > ago(7d)`). Without it, queries are slow and may time out.",
      examAngle:
        "Expect at least one CSA scenario asking which operator filters/aggregates/joins. Memorise: where, project, extend, summarize, join, render.",
    },
    {
      id: "defender-xdr",
      name: "Microsoft Defender XDR",
      oneLine: "The unified incident view across Defender for Endpoint, Identity, Office 365 and Cloud Apps.",
      formal:
        "Defender XDR (Extended Detection & Response) correlates alerts from the Defender product family into a single incident with a graph of users, devices, mailboxes and cloud apps involved.",
      plainEnglish:
        "Instead of chasing 12 separate alerts across 4 portals, Defender XDR stitches them into one incident story you can walk top to bottom.",
      analogy:
        "Like a detective board with strings connecting suspects, locations and evidence — but auto-built from telemetry.",
      howItWorks:
        "Each Defender product raises alerts; the XDR engine groups related alerts (same user/device/mailbox/file hash) into an incident, builds an evidence list, and surfaces an attack story timeline.",
      microsoftMapping:
        "security.microsoft.com → Incidents & alerts; powered by Defender for Endpoint, Identity, Office 365, Cloud Apps and Entra ID Protection signals.",
      whenToUse:
        "First stop for any Microsoft-only triage: phishing, malware, identity compromise. Open the incident, walk the graph, pivot to evidence.",
      whenNotToUse:
        "If the alert involves non-Microsoft logs (firewall, custom app), pivot to Sentinel instead.",
      commonMistake:
        "Closing alerts inside the individual Defender product portals — that breaks XDR correlation. Always close at the incident level.",
      examAngle:
        "Expect questions distinguishing Defender XDR (incident correlation) from Sentinel (cross-source SIEM) and from individual Defender products (raw alerts).",
    },
    {
      id: "entra-signin-logs",
      name: "Microsoft Entra sign-in logs",
      oneLine: "The authoritative record of every authentication attempt against Entra ID.",
      formal:
        "Sign-in logs capture every interactive and non-interactive sign-in, including app, IP, location, MFA result, Conditional Access outcome, and Identity Protection risk score.",
      plainEnglish:
        "It's the door log for your tenant — who tried to walk in, from where, did MFA prompt, and was the door opened.",
      analogy:
        "Like an airport's passport-control log: every traveller, their passport, the gate, the result, and any flags raised.",
      howItWorks:
        "Every authentication request to Entra ID writes a record. Identity Protection enriches it with risk signals (impossible travel, anonymous IP, leaked credentials). Sentinel can ingest the same data via the Entra connector for correlation.",
      microsoftMapping:
        "Entra admin center → Monitoring → Sign-in logs; also exposed in Sentinel as the SigninLogs table.",
      whenToUse:
        "Any account-compromise or impossible-travel investigation, MFA troubleshooting, or Conditional Access policy debugging.",
      whenNotToUse:
        "Don't use sign-in logs for endpoint or email events — those live in Defender for Endpoint / Office 365.",
      commonMistake:
        "Reading only the 'success/failure' column. The risk and Conditional Access columns tell the real story.",
      examAngle:
        "CSA scenarios often hand you a sign-in log row and ask which control (MFA, CA, Identity Protection) should have blocked it.",
    },
    {
      id: "phishing-playbook",
      name: "Phishing playbook",
      oneLine: "The standardised step-by-step procedure for triaging and containing a phishing incident.",
      formal:
        "An incident-response playbook is a documented, repeatable sequence of analyst actions tied to a specific incident type, designed to ensure consistency and meet SLAs.",
      plainEnglish:
        "A checklist that turns 'a phishing email landed' into a deterministic series of actions instead of guesswork.",
      analogy:
        "Like a pilot's emergency checklist: when something goes wrong, you don't improvise — you run the list.",
      howItWorks:
        "Trigger (Defender for Office 365 alert) → confirm scope (who clicked, who replied) → contain (purge mail, reset credentials, revoke tokens) → eradicate (block sender/URL/hash) → recover (re-enable accounts) → lessons learned (update rules, user awareness).",
      microsoftMapping:
        "Defender for Office 365 alerts + Sentinel automation rules + Logic Apps playbooks; manual steps documented in the SOC runbook.",
      whenToUse:
        "Every confirmed or suspected phishing incident — even a 'low' severity one. Consistency builds metrics and audit trails.",
      whenNotToUse:
        "Don't bend the phishing playbook for malware or BEC — those have their own playbooks; pick the right one.",
      commonMistake:
        "Skipping the 'revoke tokens' step. Resetting the password isn't enough — refresh tokens stay valid until revoked.",
      examAngle:
        "CSA loves multi-step playbook ordering questions: drag the steps into the correct NIST IR phase (Detect → Contain → Eradicate → Recover → Lessons Learned).",
    },
  ],

  comparisons: [
    {
      title: "Sentinel vs Defender XDR — which one do I open?",
      columns: ["Question you're answering", "Sentinel", "Defender XDR"],
      rows: [
        ["Cross-source correlation (firewall + cloud + custom apps)", "✅ Built for this", "❌ Microsoft signals only"],
        ["Microsoft-only incident triage (phishing, EDR, identity)", "Possible but heavy", "✅ Fastest path"],
        ["Custom KQL hunting across long retention", "✅ Workspace-wide", "✅ Advanced hunting (shorter retention)"],
        ["SOAR / playbook automation across non-MS systems", "✅ Logic Apps", "Limited"],
        ["Cost model", "Per GB ingested", "Per Defender SKU licensed"],
      ],
      bottomLine: "Defender XDR for fast Microsoft-only triage; Sentinel for cross-source correlation and SOAR.",
    },
    {
      title: "Alert vs Incident vs Event",
      columns: ["Term", "What it is", "Where you see it"],
      rows: [
        ["Event", "A single raw log record (one sign-in, one process)", "Log tables (SigninLogs, DeviceProcessEvents)"],
        ["Alert", "A detection fired by a rule on one or more events", "Defender / Sentinel alerts queue"],
        ["Incident", "A correlated group of related alerts forming one case", "Defender XDR / Sentinel incidents"],
      ],
      bottomLine: "Analysts work incidents, hunters work events, detection engineers tune the alerts in between.",
    },
  ],

  realExamples: [
    {
      title: "Impossible travel — Dave in Seattle, then Lagos 50 minutes later",
      scenario:
        "Entra Identity Protection raises a 'high' risk sign-in for Dave Davis from Lagos, NG, just 50 minutes after a successful Seattle sign-in. Defender XDR groups it with a follow-up 'anonymous IP' alert into one incident.",
      outcome:
        "Analyst opens the incident in Defender XDR, pivots to the Entra sign-in row, runs a KQL query for any other risky sign-ins from that IP, then triggers the account-compromise playbook (revoke tokens, reset password, force re-MFA).",
    },
    {
      title: "Phishing campaign hitting Finance",
      scenario:
        "Defender for Office 365 flags an email from cfo-contoso@protonmail.com sent to four Finance users; Ivy clicks the link within 2 minutes.",
      outcome:
        "Analyst runs the phishing playbook in Sentinel: purge the email tenant-wide, block the sender + URL, reset Ivy's password, revoke her refresh tokens, and add a watch-list entry for the impersonated CFO display name.",
    },
  ],

  keyTerms: [
    { term: "SIEM", definition: "Security Information & Event Management — a system that ingests, correlates and alerts on logs.", alsoKnownAs: ["Log correlation platform"], example: "Microsoft Sentinel" },
    { term: "SOAR", definition: "Security Orchestration, Automation & Response — automated playbooks that act on incidents.", example: "A Logic App that auto-disables a user when a leaked-credentials alert fires" },
    { term: "XDR", definition: "Extended Detection & Response — correlates alerts across endpoint, identity, email and cloud apps.", example: "Microsoft Defender XDR" },
    { term: "MTTD / MTTR", definition: "Mean Time To Detect / Respond — the two headline SOC SLAs.", example: "MTTD < 15 min for high-severity incidents" },
    { term: "IOC", definition: "Indicator Of Compromise — an artefact (hash, IP, domain) tied to known malicious activity.", example: "A SHA256 hash from a CISA advisory" },
    { term: "KQL", definition: "Kusto Query Language — Microsoft's read-only telemetry query language.", example: "SigninLogs | where RiskLevelDuringSignIn == 'high'" },
  ],

  commonPitfalls: [
    "Opening the wrong console first — losing 10 minutes in Sentinel when Defender XDR already correlated the incident.",
    "Closing Defender alerts at the product level instead of at the XDR incident — breaks correlation.",
    "Resetting a compromised user's password without revoking refresh tokens (attacker stays signed in).",
    "Writing KQL without a TimeGenerated filter — slow, expensive and sometimes times out.",
    "Treating the phishing playbook as optional for 'low' severity emails — consistency is what builds metrics.",
  ],

  faqs: [
    { q: "Do I need to know KQL on day one of a SOC L1 job?", a: "Reading KQL — yes. Writing it — basics only (where, project, summarize). Most L1s tune existing queries rather than write from scratch." },
    { q: "Sentinel or Defender XDR — which is the 'main' tool?", a: "In a Microsoft-heavy SOC you'll live in Defender XDR for triage and pivot to Sentinel for hunting and cross-source correlation." },
    { q: "Why do we revoke tokens after a phishing reset?", a: "Refresh tokens stay valid until explicitly revoked, even after a password change — so the attacker would keep their session." },
    { q: "Can I run this 1-hour tour on a free tenant?", a: "Yes — a Microsoft 365 E5 trial + Sentinel free tier gives you everything in this tour for 30 days." },
  ],

  selfCheck: [
    {
      question: "An alert fires for impossible travel on a user. Which console is the fastest first stop?",
      options: ["Microsoft Sentinel", "Microsoft Defender XDR", "Entra sign-in logs directly", "Azure Monitor"],
      correctIndex: 1,
      explanation:
        "Defender XDR already correlates the Entra Identity Protection alert with any related Defender alerts into one incident, so it's the fastest triage entry point. Sentinel is correct for cross-source hunts; the raw sign-in logs are correct only when XDR isn't licensed.",
    },
    {
      question: "Which step is REQUIRED in a phishing playbook beyond resetting the user's password?",
      options: ["Re-image the laptop", "Revoke refresh tokens", "Open a change request", "Notify the press"],
      correctIndex: 1,
      explanation:
        "Refresh tokens survive a password reset; without revocation the attacker stays signed in. Re-imaging is for malware playbooks, not phishing-only.",
    },
    {
      question: "Which language do you use for advanced hunting in Defender XDR and Sentinel?",
      options: ["SQL", "PowerShell", "KQL", "SPL"],
      correctIndex: 2,
      explanation:
        "KQL (Kusto Query Language) is the unified language across Sentinel, Defender XDR advanced hunting, Log Analytics and Entra workbooks. SPL is Splunk; SQL is relational; PowerShell is for tenant automation, not hunting.",
    },
  ],

  examTips: [
    "If a question mentions 'correlate logs from a non-Microsoft source', the answer is Microsoft Sentinel.",
    "If a question shows a single attack story across endpoint + email + identity, the answer is Defender XDR.",
    "If a question asks which language for hunting → KQL, every time.",
    "Phishing playbook step ordering: Detect → Contain (purge + revoke) → Eradicate (block) → Recover → Lessons Learned.",
    "Sign-in log triage: always read RiskLevel + ConditionalAccessStatus, not just success/failure.",
  ],

  furtherReading: [
    { label: "Microsoft Sentinel documentation", url: "https://learn.microsoft.com/azure/sentinel/" },
    { label: "Defender XDR overview", url: "https://learn.microsoft.com/defender-xdr/" },
    { label: "KQL quick reference", url: "https://learn.microsoft.com/azure/data-explorer/kql-quick-reference" },
    { label: "Entra ID Protection risk detections", url: "https://learn.microsoft.com/entra/id-protection/concept-identity-protection-risks" },
    { label: "NIST SP 800-61r2 — Computer Security Incident Handling Guide", url: "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r2.pdf" },
  ],
};

/* ============================================================================
 * Full CSA syllabus modules (8) — production content authored for each module
 * referenced in src/lib/curriculumCsa.ts (csaModuleNotes).
 * ========================================================================== */

const m1_socFundamentals: ModuleExplanation = {
  moduleSlug: "csa-soc-fundamentals",
  tagline: "How a real Security Operations Centre runs — people, process, technology.",
  overview:
    "Module 1 maps the SOC end-to-end: tier structure (L1 → L3), shift handovers, in-house vs MSSP vs hybrid models, and the day-in-the-life workflow of triage → investigation → escalation → closure. You leave able to describe what each tier owns, how an alert moves through the SOC, and which metrics (MTTD, MTTR, SLA) prove the SOC is working.",
  whyItMatters:
    "Tools without a SOC are just dashboards. Hiring managers and the CSA exam test whether you understand the operating model — who escalates to whom, when an event becomes an incident, and how SLAs are measured. Without this mental model, even strong technical skills fail at interview.",
  what: {
    heading: "What is a SOC?",
    body: "A Security Operations Centre is a 24×7 function (people + process + technology) that monitors, detects, investigates and responds to security incidents across an organisation. It owns the alert-to-resolution pipeline.",
    bullets: [
      "People — L1 triage, L2 investigators, L3 hunters/IR, SOC manager.",
      "Process — runbooks, playbooks, escalation matrix, shift handovers.",
      "Technology — SIEM, EDR/XDR, SOAR, threat intel, ticketing.",
    ],
  },
  why: {
    heading: "Why do organisations build SOCs?",
    body: "Regulations (PCI-DSS, HIPAA, DPDP, NIS2) demand continuous monitoring, and modern attacks (ransomware, BEC) move faster than business hours. A SOC is the only function that can detect and contain in minutes, not days.",
  },
  who: {
    heading: "Who works in the SOC?",
    body: "A blended team where each tier has clear ownership; ambiguity here is the #1 cause of missed incidents.",
    bullets: [
      "L1 Analyst — triages alerts, closes false positives, escalates true positives.",
      "L2 Analyst — investigates, scopes, contains, writes case notes.",
      "L3 / Threat Hunter — proactive hunts, custom detections, hard IR.",
      "SOC Manager — SLAs, staffing, vendor management, exec reporting.",
    ],
  },
  when: {
    heading: "When does the SOC act?",
    body: "Continuously. Detection is real-time; triage SLAs are typically 15 min for high severity; containment SLAs 1 hour. Shift handovers happen 2–3 times per day with explicit hand-off of open cases.",
  },
  where: {
    heading: "Where does it sit organisationally?",
    body: "Usually under the CISO, separate from IT operations to preserve independence. Physical SOCs exist for sensitive sectors (defence, banking); most modern SOCs are virtual/distributed using collaboration tools and a shared SIEM.",
  },
  how: {
    heading: "How does an alert flow through the SOC?",
    body: "Source generates event → SIEM correlates → analytics rule fires alert → L1 triages within SLA → if true positive, opens incident & escalates to L2 → L2 contains/eradicates → L3 or IR if scope is broad → post-incident review feeds detections back into the SIEM.",
  },
  conceptDeepDives: [
    {
      id: "soc-tiers",
      name: "SOC Tiers (L1/L2/L3)",
      oneLine: "A layered division of labour where harder incidents flow upward.",
      formal: "A staffing model that segments analysts by skill so volume work (L1) does not block deep work (L2/L3).",
      plainEnglish: "L1 says 'is this real?', L2 says 'how bad is it?', L3 says 'how did they get in and are they still here?'.",
      analogy: "Hospital triage: nurse (L1), doctor (L2), specialist (L3).",
      howItWorks: "Alerts land in a queue. L1 picks first, closes noise, escalates real cases via the ticketing system. SLAs differ per tier.",
      microsoftMapping: "Sentinel Incidents queue + Owner field + Microsoft Defender XDR Incident assignment.",
      whenToUse: "Any SOC handling >100 alerts/day.",
      whenNotToUse: "Tiny teams (<3 analysts) — flatten the structure instead.",
      commonMistake: "L1 trying to fully investigate before escalating — burns SLA and creates queue backlog.",
      examAngle: "CSA expects you to map a scenario sentence ('writes new detections') to the correct tier (L3).",
    },
    {
      id: "mttd-mttr",
      name: "MTTD vs MTTR",
      oneLine: "Two clocks: how fast we see it, how fast we stop it.",
      formal: "Mean Time To Detect = compromise → first alert. Mean Time To Respond = first alert → contained.",
      plainEnglish: "MTTD measures sensors. MTTR measures the team and runbooks.",
      analogy: "MTTD = smoke alarm speed. MTTR = how fast firefighters arrive and put it out.",
      howItWorks: "Both are derived from incident timestamps in the SIEM/SOAR. Lower numbers = better SOC maturity.",
      microsoftMapping: "Sentinel workbook 'Security Operations Efficiency'.",
      whenToUse: "Quarterly board reporting and SOC maturity reviews.",
      commonMistake: "Reporting only MTTR — hides slow detection.",
      examAngle: "Exam frames metrics as 'which KPI proves the SIEM is tuned?' (MTTD).",
    },
  ],
  comparisons: [
    {
      title: "SOC delivery models",
      columns: ["Criterion", "In-house", "MSSP", "Hybrid"],
      rows: [
        ["Cost", "High CapEx", "OpEx subscription", "Mixed"],
        ["Context", "Deep", "Shallow", "Shared"],
        ["24×7 coverage", "Hard", "Built-in", "MSSP fills nights"],
        ["Best for", "Regulated, large", "SMB", "Mid-market growing"],
      ],
      bottomLine: "Most modern enterprises run hybrid: in-house L2/L3 with MSSP-provided L1 night coverage.",
    },
  ],
  realExamples: [
    {
      title: "Phishing alert at 02:00",
      scenario: "An MSSP L1 receives a Defender for Office 365 alert about a malicious link clicked by a finance user.",
      outcome: "L1 confirms click, isolates mailbox session, escalates to in-house L2 who runs the BEC playbook by 02:25 — MTTR 25 min.",
    },
  ],
  keyTerms: [
    { term: "SOC", definition: "Security Operations Centre — the team and tooling that monitors and responds 24×7.", alsoKnownAs: ["CSOC"] },
    { term: "MSSP", definition: "Managed Security Service Provider — outsourced SOC.", example: "Wipro, Arctic Wolf, Atos." },
    { term: "Runbook", definition: "Step-by-step procedure for a recurring task (e.g. how to triage a sign-in alert).", alsoKnownAs: ["SOP"] },
    { term: "Playbook", definition: "Decision tree for an incident class (phishing, ransomware) that may include automation." },
    { term: "Shift handover", definition: "Structured pass of open cases between shifts, usually with a written brief." },
  ],
  commonPitfalls: [
    "Confusing runbook (operational task) with playbook (incident response).",
    "Treating L1 as a 'junior dumping ground' rather than the SOC's first line of defence.",
    "Measuring only ticket volume — rewards noisy detections.",
    "Skipping post-incident reviews; same incident recurs.",
  ],
  faqs: [
    { q: "Is a NOC the same as a SOC?", a: "No. NOC watches uptime and performance; SOC watches security threats. Same monitoring discipline, different objective." },
    { q: "Do I need a SIEM to have a SOC?", a: "Practically yes — without centralised logs, analysts cannot correlate across sources." },
  ],
  selfCheck: [
    {
      question: "Which tier typically writes new detection rules?",
      options: ["L1", "L2", "L3 / Threat Hunter", "SOC Manager"],
      correctIndex: 2,
      explanation: "Detection engineering and hunting are L3 responsibilities; L1/L2 triage and investigate.",
    },
    {
      question: "Which metric measures how long it takes to see a compromise?",
      options: ["MTTR", "MTTD", "SLA", "MTBF"],
      correctIndex: 1,
      explanation: "MTTD = Mean Time To Detect. MTTR is response time; MTBF is reliability.",
    },
  ],
  examTips: [
    "If a scenario describes 'closing false positives quickly', the answer is L1.",
    "If a scenario mentions 'proactive search for undetected threats', the answer is threat hunting / L3.",
    "Hybrid SOC = MSSP + in-house. Pure outsourcing = MSSP only.",
  ],
  furtherReading: [
    { label: "EC-Council CSA blueprint", url: "https://www.eccouncil.org/train-certify/certified-soc-analyst-csa/" },
    { label: "MITRE 11 Strategies of a World-Class CSOC", url: "https://www.mitre.org/news-insights/publication/11-strategies-world-class-cybersecurity-operations-center" },
  ],
};

const m2_cyberThreats: ModuleExplanation = {
  moduleSlug: "csa-cyber-threats",
  tagline: "Threat actors, kill chain and ATT&CK — the language of attacks.",
  overview:
    "Module 2 teaches you how to describe an attack the way professionals do: by actor type (nation-state, crime, insider), by kill-chain stage (recon → actions on objectives), and by ATT&CK technique (e.g. T1566 Phishing). You also learn the Diamond Model and how to map raw alerts to techniques so reports become repeatable.",
  whyItMatters:
    "Detections are written against techniques, not malware names. Without ATT&CK fluency you cannot read a Defender alert ('Initial Access — T1078'), explain it to a manager, or write a hunting query that generalises beyond a single sample.",
  what: {
    heading: "What is the threat landscape?",
    body: "The set of actors, motives, and methods that target an organisation. It is industry-specific: a hospital faces ransomware crews; a defence contractor faces APTs; a SaaS startup faces credential stuffing.",
    bullets: [
      "Actors — nation-state APT, organised crime, hacktivist, insider, script kiddie.",
      "Kill Chain — Recon → Weaponise → Deliver → Exploit → Install → C2 → Actions.",
      "ATT&CK — 14 tactics (the 'why') and hundreds of techniques (the 'how').",
    ],
  },
  why: {
    heading: "Why frameworks matter",
    body: "Frameworks turn anecdotes ('we got hacked by a phishing email') into structured data ('Initial Access via T1566.002 — Spearphishing Link') that detections, dashboards and exec reports can all consume.",
  },
  who: {
    heading: "Who uses ATT&CK & Kill Chain?",
    body: "SOC analysts tag alerts; detection engineers map coverage; CTI teams attribute intrusions; auditors measure control gaps.",
    bullets: [
      "SOC L1/L2 — tag incidents with ATT&CK technique IDs.",
      "Detection engineers — map rules to techniques to find blind spots.",
      "CTI analysts — track which techniques specific actors prefer.",
    ],
  },
  when: {
    heading: "When do you reference these models?",
    body: "Every incident write-up cites the ATT&CK technique. Quarterly, the SOC reviews ATT&CK Navigator coverage to plan new detections.",
  },
  where: {
    heading: "Where in the tools?",
    body: "Sentinel analytics rules carry an ATT&CK 'Tactics' field; Defender XDR alerts carry technique IDs; MITRE Navigator visualises coverage as a heatmap.",
  },
  how: {
    heading: "How to map an alert to ATT&CK",
    body: "Read the alert evidence → identify the attacker behaviour (not the tool) → look up the matching technique on attack.mitre.org → record both the tactic (TA####) and technique (T####).",
  },
  conceptDeepDives: [
    {
      id: "killchain",
      name: "Lockheed Martin Cyber Kill Chain",
      oneLine: "A linear 7-stage model of how intrusions unfold.",
      formal: "Reconnaissance → Weaponisation → Delivery → Exploitation → Installation → Command & Control → Actions on Objectives.",
      plainEnglish: "The attacker's project plan — every step you break stops the whole attack.",
      analogy: "A burglar: scout the house, pick a tool, break a window, climb in, take a TV.",
      howItWorks: "Defenders aim to detect/disrupt at the earliest stage possible; cost to attacker rises sharply.",
      microsoftMapping: "Sentinel Incident timeline shows alerts grouped roughly by kill-chain stage.",
      whenToUse: "Executive narratives and high-level reports.",
      whenNotToUse: "Modern cloud attacks — kill chain is too linear; prefer ATT&CK.",
      commonMistake: "Believing every attack visits all 7 stages — many skip Installation (living-off-the-land).",
      examAngle: "Order the stages, or pick which stage a given action belongs to.",
    },
    {
      id: "attck",
      name: "MITRE ATT&CK",
      oneLine: "A knowledge base of adversary tactics and techniques observed in the wild.",
      formal: "A matrix of 14 tactics (goals) × hundreds of techniques (methods) maintained by MITRE from real intrusions.",
      plainEnglish: "A library of 'how attackers actually do things', referenced by ID like T1566.",
      analogy: "Cookbook of attacker recipes; defenders write detections against the recipes.",
      howItWorks: "Each technique has description, detection guidance, mitigations and known actor groups.",
      microsoftMapping: "Sentinel 'MITRE ATT&CK' workbook + per-rule Tactics/Techniques metadata.",
      whenToUse: "Detection engineering, gap analysis, incident classification.",
      commonMistake: "Confusing tactic (the why, e.g. Initial Access) with technique (the how, e.g. Phishing).",
      examAngle: "'Which ATT&CK tactic does T1078 (Valid Accounts) belong to?' → Initial Access / Persistence / Defense Evasion.",
    },
    {
      id: "diamond",
      name: "Diamond Model",
      oneLine: "Four vertices that describe any intrusion event.",
      formal: "Adversary, Capability, Infrastructure, Victim — connected by social-political and technical axes.",
      plainEnglish: "Who attacked (adversary), with what tool (capability), from where (infrastructure), against whom (victim).",
      analogy: "A police case file: suspect, weapon, location, victim.",
      howItWorks: "Pivoting on any vertex (e.g. an IP — infrastructure) helps discover related events.",
      microsoftMapping: "Sentinel Entities (Account, IP, Host, FileHash) map directly to Diamond vertices.",
      whenToUse: "Threat-intel-driven hunting and attribution.",
      commonMistake: "Ignoring the social-political axis (the 'why') — leads to mis-attribution.",
      examAngle: "Match scenario items to vertices.",
    },
  ],
  comparisons: [
    {
      title: "Kill Chain vs ATT&CK",
      columns: ["Criterion", "Kill Chain", "ATT&CK"],
      rows: [
        ["Granularity", "7 stages", "14 tactics, 600+ techniques"],
        ["Shape", "Linear", "Matrix / graph"],
        ["Best for", "Exec narrative", "Detection engineering"],
        ["Cloud coverage", "Weak", "Strong (Cloud matrix)"],
      ],
      bottomLine: "Use Kill Chain for storytelling, ATT&CK for engineering.",
    },
  ],
  realExamples: [
    {
      title: "Tagging a real alert",
      scenario: "Defender for Endpoint flags 'PowerShell downloading from raw.githubusercontent.com'.",
      outcome: "Mapped to T1059.001 (PowerShell) under Execution tactic and T1105 (Ingress Tool Transfer) under Command & Control.",
    },
  ],
  keyTerms: [
    { term: "TTP", definition: "Tactic, Technique, Procedure — a layered description of how an actor operates." },
    { term: "APT", definition: "Advanced Persistent Threat — typically nation-state, long-dwell intrusion.", example: "APT29 / Cozy Bear." },
    { term: "IoC", definition: "Indicator of Compromise — observable artefact (hash, IP, domain) of malicious activity." },
    { term: "IoA", definition: "Indicator of Attack — behaviour-based signal (e.g. mass file rename) regardless of artefact." },
  ],
  commonPitfalls: [
    "Citing only the technique number without the tactic.",
    "Using malware family names instead of behaviours in detections — breaks on the next variant.",
    "Treating ATT&CK as a checklist instead of a coverage map.",
  ],
  faqs: [
    { q: "Are nation-state actors really targeting my SMB?", a: "Rarely directly, but supply-chain compromises (SolarWinds, MOVEit) put SMBs in the blast radius." },
    { q: "What's the difference between ATT&CK and D3FEND?", a: "ATT&CK catalogues attacks; D3FEND catalogues defensive countermeasures." },
  ],
  selfCheck: [
    {
      question: "Which framework best supports detection engineering?",
      options: ["Cyber Kill Chain", "MITRE ATT&CK", "Diamond Model", "OWASP Top 10"],
      correctIndex: 1,
      explanation: "ATT&CK's technique granularity maps 1:1 to detection rules; Kill Chain is too coarse.",
    },
    {
      question: "An IoA differs from an IoC because it focuses on…",
      options: ["File hashes", "Network artefacts", "Behaviour", "Vulnerabilities"],
      correctIndex: 2,
      explanation: "IoA = behavioural; IoC = artefact-based.",
    },
  ],
  examTips: [
    "Memorise the 7 Kill Chain stages in order.",
    "Know the top tactics: Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection, Exfiltration, Impact, Command & Control.",
    "T-numbers are techniques; TA-numbers are tactics.",
  ],
  furtherReading: [
    { label: "MITRE ATT&CK", url: "https://attack.mitre.org/" },
    { label: "Lockheed Martin Cyber Kill Chain", url: "https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html" },
    { label: "Diamond Model paper", url: "https://www.activeresponse.org/wp-content/uploads/2013/07/diamond.pdf" },
  ],
};

const m3_logsEvents: ModuleExplanation = {
  moduleSlug: "csa-incidents-events-logs",
  tagline: "Events, alerts, incidents — and the log sources every analyst must read.",
  overview:
    "Module 3 distinguishes the three terms that confuse most juniors (event vs alert vs incident) and walks through the must-know log sources: Windows Security & Sysmon, Active Directory, DNS, proxy, EDR, plus the cloud equivalents (Entra sign-ins, Azure Activity, M365 Audit, AWS CloudTrail). You also cover normalisation, time sync and chain of custody.",
  whyItMatters:
    "If you cannot read a raw Windows 4624 logon event or an Entra sign-in JSON, every alert becomes a black box. Reading logs is the single highest-leverage SOC skill and is tested in every CSA scenario.",
  what: {
    heading: "Event vs Alert vs Incident",
    body: "An event is any recorded occurrence (login, file open). An alert is an event a rule says is suspicious. An incident is one or more alerts confirmed (or scoped) as a real security issue.",
    bullets: [
      "Event — raw, high volume, neutral.",
      "Alert — filtered, smaller, suspicious until proven otherwise.",
      "Incident — confirmed, tracked, has owner and SLA.",
    ],
  },
  why: {
    heading: "Why log source coverage matters",
    body: "ATT&CK techniques are detectable only where you have telemetry. No Sysmon → no process-creation visibility → entire 'Execution' tactic is blind.",
  },
  who: {
    heading: "Who owns log sources?",
    body: "Platform teams (AD, M365, network) own the source; the SOC owns the collection pipeline and parsing. Joint ownership of retention is critical for compliance.",
  },
  when: {
    heading: "When are logs collected?",
    body: "Continuously (streaming agents) or in batches (scheduled pulls). Latency under 5 minutes is the norm for SIEM ingestion.",
  },
  where: {
    heading: "Where do they land?",
    body: "Centralised in the SIEM workspace (Sentinel Log Analytics, Splunk indexes, Elastic indices), partitioned by source and retention tier.",
  },
  how: {
    heading: "How is normalisation done?",
    body: "Parsers turn vendor-specific fields into a common schema (ASIM in Sentinel, CIM in Splunk, ECS in Elastic). Normalisation means one query works across sources.",
  },
  conceptDeepDives: [
    {
      id: "windows-events",
      name: "Windows Security Event IDs",
      oneLine: "Numeric codes that describe authentication and audit events.",
      formal: "Standardised event IDs in the Security log emitted by the Local Security Authority (LSA).",
      plainEnglish: "4624 = login success; 4625 = login failure; 4672 = special privileges assigned; 4688 = process creation.",
      analogy: "Building access logs — same format whatever the door.",
      howItWorks: "Audit policy enables categories; events flow to the local Security log; agents forward to SIEM.",
      microsoftMapping: "Sentinel SecurityEvent table; Defender for Endpoint DeviceLogonEvents.",
      whenToUse: "Account compromise and lateral movement investigations.",
      commonMistake: "Confusing logon types (3 = network, 10 = RDP, 4 = batch).",
      examAngle: "Pick the event ID for a given activity.",
    },
    {
      id: "sysmon",
      name: "Sysmon",
      oneLine: "Microsoft Sysinternals tool that adds rich process, network and file telemetry.",
      formal: "Drives extra Event IDs (1 process create, 3 network connect, 7 image load, 11 file create, 22 DNS query) configured by an XML policy.",
      plainEnglish: "Windows logs are thin — Sysmon makes them analyst-grade.",
      analogy: "CCTV vs visitor sign-in book.",
      howItWorks: "Install Sysmon + Olaf Hartong / SwiftOnSecurity config; events go to Microsoft-Windows-Sysmon/Operational and forward to SIEM.",
      microsoftMapping: "Sentinel Event table filtered on Source == 'Microsoft-Windows-Sysmon'.",
      whenToUse: "Any endpoint without an EDR, or to augment EDR.",
      commonMistake: "Default config is too noisy — use a curated config.",
      examAngle: "Identify Sysmon EventID 1 as process creation.",
    },
  ],
  comparisons: [
    {
      title: "Cloud audit log sources",
      columns: ["Need", "Microsoft", "AWS", "GCP"],
      rows: [
        ["Identity sign-ins", "Entra SigninLogs", "CloudTrail (sts)", "Cloud Audit (admin)"],
        ["Mgmt-plane changes", "Azure Activity", "CloudTrail", "Cloud Audit"],
        ["SaaS data access", "M365 Audit", "—", "—"],
      ],
      bottomLine: "Every cloud has 'who did what' logs — names differ, semantics overlap.",
    },
  ],
  realExamples: [
    {
      title: "Reading a 4625",
      scenario: "200 4625 events from one source IP in 5 minutes against svc_backup.",
      outcome: "Password spray detected; analyst pivots to 4624s for that account to confirm any success.",
    },
  ],
  keyTerms: [
    { term: "ASIM", definition: "Advanced Security Information Model — Sentinel's normalised schema." },
    { term: "Time sync", definition: "All log sources should use NTP/UTC; otherwise correlation across sources breaks." },
    { term: "Chain of custody", definition: "Documented handling of evidence from collection to court — required for forensic-grade logs." },
    { term: "Retention tier", definition: "Hot/warm/cold storage class; balances query speed against cost." },
  ],
  commonPitfalls: [
    "Calling every alert an incident — inflates metrics.",
    "Forgetting Sysmon → blind to process trees.",
    "Local time logs — ruins cross-source correlation.",
  ],
  faqs: [
    { q: "Do I need Sysmon if I have Defender for Endpoint?", a: "Usually no — MDE produces equivalent DeviceProcessEvents." },
    { q: "How long should I retain logs?", a: "PCI-DSS = 1 year (90 days hot). Best practice for IR = 12 months minimum." },
  ],
  selfCheck: [
    {
      question: "Which Windows Event ID indicates a successful logon?",
      options: ["4624", "4625", "4688", "4672"],
      correctIndex: 0,
      explanation: "4624 success / 4625 failure / 4688 process creation / 4672 special privileges.",
    },
    {
      question: "Which is true of the relationship event → alert → incident?",
      options: ["They are synonyms", "Events are filtered into alerts; alerts confirmed become incidents", "Incidents become events", "Only alerts are stored"],
      correctIndex: 1,
      explanation: "Volume decreases left to right; severity / confidence increases.",
    },
  ],
  examTips: [
    "Memorise: 4624 success, 4625 failure, 4688 process, 4672 admin, 4720 user created.",
    "Sysmon EventID 1 = process create, 3 = network, 11 = file create, 22 = DNS.",
    "ASIM = Microsoft; CIM = Splunk; ECS = Elastic.",
  ],
  furtherReading: [
    { label: "Sysmon docs", url: "https://learn.microsoft.com/sysinternals/downloads/sysmon" },
    { label: "ASIM overview", url: "https://learn.microsoft.com/azure/sentinel/normalization" },
    { label: "Windows security audit events", url: "https://learn.microsoft.com/windows/security/threat-protection/auditing/security-auditing-overview" },
  ],
};

const m4_siem: ModuleExplanation = {
  moduleSlug: "csa-siem-fundamentals",
  tagline: "How a SIEM thinks — and how Microsoft Sentinel does it.",
  overview:
    "Module 4 covers SIEM architecture (collect → parse → correlate → alert) and walks through Microsoft Sentinel end-to-end: workspace, data connectors, analytics rules, watchlists, threat intel and the use-case lifecycle. You also tour Splunk, QRadar and Elastic at a comparative level.",
  whyItMatters:
    "The SIEM is the SOC's central nervous system. Every CSA exam scenario assumes you can describe how an alert is born inside a SIEM and how it gets tuned when it cries wolf.",
  what: {
    heading: "What is a SIEM?",
    body: "Security Information & Event Management — a platform that ingests logs from many sources, normalises them, runs correlation rules, and presents alerts/incidents to analysts.",
    bullets: [
      "Collect — agents, connectors, syslog, APIs.",
      "Parse — normalise into a common schema.",
      "Correlate — rules / ML across sources.",
      "Alert & investigate — incidents, entities, timelines.",
    ],
  },
  why: {
    heading: "Why centralise?",
    body: "Modern attacks span identity + endpoint + cloud + email. Without a SIEM, those signals stay in silos and the chain is invisible.",
  },
  who: {
    heading: "Who runs it?",
    body: "Detection engineers build rules, analysts consume incidents, platform engineers own ingestion and cost.",
  },
  when: {
    heading: "Use-case lifecycle",
    body: "Hypothesis (an attacker would do X) → query → tune in dev → promote to scheduled rule → measure FP/TP → retire when no longer relevant.",
  },
  where: {
    heading: "Where Sentinel lives",
    body: "An Azure Log Analytics workspace plus the Sentinel solution layered on top, in your tenant — billed per GB ingested.",
  },
  how: {
    heading: "How analytics rules work",
    body: "Scheduled KQL queries run every N minutes; matches create alerts; alerts can be grouped into incidents; entities (Account/Host/IP) are extracted for graph navigation.",
  },
  conceptDeepDives: [
    {
      id: "sentinel-anatomy",
      name: "Sentinel anatomy",
      oneLine: "Workspace + connectors + analytics + workbooks + automation.",
      formal: "A cloud-native SIEM/SOAR built on Log Analytics + Logic Apps in Azure.",
      plainEnglish: "Five Lego bricks: where logs live, how they get in, how alerts fire, dashboards, and automation.",
      analogy: "A factory: raw material in, conveyor belt, quality check, dashboards, robots that pack the box.",
      howItWorks: "Connectors push logs → tables in workspace → analytics rules query tables → incidents → automation rules / playbooks act.",
      microsoftMapping: "All built-in to Microsoft Sentinel.",
      whenToUse: "Any org standardised on Azure / M365.",
      commonMistake: "Enabling all rules out-of-the-box — drowns analysts.",
      examAngle: "Order the components of incident creation.",
    },
    {
      id: "rule-tuning",
      name: "Rule tuning",
      oneLine: "Reducing false positives without losing true positives.",
      formal: "Iterative refinement of query filters, thresholds and grouping based on triage feedback.",
      plainEnglish: "Stop the alarm crying wolf without ignoring real burglars.",
      analogy: "Adjusting a smoke detector so toast doesn't trigger it but a fire still does.",
      howItWorks: "Add allow-listed entities (service accounts, scanners), raise thresholds, group by entity, suppress duplicates.",
      microsoftMapping: "Sentinel rule 'Alert grouping' + 'Suppression' settings.",
      whenToUse: "Any rule with FP rate > ~20%.",
      commonMistake: "Disabling noisy rules instead of tuning — creates blind spot.",
      examAngle: "Pick the tuning action that preserves detection coverage.",
    },
  ],
  comparisons: [
    {
      title: "SIEM landscape",
      columns: ["Criterion", "Sentinel", "Splunk", "QRadar", "Elastic"],
      rows: [
        ["Deployment", "Cloud (Azure)", "On-prem / Cloud", "Appliance / Cloud", "Self-managed / Cloud"],
        ["Query language", "KQL", "SPL", "AQL", "ES|QL / KQL-lite"],
        ["Pricing", "Per GB ingested", "Per GB / day", "EPS-based", "Resource-based"],
        ["Strength", "M365 native", "Mature ecosystem", "Built-in correlation", "Open / cheap"],
      ],
      bottomLine: "Pick the SIEM that matches your existing telemetry centre of gravity.",
    },
  ],
  realExamples: [
    {
      title: "Tuning impossible-travel",
      scenario: "Rule fires on a sales rep flying London → New York legitimately.",
      outcome: "Add VIP travel watchlist exclusion + raise minimum velocity to 800 km/h; FP/week drops 90%.",
    },
  ],
  keyTerms: [
    { term: "Workspace", definition: "The Log Analytics container that holds Sentinel data." },
    { term: "Connector", definition: "Adapter that brings a data source (e.g. Entra) into the workspace." },
    { term: "Watchlist", definition: "Reference list (VIPs, terminated users, allowlists) joined to KQL queries." },
    { term: "Analytics rule", definition: "Scheduled or near-real-time detection that creates alerts/incidents." },
  ],
  commonPitfalls: [
    "Ingesting verbose tables (e.g. firewall accept logs) without value → cost blowout.",
    "Not setting Entity mappings on rules — kills the incident graph.",
    "One giant rule instead of small composable ones.",
  ],
  faqs: [
    { q: "Is Sentinel a SOAR too?", a: "Yes — Automation rules + Logic Apps playbooks make it a combined SIEM/SOAR." },
    { q: "Does Sentinel replace Defender XDR?", a: "No — they integrate. XDR for endpoint/identity/email, Sentinel for everything else and cross-source correlation." },
  ],
  selfCheck: [
    {
      question: "What language do Sentinel analytics rules use?",
      options: ["SPL", "SQL", "KQL", "Python"],
      correctIndex: 2,
      explanation: "KQL — Kusto Query Language — is the only native query language in Sentinel.",
    },
    {
      question: "Best first action for a noisy rule with 80% FPs?",
      options: ["Disable it", "Tune it (filters, thresholds, watchlists)", "Delete the data source", "Lower severity"],
      correctIndex: 1,
      explanation: "Tuning preserves coverage; disabling creates blind spots; lowering severity hides without fixing.",
    },
  ],
  examTips: [
    "Sentinel = SIEM + SOAR. Defender XDR = correlated detections across MS security stack.",
    "Ingestion is billed per GB — choose tables wisely.",
    "Always set Entity mappings or the incident graph is empty.",
  ],
  furtherReading: [
    { label: "Microsoft Sentinel docs", url: "https://learn.microsoft.com/azure/sentinel/" },
    { label: "Splunk SIEM use-case library", url: "https://research.splunk.com/" },
  ],
};

const m5_kqlHunting: ModuleExplanation = {
  moduleSlug: "csa-kql-hunting",
  tagline: "Speak KQL fluently and turn hunting queries into detections.",
  overview:
    "Module 5 makes you productive in KQL: where, project, summarize, join, render, and the most-used hunting tables (SigninLogs, DeviceProcessEvents, EmailEvents, IdentityLogonEvents). You learn to start from an ATT&CK technique, write a query, validate it as a hunt, then promote it to an analytics rule.",
  whyItMatters:
    "KQL is the lingua franca of Sentinel, Defender XDR Advanced Hunting, Log Analytics and Entra workbooks. Fluency multiplies every other skill in the SOC.",
  what: {
    heading: "What is KQL?",
    body: "Kusto Query Language — a read-only, pipe-based query language designed for fast queries over large telemetry tables.",
    bullets: [
      "where — filter rows.",
      "project — pick columns.",
      "summarize — aggregate (count, dcount, make_set).",
      "join — combine tables on a key.",
      "render — build a chart inline.",
    ],
  },
  why: {
    heading: "Why KQL won",
    body: "It is fast, declarative, easy to read top-to-bottom, and shared across the entire Microsoft security & observability stack — one language, many tools.",
  },
  who: {
    heading: "Who writes KQL?",
    body: "L2 analysts during investigation, L3 hunters for proactive sweeps, detection engineers for analytics rules.",
  },
  when: {
    heading: "When to hunt vs detect",
    body: "Hunt when you have a hypothesis but no rule. If the hunt finds value repeatedly with low FP, promote to a scheduled analytics rule.",
  },
  where: {
    heading: "Where to run it",
    body: "Sentinel Logs blade, Defender XDR Advanced Hunting, Log Analytics, Azure Data Explorer.",
  },
  how: {
    heading: "How to build a hunt from ATT&CK",
    body: "Pick a technique (e.g. T1078 Valid Accounts) → identify telemetry (SigninLogs) → write the simplest filter → progressively enrich with summarize/join → save as bookmark / hunt.",
  },
  conceptDeepDives: [
    {
      id: "kql-pipe",
      name: "Pipe-based execution",
      oneLine: "Each | passes the table to the next operator.",
      formal: "KQL evaluates left to right, mutating the row set with each operator.",
      plainEnglish: "Like Unix pipes for tables.",
      analogy: "An assembly line that filters and reshapes the data at each station.",
      howItWorks: "Predicate pushdown means filters early in the pipe make queries massively faster.",
      microsoftMapping: "Used in every KQL surface.",
      whenToUse: "Always.",
      commonMistake: "Putting where after summarize — hits a smaller pre-aggregated set, often misses raw filtering opportunity.",
      examAngle: "Pick the most efficient pipe order.",
    },
    {
      id: "summarize",
      name: "summarize",
      oneLine: "Aggregate rows into groups.",
      formal: "summarize <agg> by <columns> — collapses table to one row per group.",
      plainEnglish: "GROUP BY for KQL.",
      analogy: "Sorting laundry into piles by colour, then counting.",
      howItWorks: "Common aggregations: count(), dcount(), sum(), avg(), min(), max(), make_set(), arg_max().",
      microsoftMapping: "Core of every detection rule.",
      whenToUse: "Detecting thresholds (e.g. >10 failures per user).",
      commonMistake: "Forgetting to bin time: summarize count() by bin(TimeGenerated, 1h).",
      examAngle: "Choose the correct aggregator for a scenario.",
    },
  ],
  comparisons: [
    {
      title: "KQL vs SPL (Splunk)",
      columns: ["Need", "KQL", "SPL"],
      rows: [
        ["Filter", "where", "search / where"],
        ["Aggregate", "summarize", "stats"],
        ["Time bucket", "bin(T, 1h)", "timechart span=1h"],
        ["Join", "join kind=inner", "join / lookup"],
      ],
      bottomLine: "Same primitives, different keywords; SPL hides time, KQL is explicit.",
    },
  ],
  realExamples: [
    {
      title: "Impossible travel hunt",
      scenario: "Find users with two successful sign-ins from countries >1000 km apart within 1 hour.",
      outcome: "summarize on UserPrincipalName + geo_distance() reveals a compromised exec; promoted to scheduled rule.",
    },
  ],
  keyTerms: [
    { term: "Bookmark", definition: "Saved hunting result attached to an investigation." },
    { term: "Livestream", definition: "Near-real-time hunt that streams new matches as they arrive." },
    { term: "Function", definition: "Saved KQL snippet callable like a table — used to standardise parsing." },
    { term: "Materialize", definition: "Cache an intermediate result inside a single query for reuse." },
  ],
  commonPitfalls: [
    "summarize without bin(time) — collapses across the whole window.",
    "Using join when a leftouter or in() would be cheaper.",
    "Forgetting to project away PII before sharing query results.",
  ],
  faqs: [
    { q: "Can KQL update data?", a: "No — it is read-only by design. Use Logic Apps / Functions for writes." },
    { q: "Is KQL the same as Elastic KQL?", a: "Different language despite the name collision." },
  ],
  selfCheck: [
    {
      question: "Which operator aggregates rows in KQL?",
      options: ["group", "summarize", "stats", "reduce"],
      correctIndex: 1,
      explanation: "summarize is the GROUP BY of KQL; stats is Splunk; group/reduce don't exist in KQL.",
    },
    {
      question: "Best place to put a where for performance?",
      options: ["After summarize", "Before summarize", "After render", "It doesn't matter"],
      correctIndex: 1,
      explanation: "Filters early shrink the row set processed by later operators.",
    },
  ],
  examTips: [
    "Order: filter → project → summarize → render.",
    "Use dcount() to count distinct entities; count() counts rows.",
    "Always anchor time with TimeGenerated and a bin().",
  ],
  furtherReading: [
    { label: "KQL quick reference", url: "https://learn.microsoft.com/azure/data-explorer/kql-quick-reference" },
    { label: "Sentinel hunting docs", url: "https://learn.microsoft.com/azure/sentinel/hunting" },
  ],
};

const m6_defender: ModuleExplanation = {
  moduleSlug: "csa-defender-xdr",
  tagline: "One incident graph across endpoint, identity, email and cloud apps.",
  overview:
    "Module 6 covers Microsoft Defender XDR: how alerts from Defender for Endpoint, Identity, Office 365 and Cloud Apps are correlated into a single incident, how the device timeline and Advanced Hunting work, and how Automated Investigation & Response (AIR) closes obvious cases without analyst time.",
  whyItMatters:
    "Defender XDR is where most M365 SOCs spend their day. Knowing the incident graph, evidence model, and AIR verdicts is essential for L1/L2 work and a recurring CSA exam topic.",
  what: {
    heading: "What is Defender XDR?",
    body: "An eXtended Detection & Response platform that correlates alerts across the Microsoft Defender family into single, evidence-rich incidents.",
    bullets: [
      "Defender for Endpoint — devices.",
      "Defender for Identity — on-prem AD signals.",
      "Defender for Office 365 — email/collab.",
      "Defender for Cloud Apps — SaaS / shadow IT.",
    ],
  },
  why: {
    heading: "Why XDR over standalone EDR?",
    body: "Modern attacks chain identity + email + endpoint. Standalone tools see fragments; XDR stitches them so the analyst sees the story, not the puzzle pieces.",
  },
  who: {
    heading: "Who uses it?",
    body: "L1 triages incidents in the unified portal; L2 pivots through device timelines; IR uses live response shells.",
  },
  when: {
    heading: "When does AIR fire?",
    body: "On supported alert types (phishing, malicious URL, suspected commodity malware) — runs an investigation, classifies verdict, optionally remediates.",
  },
  where: {
    heading: "Where it lives",
    body: "security.microsoft.com — the unified Microsoft Defender portal.",
  },
  how: {
    heading: "How an incident is built",
    body: "Alerts that share entities (user, device, file hash, URL) are clustered into one incident; the graph view shows entity relationships and the timeline shows the order of activity.",
  },
  conceptDeepDives: [
    {
      id: "incident-graph",
      name: "Incident graph",
      oneLine: "Visual cluster of alerts + entities for one storyline.",
      formal: "A graph where nodes are entities (account, device, file, URL) and edges are alert relationships.",
      plainEnglish: "Pulls all the puzzle pieces about one attack into one screen.",
      analogy: "A detective's evidence board with strings between suspects.",
      howItWorks: "Correlation engine groups alerts sharing entities within a time window.",
      microsoftMapping: "Defender XDR Incident → 'Graph' tab.",
      whenToUse: "First action on any new incident — see the whole story.",
      commonMistake: "Triaging individual alerts instead of the parent incident.",
      examAngle: "Identify the correct triage entry point (incident, not alert).",
    },
    {
      id: "air",
      name: "Automated Investigation & Response (AIR)",
      oneLine: "Bots that triage and remediate the obvious cases.",
      formal: "Built-in playbooks that gather evidence, classify verdict (Malicious / Suspicious / No threat) and optionally take remediation actions.",
      plainEnglish: "AIR handles 80% of the noise so humans handle the 20% that matters.",
      analogy: "Email spam filter for incidents.",
      howItWorks: "On a supported alert AIR investigates linked entities, runs detonation/lookup, proposes or auto-applies actions.",
      microsoftMapping: "Defender XDR Action Center.",
      whenToUse: "Phishing, commodity malware, suspicious URL clicks.",
      commonMistake: "Ignoring AIR's pending actions queue → stale containment.",
      examAngle: "Match a verdict (Malicious) to the correct next action.",
    },
  ],
  comparisons: [
    {
      title: "Sentinel vs Defender XDR",
      columns: ["Criterion", "Sentinel", "Defender XDR"],
      rows: [
        ["Scope", "Anything you ingest", "Microsoft security stack"],
        ["Correlation", "KQL rules you write", "Built-in graph"],
        ["SOAR", "Logic Apps", "Action Center / Power Automate"],
        ["Best for", "Cross-source / 3rd-party", "Native MS coverage"],
      ],
      bottomLine: "Use both — Defender XDR for native, Sentinel for the rest; alerts flow Defender → Sentinel.",
    },
  ],
  realExamples: [
    {
      title: "BEC across email + identity",
      scenario: "Defender for Office 365 flags a phishing email; Defender for Identity flags a token replay 30 minutes later for the same user.",
      outcome: "XDR correlates both into one incident; analyst sees full chain in one graph and revokes session.",
    },
  ],
  keyTerms: [
    { term: "Evidence", definition: "Entities (file, URL, IP, user, device, mailbox) tied to an incident with a verdict each." },
    { term: "Live Response", definition: "Interactive shell into a managed endpoint for IR." },
    { term: "Action Center", definition: "Queue of pending and completed remediation actions across XDR." },
    { term: "Advanced Hunting", definition: "KQL surface across Defender XDR tables (DeviceProcessEvents, EmailEvents, etc.)." },
  ],
  commonPitfalls: [
    "Closing alerts inside an incident one-by-one — close the incident.",
    "Forgetting AIR pending actions need approval in some tenants.",
    "Confusing DeviceProcessEvents (XDR) with SecurityEvent (Sentinel).",
  ],
  faqs: [
    { q: "Does Defender XDR replace antivirus?", a: "Defender for Endpoint includes AV; XDR adds correlation on top." },
    { q: "Do Defender XDR alerts flow into Sentinel?", a: "Yes, via the Microsoft Defender XDR connector — incidents stay in sync bi-directionally." },
  ],
  selfCheck: [
    {
      question: "Where do you start triaging in Defender XDR?",
      options: ["Individual alerts", "The incident", "The device timeline", "The Action Center"],
      correctIndex: 1,
      explanation: "Always start at the incident — alerts are children and triaging them in isolation loses correlation.",
    },
    {
      question: "Which Defender service watches on-prem Active Directory?",
      options: ["Defender for Endpoint", "Defender for Identity", "Defender for Cloud Apps", "Defender for Office 365"],
      correctIndex: 1,
      explanation: "Defender for Identity (formerly Azure ATP) consumes on-prem domain controller telemetry.",
    },
  ],
  examTips: [
    "Defender for Endpoint = devices; Identity = on-prem AD; Office 365 = email; Cloud Apps = SaaS.",
    "AIR can auto-remediate or wait for approval — knows the difference.",
    "Advanced Hunting tables differ from Sentinel tables (DeviceProcessEvents vs SecurityEvent).",
  ],
  furtherReading: [
    { label: "Defender XDR docs", url: "https://learn.microsoft.com/defender-xdr/" },
    { label: "Advanced hunting schema", url: "https://learn.microsoft.com/defender-xdr/advanced-hunting-schema-tables" },
  ],
};

const m7_ir: ModuleExplanation = {
  moduleSlug: "csa-incident-response",
  tagline: "Run incidents from detection to lessons learned — by the NIST playbook.",
  overview:
    "Module 7 walks the NIST 800-61 lifecycle (Prepare → Detect → Contain → Eradicate → Recover → Lessons Learned) and the three playbooks every SOC must own: phishing, account compromise and ransomware. You learn severity classification, escalation matrices and concrete containment actions.",
  whyItMatters:
    "Detections without response are theatre. CSA tests playbook ordering and containment choices, and your interview will too — 'walk me through how you'd respond to ransomware' is the most common L2 question.",
  what: {
    heading: "What is incident response?",
    body: "A structured process to limit damage, restore services and learn from a security incident.",
    bullets: [
      "Prepare — runbooks, tooling, contacts.",
      "Detect & Analyse — confirm and scope.",
      "Contain — short-term & long-term.",
      "Eradicate — remove the threat.",
      "Recover — restore safely.",
      "Lessons Learned — feed back into Prepare.",
    ],
  },
  why: {
    heading: "Why a lifecycle?",
    body: "Without it, teams skip steps under stress (e.g. wipe before forensics) and the same incident recurs because there's no feedback loop.",
  },
  who: {
    heading: "Who is on the IR team?",
    body: "IR lead, SOC analysts, identity, endpoint, network, legal, comms, business owner. Pre-named in a RACI before the incident.",
  },
  when: {
    heading: "Severity & escalation",
    body: "Severity is set on detection from blast radius (users, data, business impact); each severity has SLAs and an escalation chain to legal/exec/regulators.",
  },
  where: {
    heading: "Where the case lives",
    body: "Ticketing/case management (TheHive, ServiceNow SIR, Sentinel incidents) — single source of truth.",
  },
  how: {
    heading: "How to contain",
    body: "Three levers: identity (disable user, revoke sessions, force MFA), endpoint (isolate device, block hash), network (block IP/domain at proxy/firewall). Combine all three for serious incidents.",
  },
  conceptDeepDives: [
    {
      id: "nist-lifecycle",
      name: "NIST 800-61 lifecycle",
      oneLine: "The de-facto IR process model.",
      formal: "Prepare, Detection & Analysis, Containment/Eradication/Recovery (one combined phase in NIST), Post-Incident Activity.",
      plainEnglish: "Plan → spot it → stop it → clean it → learn.",
      analogy: "Fire response: drills → smell smoke → close fire doors → put out fire → after-action review.",
      howItWorks: "Each phase has entry/exit criteria; lessons learned feeds back into Prepare.",
      microsoftMapping: "Sentinel Incidents + Logic Apps playbooks operationalise it.",
      whenToUse: "Every incident, however small.",
      commonMistake: "Skipping Lessons Learned because the incident closed.",
      examAngle: "Order the phases.",
    },
    {
      id: "containment-types",
      name: "Short-term vs long-term containment",
      oneLine: "Two clocks: stop the bleeding now, fix the root cause later.",
      formal: "Short-term = immediate isolation; long-term = sustainable hardening before full recovery.",
      plainEnglish: "Isolate the laptop today, deploy MFA org-wide next week.",
      analogy: "Tourniquet vs surgery.",
      howItWorks: "Short-term during the incident; long-term scheduled into change control once the threat is contained.",
      microsoftMapping: "Defender device isolation = short-term; Conditional Access policy update = long-term.",
      whenToUse: "Both — every serious incident needs a plan for each.",
      commonMistake: "Treating short-term containment as the fix.",
      examAngle: "Pick which action belongs to which type.",
    },
  ],
  comparisons: [
    {
      title: "Phishing vs Account compromise vs Ransomware (priority actions)",
      columns: ["Step 1", "Phishing", "Account compromise", "Ransomware"],
      rows: [
        ["Contain", "Purge mail, block sender", "Disable account, revoke sessions", "Isolate hosts, kill SMB"],
        ["Eradicate", "Block URL/domain", "Reset creds + MFA", "Remove persistence, restore from clean backup"],
        ["Recover", "Re-enable mailbox flow", "Re-enable account post-MFA", "Restore from immutable backup"],
        ["Notify", "Affected users", "User + manager", "Exec + legal + regulator if PII"],
      ],
      bottomLine: "Same lifecycle, different concrete actions per playbook.",
    },
  ],
  realExamples: [
    {
      title: "Account compromise IR",
      scenario: "Impossible travel + token replay flagged for a Finance VP.",
      outcome: "Disable user → revoke refresh tokens → reset password → require MFA → review last 24h mailbox rules → notify VP and CFO. MTTR 38 min.",
    },
  ],
  keyTerms: [
    { term: "Eradication", definition: "Removing the root cause (malware, accounts, persistence) before recovery." },
    { term: "Tabletop", definition: "Discussion-based exercise of a scenario with the IR team." },
    { term: "Severity matrix", definition: "Predefined mapping from impact + scope to severity tier." },
    { term: "Chain of custody", definition: "Documented evidence handling from collection to legal/forensic use." },
  ],
  commonPitfalls: [
    "Wiping a host before forensics — destroys evidence.",
    "Resetting a password without revoking refresh tokens — attacker keeps access.",
    "Skipping comms — legal and PR find out from customers.",
  ],
  faqs: [
    { q: "Should we ever pay the ransom?", a: "It's a business/legal decision, not a SOC one. Most jurisdictions discourage; some sanctioned actors make payment illegal." },
    { q: "Who declares an incident closed?", a: "The IR lead, after eradication and recovery exit criteria are met and a post-incident review is scheduled." },
  ],
  selfCheck: [
    {
      question: "Order the NIST IR phases.",
      options: ["Detect → Contain → Prepare → Recover", "Prepare → Detect → Contain → Eradicate → Recover → Lessons Learned", "Contain → Detect → Recover → Prepare", "Detect → Eradicate → Contain → Recover"],
      correctIndex: 1,
      explanation: "NIST 800-61: Prepare → Detect & Analyse → Contain/Eradicate/Recover → Post-Incident.",
    },
    {
      question: "First action in account compromise containment?",
      options: ["Reset password", "Revoke active sessions/tokens AND disable account", "Re-image device", "Notify regulator"],
      correctIndex: 1,
      explanation: "Password reset alone leaves valid refresh tokens — must invalidate sessions and disable.",
    },
  ],
  examTips: [
    "NIST has 4 phases (Prepare / Detect / Contain-Eradicate-Recover / Post) — SANS uses 6, both fine.",
    "Containment ≠ eradication.",
    "Always combine identity + endpoint + network containment for serious incidents.",
  ],
  furtherReading: [
    { label: "NIST SP 800-61r2", url: "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r2.pdf" },
    { label: "Microsoft IR playbooks", url: "https://learn.microsoft.com/security/operations/incident-response-playbooks" },
  ],
};

const m8_intelSoar: ModuleExplanation = {
  moduleSlug: "csa-threat-intel-soar",
  tagline: "Intel sharpens detection, SOAR scales the team — and your interview prep.",
  overview:
    "Module 8 covers threat intelligence (strategic / tactical / operational / technical), IOCs vs IOAs, STIX/TAXII feeds, MISP, and SOAR via Sentinel automation rules + Logic Apps playbooks. It closes with career prep — top SOC L1 interview questions, resume polish and mock drills.",
  whyItMatters:
    "Intel turns generic alerts into 'this is APT29-style' attribution; SOAR removes repetitive work so the team can scale. Both are explicit CSA exam topics and what hiring managers ask about.",
  what: {
    heading: "What is threat intelligence?",
    body: "Curated knowledge about threats (actors, TTPs, IOCs) used to prioritise defences, enrich alerts and inform leadership.",
    bullets: [
      "Strategic — board-level: who targets us and why.",
      "Operational — campaign-level TTPs.",
      "Tactical — analyst-grade ATT&CK techniques.",
      "Technical — machine-readable IOCs (hashes, IPs, domains).",
    ],
  },
  why: {
    heading: "Why SOAR?",
    body: "Analyst time is the SOC's most expensive resource. Automating triage steps (enrichment, lookups, containment of obvious cases) reclaims hours per shift and shortens MTTR.",
  },
  who: {
    heading: "Who consumes intel?",
    body: "L1 (alert enrichment), L3 (hunting), CTI team (attribution), CISO (strategy).",
  },
  when: {
    heading: "When to automate",
    body: "Any task done >5 times per week with deterministic input/output is a SOAR candidate. Avoid automating decisions that need human judgement.",
  },
  where: {
    heading: "Where intel & SOAR live",
    body: "MISP / commercial feeds / TI Connector → Sentinel ThreatIntelligenceIndicator table → analytics rules + Logic Apps playbooks.",
  },
  how: {
    heading: "How a SOAR playbook fires",
    body: "Sentinel automation rule matches an incident → triggers Logic App → enriches (VirusTotal, AbuseIPDB) → posts to Teams → optionally disables user / isolates device → updates the case.",
  },
  conceptDeepDives: [
    {
      id: "intel-tiers",
      name: "Intel tiers",
      oneLine: "Same data, different audience and shelf life.",
      formal: "Strategic (years), Operational (months), Tactical (weeks), Technical (hours-days).",
      plainEnglish: "From boardroom slides down to a single bad IP.",
      analogy: "Weather: climate (strategic) → seasonal forecast (operational) → 5-day (tactical) → today (technical).",
      howItWorks: "Each tier is produced and consumed by different roles; technical IOCs decay fastest.",
      microsoftMapping: "Sentinel TI connector ingests technical/tactical; CTI team produces strategic/operational reports.",
      whenToUse: "Match the audience: never present technical IOCs to the board.",
      commonMistake: "Sending IOC dumps to executives — meaningless without context.",
      examAngle: "Match an artefact (IP / report / TTP) to the right tier.",
    },
    {
      id: "ioc-ioa",
      name: "IOC vs IOA",
      oneLine: "Artefact vs behaviour.",
      formal: "IOC = forensic artefact (hash, IP, domain). IOA = behaviour pattern (mass file rename + ransom note).",
      plainEnglish: "IOCs catch the same attack twice; IOAs catch new variants.",
      analogy: "IOC = burglar's fingerprint. IOA = burglar's modus operandi.",
      howItWorks: "IOCs feed blocklists; IOAs feed behavioural detections.",
      microsoftMapping: "TI Indicators table (IOC); Defender behavioural detections (IOA).",
      whenToUse: "Both — IOCs for cheap blocking, IOAs for resilient detection.",
      commonMistake: "Buying IOC feeds without behavioural detections.",
      examAngle: "Identify a given artefact as IOC or IOA.",
    },
    {
      id: "soar-playbook",
      name: "SOAR playbook",
      oneLine: "Triggered, multi-step automation that mimics analyst actions.",
      formal: "A workflow (Sentinel Logic App / Splunk SOAR / XSOAR) that orchestrates enrichment, decision and remediation across tools.",
      plainEnglish: "A robot junior analyst that runs the same 10 steps every time.",
      analogy: "Factory robot doing the repetitive work so humans handle exceptions.",
      howItWorks: "Trigger (incident) → connectors (VT, Entra, Defender) → conditional actions (if malicious, disable user) → update incident.",
      microsoftMapping: "Sentinel Automation rule + Logic App.",
      whenToUse: "Phishing enrichment, IOC sweep, user disable, comms posts.",
      commonMistake: "Automating destructive actions without an approval gate.",
      examAngle: "Pick which tasks belong to a playbook vs an analyst.",
    },
  ],
  comparisons: [
    {
      title: "MISP vs commercial TI feeds",
      columns: ["Criterion", "MISP", "Commercial"],
      rows: [
        ["Cost", "Free / community", "Paid subscription"],
        ["Quality", "Variable, peer reviewed", "Curated, vetted"],
        ["Coverage", "Broad community", "Vendor focus"],
        ["Best for", "ISACs, sharing", "Enterprise SOC"],
      ],
      bottomLine: "Most mature SOCs run MISP for sharing AND a paid feed for vetted intel.",
    },
  ],
  realExamples: [
    {
      title: "Auto-enrichment playbook",
      scenario: "Sentinel raises a 'Malicious IP sign-in' incident.",
      outcome: "Logic App enriches IP via AbuseIPDB + VT, posts result to Teams, tags the incident with verdict; analyst confirms and closes in 90 seconds.",
    },
  ],
  keyTerms: [
    { term: "STIX", definition: "Structured Threat Information eXpression — JSON schema for sharing intel." },
    { term: "TAXII", definition: "Transport protocol used to deliver STIX feeds." },
    { term: "MISP", definition: "Open-source threat intelligence sharing platform." },
    { term: "Playbook", definition: "Automated workflow in a SOAR that responds to a trigger." },
    { term: "Automation rule", definition: "Sentinel rule that decides which playbook runs on which incident." },
  ],
  commonPitfalls: [
    "Auto-disabling executives without an approval step.",
    "Ingesting every free IOC feed → noise + cost.",
    "Treating SOAR as a replacement for analysts — it amplifies them, not replaces them.",
  ],
  faqs: [
    { q: "Do I need a separate SOAR product?", a: "Not in Microsoft world — Sentinel automation rules + Logic Apps cover most needs." },
    { q: "How fresh do IOCs need to be?", a: "Most technical IOCs (IPs, domains) decay within days; hashes last longer." },
  ],
  selfCheck: [
    {
      question: "Which intel tier targets executives and quarterly planning?",
      options: ["Technical", "Tactical", "Operational", "Strategic"],
      correctIndex: 3,
      explanation: "Strategic intel = long-horizon, board-level; technical = short-lived IOCs.",
    },
    {
      question: "Which is an IOA, not an IOC?",
      options: ["MD5 hash a1b2c3...", "203.0.113.5", "Mass file rename + ransom note dropped", "evil.example.com"],
      correctIndex: 2,
      explanation: "Behavioural pattern = IOA. Hashes/IPs/domains = IOC.",
    },
  ],
  examTips: [
    "STIX = format; TAXII = transport.",
    "Sentinel automation rule decides which Logic App playbook to run.",
    "Always gate destructive SOAR actions (user disable, host wipe) with approval.",
  ],
  furtherReading: [
    { label: "MISP project", url: "https://www.misp-project.org/" },
    { label: "Sentinel SOAR docs", url: "https://learn.microsoft.com/azure/sentinel/automation" },
    { label: "STIX 2.1 spec", url: "https://oasis-open.github.io/cti-documentation/" },
  ],
};

const csaExplanations: Record<string, ModuleExplanation> = {
  [toolTour.moduleSlug]: toolTour,
  [m1_socFundamentals.moduleSlug]: m1_socFundamentals,
  [m2_cyberThreats.moduleSlug]: m2_cyberThreats,
  [m3_logsEvents.moduleSlug]: m3_logsEvents,
  [m4_siem.moduleSlug]: m4_siem,
  [m5_kqlHunting.moduleSlug]: m5_kqlHunting,
  [m6_defender.moduleSlug]: m6_defender,
  [m7_ir.moduleSlug]: m7_ir,
  [m8_intelSoar.moduleSlug]: m8_intelSoar,
};

export function getCsaModuleExplanation(slug: string): ModuleExplanation | undefined {
  return csaExplanations[slug];
}
