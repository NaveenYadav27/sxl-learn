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

const csaExplanations: Record<string, ModuleExplanation> = {
  [toolTour.moduleSlug]: toolTour,
};

export function getCsaModuleExplanation(slug: string): ModuleExplanation | undefined {
  return csaExplanations[slug];
}
