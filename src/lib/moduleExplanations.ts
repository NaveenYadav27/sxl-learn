// Deep, exam-aligned explanation for each SC-900 module.
// Used by the Module Detail page (/module/:slug). Keep prose tight and authoritative.

export type ExplanationSection = {
  heading: string;
  body: string;        // 1–3 short paragraphs
  bullets?: string[];  // optional supporting points
};

export type RealExample = {
  title: string;
  scenario: string;
  outcome: string;
};

export type KeyTerm = { term: string; definition: string };

export type ModuleExplanation = {
  moduleSlug: "concepts" | "iam" | "entra" | "security" | "compliance";
  tagline: string;
  overview: string;          // 2–3 sentence elevator pitch
  whyItMatters: string;      // business framing for SC-900 audience

  // 5W1H deep dive
  what: ExplanationSection;
  why: ExplanationSection;
  who: ExplanationSection;
  when: ExplanationSection;
  where: ExplanationSection;
  how: ExplanationSection;

  realExamples: RealExample[];
  keyTerms: KeyTerm[];
  examTips: string[];        // SC-900 exam-style hints
};

export const moduleExplanations: ModuleExplanation[] = [
  /* ----------------------------- MODULE 1 ----------------------------- */
  {
    moduleSlug: "concepts",
    tagline: "The mental model behind every Microsoft security product.",
    overview:
      "Module 1 establishes the vocabulary used across the entire SC-900 exam: Zero Trust, Defense in Depth, the CIA triad, threats vs. vulnerabilities, and the cloud shared responsibility model. Master these and the remaining four modules become much easier — every Defender, Entra, and Purview feature is just an implementation of one of these ideas.",
    whyItMatters:
      "Modern attacks bypass the network perimeter entirely (phishing, token theft, supply-chain). Organisations that still rely on a 'castle-and-moat' design are the ones in the headlines. Microsoft's entire security stack assumes Zero Trust, so understanding the principle is non-negotiable for any cloud role.",

    what: {
      heading: "What are security concepts?",
      body:
        "They are the strategic principles that determine how you design controls, where you put them, and how you measure them. Concepts are technology-agnostic: they apply equally to on-prem AD, Microsoft 365, AWS, or a hospital's medical devices.",
      bullets: [
        "Zero Trust — never trust, always verify; assume breach.",
        "Defense in Depth — overlapping layers (physical → identity → data).",
        "CIA triad — Confidentiality, Integrity, Availability.",
        "Threat / Vulnerability / Risk / Mitigation vocabulary.",
        "Shared responsibility model in IaaS / PaaS / SaaS.",
      ],
    },
    why: {
      heading: "Why do we need them?",
      body:
        "Without a model, security becomes a random pile of products. Concepts let architects justify spend ('this control covers integrity'), let auditors map evidence to a framework, and let engineers know which layer is failing when an incident happens.",
    },
    who: {
      heading: "Who is involved?",
      body:
        "Concepts are owned by security architects and CISOs but apply to everyone. Developers must understand CIA when designing APIs; helpdesk staff implement Zero Trust every time they verify a caller's identity; end users are the first layer of defence against phishing.",
      bullets: [
        "CISO / Security Architect — sets the strategy.",
        "Cloud Engineer — implements the controls.",
        "Compliance Officer — maps controls to regulation.",
        "End user — the human firewall.",
      ],
    },
    when: {
      heading: "When are they applied?",
      body:
        "Continuously. Zero Trust is evaluated on every sign-in, every API call, every file access. Defense in Depth is reviewed on every architecture decision. The CIA triad guides every backup, every encryption choice, every access policy — from the moment a system is designed to the moment it is decommissioned.",
    },
    where: {
      heading: "Where do they apply?",
      body:
        "Everywhere data flows: identity providers, devices, networks, applications, and the data itself. The shared responsibility model is the map — it tells you which layer the cloud provider secures and which layer is yours, so you don't leave gaps.",
    },
    how: {
      heading: "How are they implemented in Microsoft?",
      body:
        "Microsoft maps every product to one or more concepts: Entra ID enforces 'verify explicitly', Conditional Access enforces 'least privilege', Defender enforces 'assume breach', Purview enforces 'protect data wherever it lives'. SC-900 expects you to recognise this mapping.",
      bullets: [
        "Verify explicitly → MFA, Conditional Access, Identity Protection.",
        "Least privilege → RBAC, PIM, just-in-time access.",
        "Assume breach → Defender XDR, Sentinel, micro-segmentation.",
      ],
    },

    realExamples: [
      {
        title: "Contoso ransomware blocked at layer 2",
        scenario:
          "A finance user clicks a malicious link. Defender for Office 365 detonates the URL in a sandbox (layer 1). The user still types credentials on the lookalike page. Conditional Access blocks the sign-in because the device is non-compliant (layer 2). No data is touched.",
        outcome:
          "Defense in Depth turned a near-miss into a non-event. Both layers logged the attempt for the SOC.",
      },
      {
        title: "Healthcare CIA tradeoff",
        scenario:
          "A hospital must balance Confidentiality (patient privacy) with Availability (a doctor needs records during a code blue). They implement break-glass accounts that bypass MFA but trigger a high-severity alert and a mandatory post-event review.",
        outcome:
          "Availability wins in the moment, Confidentiality is restored after the event — both legs of CIA are honoured.",
      },
    ],
    keyTerms: [
      { term: "Threat", definition: "A potential cause of an unwanted incident (e.g. ransomware actor)." },
      { term: "Vulnerability", definition: "A weakness that a threat can exploit (e.g. unpatched server)." },
      { term: "Risk", definition: "The likelihood × impact of a threat exploiting a vulnerability." },
      { term: "Mitigation", definition: "A control that reduces risk (e.g. patching, MFA, EDR)." },
      { term: "Encryption at rest", definition: "Protects data on disk (BitLocker, Storage Service Encryption)." },
      { term: "Encryption in transit", definition: "Protects data on the wire (TLS, IPSec)." },
    ],
    examTips: [
      "If a question mentions 'verify explicitly', 'least privilege', or 'assume breach' — the answer is Zero Trust.",
      "CIA triad questions: confidentiality = encryption / access control; integrity = hashing / signing; availability = backups / DDoS protection.",
      "Shared responsibility: in SaaS the provider secures almost everything except data, identity, and devices.",
    ],
  },

  /* ----------------------------- MODULE 2 ----------------------------- */
  {
    moduleSlug: "iam",
    tagline: "Identity is the new perimeter.",
    overview:
      "Module 2 covers how Microsoft proves who a user is (authentication) and what they're allowed to do (authorization). It introduces MFA, RBAC, Conditional Access, and Privileged Identity Management — the building blocks that gate every Microsoft 365 and Azure resource.",
    whyItMatters:
      "Over 99% of identity attacks are stopped by MFA, yet only a fraction of accounts have it enabled by default in legacy environments. IAM is the single highest-leverage control set on the exam and in the real world.",

    what: {
      heading: "What is Identity & Access Management?",
      body:
        "IAM is the discipline of ensuring the right people have the right access to the right resources at the right time — and nothing more. It combines authentication (proof of identity), authorization (permission to act), administration (lifecycle), and audit (who did what).",
      bullets: [
        "Authentication — passwords, MFA, passwordless, certificates.",
        "Authorization — RBAC, ABAC, Conditional Access.",
        "Administration — joiner/mover/leaver, access reviews.",
        "Audit — sign-in logs, audit logs, PIM history.",
      ],
    },
    why: {
      heading: "Why is IAM critical?",
      body:
        "Every breach starts with an identity — either stolen, over-privileged, or forgotten. Strong IAM stops attackers from moving laterally even if they get a foothold, and gives auditors the trail they need for regulators.",
    },
    who: {
      heading: "Who manages IAM?",
      body:
        "Identity admins design the policies. HR triggers joiner/leaver events. Resource owners approve access. End users complete MFA challenges. In a mature org these flows are automated through Entra ID Governance.",
    },
    when: {
      heading: "When does IAM run?",
      body:
        "On every authentication request and every authorization check — typically within milliseconds. Conditional Access evaluates dozens of signals (location, device, risk, app) for every sign-in. Access reviews run on a schedule (monthly, quarterly).",
    },
    where: {
      heading: "Where does IAM apply?",
      body:
        "Everywhere a resource is requested: Microsoft 365 apps, Azure resources, third-party SaaS via SSO, on-prem apps via Application Proxy, and even non-Microsoft clouds federated to Entra.",
    },
    how: {
      heading: "How does Microsoft implement IAM?",
      body:
        "Entra ID is the identity provider. RBAC governs Azure resources. Conditional Access is the policy engine. PIM provides time-bound elevation. Microsoft Authenticator handles MFA and passwordless. Together they form a unified control plane.",
      bullets: [
        "Sign-in → Conditional Access evaluates risk → MFA prompt if needed.",
        "Resource access → RBAC role assignment → least-privilege check.",
        "Privileged action → PIM activation with approval + justification.",
      ],
    },

    realExamples: [
      {
        title: "Travelling sales rep blocked from impossible location",
        scenario:
          "A rep signs in from London at 09:00, then a sign-in from Lagos appears at 09:15. Identity Protection flags 'atypical travel' as high risk. Conditional Access requires MFA + compliant device. The Lagos session fails — the attacker had stolen a token but no device.",
        outcome:
          "Token replay attack neutralised without IT intervention.",
      },
      {
        title: "PIM stops a standing-admin breach",
        scenario:
          "A Global Admin's laptop is compromised. The role is PIM-eligible, not active. The attacker can read mail but cannot reset another admin's password without raising a JIT request — which requires MFA + manager approval.",
        outcome:
          "Blast radius reduced from tenant-wide to a single mailbox.",
      },
    ],
    keyTerms: [
      { term: "Authentication (AuthN)", definition: "Proves identity — 'who are you?'." },
      { term: "Authorization (AuthZ)", definition: "Grants permission — 'what can you do?'." },
      { term: "MFA", definition: "Two or more factors: something you know / have / are." },
      { term: "RBAC", definition: "Role-Based Access Control — permissions bundled into roles." },
      { term: "Conditional Access", definition: "If-then policies that gate access based on signals." },
      { term: "PIM", definition: "Privileged Identity Management — JIT, time-bound admin roles." },
    ],
    examTips: [
      "Authentication = WHO. Authorization = WHAT. They are NOT the same.",
      "MFA is a Conditional Access GRANT control, not a separate product.",
      "PIM is for ELIGIBLE roles activated just-in-time — not standing access.",
      "RBAC scope hierarchy: management group → subscription → resource group → resource.",
    ],
  },

  /* ----------------------------- MODULE 3 ----------------------------- */
  {
    moduleSlug: "entra",
    tagline: "Microsoft's cloud-first identity platform.",
    overview:
      "Module 3 dives into the specific capabilities of Microsoft Entra: cloud-only vs hybrid identity, Identity Protection's risk engine, passwordless options (Windows Hello, FIDO2, Authenticator), and external identities (B2B for partners, B2C for customers).",
    whyItMatters:
      "Entra ID has 700M+ monthly active users and is the front door to Microsoft 365 and most enterprise SaaS. Knowing its capability boundaries is essential for licensing decisions, migrations, and architecture interviews.",

    what: {
      heading: "What is Microsoft Entra?",
      body:
        "Entra is Microsoft's family of identity & access products. The flagship is Entra ID (formerly Azure AD), a cloud directory and identity provider. The family also includes Entra Permissions Management (CIEM), Entra Verified ID (decentralised credentials), and Entra Internet/Private Access (SSE).",
      bullets: [
        "Entra ID — the directory and IdP.",
        "Entra ID Protection — risk-based detection.",
        "Entra ID Governance — access reviews, lifecycle workflows, entitlement management.",
        "Entra External ID — B2B & B2C scenarios.",
      ],
    },
    why: {
      heading: "Why Entra over on-prem AD?",
      body:
        "On-prem Active Directory was built for the LAN. Entra is built for SaaS, mobile, and zero-trust. It scales globally, ingests trillions of signals daily for risk detection, and integrates natively with every Microsoft cloud service.",
    },
    who: {
      heading: "Who uses Entra?",
      body:
        "Employees (members), guests (B2B partners), customers (B2C consumers), and workloads (managed identities and service principals). Each persona has a different licence and policy story.",
    },
    when: {
      heading: "When do you use which capability?",
      body:
        "Cloud-only when there's no legacy AD. Hybrid (Entra Connect Sync or Cloud Sync) when you must keep on-prem AD. B2B when partners need access to YOUR tenant. B2C when you're building a consumer-facing app and want users to bring their own social identity.",
    },
    where: {
      heading: "Where does Entra reach?",
      body:
        "Microsoft 365, Azure, thousands of pre-integrated SaaS apps in the Entra Gallery, on-prem apps via Application Proxy, custom apps via OIDC/SAML, and even AWS/GCP via federation.",
    },
    how: {
      heading: "How do users actually sign in?",
      body:
        "Cloud authentication uses password hash sync (PHS), pass-through authentication (PTA), or federation (AD FS). Modern environments prefer passwordless: Windows Hello for Business, FIDO2 keys, or Microsoft Authenticator phone sign-in. Identity Protection scores every sign-in for risk.",
    },

    realExamples: [
      {
        title: "Acquisition: 5,000 partner accounts in 24 hours",
        scenario:
          "Contoso acquires Northwind. Instead of creating duplicate accounts, the Northwind tenant is added as a B2B partner. Northwind users sign in with their existing credentials and accept the Contoso terms of use. Conditional Access requires MFA for guests.",
        outcome:
          "Day-one access without lifting a single password — and revocation is one click when integration ends.",
      },
      {
        title: "Passwordless rollout halves helpdesk calls",
        scenario:
          "A retailer enrols staff in Microsoft Authenticator phone sign-in and Windows Hello. Within a quarter, password-reset tickets drop 52% and AiTM phishing attempts fail because there's no password to steal.",
        outcome:
          "Lower cost, lower risk, better UX.",
      },
    ],
    keyTerms: [
      { term: "Entra ID", definition: "Cloud directory + identity provider (formerly Azure AD)." },
      { term: "Hybrid identity", definition: "On-prem AD synced to Entra ID via Connect Sync or Cloud Sync." },
      { term: "B2B", definition: "Invite external partners as guests in your tenant." },
      { term: "B2C", definition: "Customer identity for your consumer apps; users self-register." },
      { term: "Identity Protection", definition: "Detects user-risk and sign-in-risk events." },
      { term: "FIDO2", definition: "Phishing-resistant passwordless standard using hardware keys." },
    ],
    examTips: [
      "B2B = partners in YOUR tenant. B2C = customers in a SEPARATE tenant for your app.",
      "Identity Protection requires Entra ID P2 (or equivalent).",
      "Passwordless options on the exam: Windows Hello, Microsoft Authenticator, FIDO2 security key.",
      "Hybrid identity options: PHS (default), PTA (no hash leaves on-prem), Federation (third-party IdP).",
    ],
  },

  /* ----------------------------- MODULE 4 ----------------------------- */
  {
    moduleSlug: "security",
    tagline: "Detect, investigate, and respond — across the whole estate.",
    overview:
      "Module 4 introduces Microsoft's two security platforms: Defender XDR (extended detection and response across endpoints, email, identity, and apps) and Microsoft Sentinel (cloud-native SIEM/SOAR for the entire enterprise, including non-Microsoft sources).",
    whyItMatters:
      "Average attacker dwell time is still measured in days. XDR + SIEM compress this to minutes by correlating signals that siloed tools would miss, and by automating the boring 80% of triage so analysts focus on the 20% that matters.",

    what: {
      heading: "What are XDR and SIEM?",
      body:
        "XDR (Extended Detection & Response) correlates alerts across multiple vectors into a single incident. SIEM (Security Information & Event Management) ingests logs from anything — Microsoft, AWS, network gear, custom apps — and runs analytics on top. SOAR adds the automation layer.",
      bullets: [
        "Defender for Endpoint (MDE) — EDR for Windows/Mac/Linux/iOS/Android.",
        "Defender for Office 365 (MDO) — anti-phishing, safe links/attachments.",
        "Defender for Identity (MDI) — on-prem AD attack detection.",
        "Defender for Cloud Apps (MDCA) — CASB for SaaS.",
        "Microsoft Sentinel — cloud-native SIEM + SOAR built on Log Analytics.",
      ],
    },
    why: {
      heading: "Why XDR and SIEM together?",
      body:
        "XDR is best-in-class for the Microsoft estate. Sentinel covers everything else. Together they form a single pane of glass: incidents from Defender flow into Sentinel automatically, and Sentinel's playbooks can act back on Defender (isolate device, disable user, block IP).",
    },
    who: {
      heading: "Who operates them?",
      body:
        "Tier-1 SOC analysts triage alerts in Defender XDR. Tier-2/3 analysts and threat hunters write KQL queries in Sentinel. Incident responders use both to scope and contain attacks. CISOs use the dashboards for posture reporting.",
    },
    when: {
      heading: "When do they fire?",
      body:
        "Continuously. Defender's cloud detonation happens within seconds of an email arriving. EDR sensors stream telemetry every few seconds. Sentinel analytics rules run every 5 minutes by default. Automated playbooks trigger the moment an incident is created.",
    },
    where: {
      heading: "Where do they look?",
      body:
        "Endpoints (any OS), mailboxes, identity systems (cloud + on-prem), SaaS apps, Azure & multi-cloud workloads, network firewalls — anywhere a log can be produced or a sensor installed.",
    },
    how: {
      heading: "How does an investigation flow?",
      body:
        "An MDE alert and an MDO alert correlate into one Defender XDR incident. The analyst sees the full attack story in a graph, runs guided response actions (isolate, collect investigation package), and the incident is mirrored into Sentinel where a SOAR playbook opens a ticket, notifies the user's manager, and revokes Entra sessions.",
    },

    realExamples: [
      {
        title: "Phishing-to-ransomware stopped in 3 minutes",
        scenario:
          "MDO blocks the initial URL but a user forwards the email externally and re-clicks from a phone. MDE detects encrypted outbound to a known C2. Defender XDR auto-isolates the device, disables the user, and rolls back encrypted files using OneDrive version history.",
        outcome:
          "Zero data lost, full forensic timeline captured.",
      },
      {
        title: "Sentinel detects credential stuffing across cloud and on-prem",
        scenario:
          "An analytic rule joins Entra sign-in logs with Okta logs from a partner SaaS. A spike of failed sign-ins from one ASN triggers an incident. A playbook adds the ASN to a named-location block list and opens a ServiceNow ticket.",
        outcome:
          "A campaign that would have gone unnoticed is shut down before any account is compromised.",
      },
    ],
    keyTerms: [
      { term: "XDR", definition: "Extended Detection & Response — cross-domain incident correlation." },
      { term: "SIEM", definition: "Aggregates and analyses logs from many sources." },
      { term: "SOAR", definition: "Security Orchestration, Automation & Response — playbooks." },
      { term: "EDR", definition: "Endpoint Detection & Response — telemetry + response on devices." },
      { term: "CSPM", definition: "Cloud Security Posture Management — find and fix misconfigurations." },
      { term: "KQL", definition: "Kusto Query Language — used to query Sentinel and Defender data." },
    ],
    examTips: [
      "Defender XDR = Microsoft estate (endpoints, email, identity, SaaS). Sentinel = everything, including non-Microsoft.",
      "Sentinel is the only Microsoft offering on the exam that's a true SIEM + SOAR.",
      "Defender for Cloud is for AZURE workloads (CSPM/CWPP); Defender for Cloud APPS is for SaaS — don't confuse them.",
      "Secure Score (Microsoft 365) and Secure Score for Cloud (Azure) are different scores — context matters.",
    ],
  },

  /* ----------------------------- MODULE 5 ----------------------------- */
  {
    moduleSlug: "compliance",
    tagline: "Know your data, protect it, prove it.",
    overview:
      "Module 5 covers Microsoft Purview — the unified governance, risk, and compliance platform. It includes data classification, sensitivity labels, Data Loss Prevention (DLP), insider risk management, eDiscovery, and the Compliance Manager scoring engine.",
    whyItMatters:
      "GDPR, HIPAA, PCI-DSS, and now AI regulations all demand the same three things: know what data you have, protect it according to its sensitivity, and prove on demand that you did. Purview is Microsoft's answer across Microsoft 365, Azure, and (increasingly) multi-cloud.",

    what: {
      heading: "What is Microsoft Purview?",
      body:
        "Purview is a portfolio: Information Protection (labels, encryption), Data Loss Prevention (policies that block oversharing), Insider Risk Management (behavioural analytics on users), eDiscovery (legal hold and review), Compliance Manager (control scoring), and Audit (unified log).",
      bullets: [
        "Sensitivity labels — classify and protect (encrypt, watermark, restrict).",
        "DLP — block or warn when sensitive data leaves trusted boundaries.",
        "Records management — retain or delete on schedule.",
        "eDiscovery (Standard / Premium) — legal hold + collection + review.",
        "Compliance Manager — track controls against regulatory templates.",
      ],
    },
    why: {
      heading: "Why Purview, why now?",
      body:
        "Data has exploded across SharePoint, Teams, OneDrive, endpoints, and SaaS. Spreadsheet-based governance no longer scales. Purview applies labels and policies that travel WITH the data — even outside the tenant — so protection survives sharing.",
    },
    who: {
      heading: "Who uses Purview?",
      body:
        "Compliance officers design labels and policies. Legal teams run eDiscovery. Privacy officers run subject-rights requests. Insider risk analysts review case alerts. End users see labels in Word/Outlook and DLP tooltips when they overshare.",
    },
    when: {
      heading: "When does Purview act?",
      body:
        "At creation (auto-labelling), at edit (label inheritance), at share (DLP evaluation), at retention age (records disposal), and at investigation (eDiscovery hold). Compliance Manager continuously rescores controls as configurations change.",
    },
    where: {
      heading: "Where does Purview reach?",
      body:
        "Microsoft 365 (Exchange, SharePoint, Teams, OneDrive), Windows endpoints, Azure data services (via Purview Data Map), and increasingly AWS S3, Google Drive, and on-prem file shares via the Microsoft Purview connector ecosystem.",
    },
    how: {
      heading: "How do labels and DLP work together?",
      body:
        "A sensitivity label tags content and can apply encryption + visual markings. A DLP policy then uses that label as a condition: 'if Confidential and shared with external user, block and notify'. The classification follows the file even when downloaded.",
    },

    realExamples: [
      {
        title: "M&A leak prevented at the click",
        scenario:
          "An analyst tries to email a deal model labelled 'Confidential / M&A' to a Gmail address. DLP shows a policy tip, blocks the send, and logs the attempt. The user clicks 'Report — false positive', which routes to compliance for review.",
        outcome:
          "Sensitive deal data stays inside; the user learns the policy in context.",
      },
      {
        title: "Subject Access Request closed in 5 days, not 5 weeks",
        scenario:
          "A customer requests all their personal data under GDPR. Purview eDiscovery (Premium) searches mailboxes, Teams chats, and SharePoint sites in one query, places a hold, and exports a defensible package.",
        outcome:
          "Compliance with the 30-day legal deadline — and a repeatable workflow for the next request.",
      },
    ],
    keyTerms: [
      { term: "Sensitivity label", definition: "Persistent tag that classifies and optionally encrypts content." },
      { term: "Retention label / policy", definition: "Controls how long content is kept and what happens after." },
      { term: "DLP", definition: "Data Loss Prevention — detects and blocks risky sharing of sensitive data." },
      { term: "eDiscovery", definition: "Legal process of identifying, holding, collecting, and reviewing ESI." },
      { term: "Insider Risk", definition: "Detects risky behaviour by internal users (data theft, leaks)." },
      { term: "Compliance Manager", definition: "Scores your tenant against regulatory templates with control evidence." },
    ],
    examTips: [
      "Sensitivity labels = CLASSIFY + PROTECT. Retention labels = KEEP or DELETE. They are different.",
      "DLP locations: Exchange, SharePoint, OneDrive, Teams chat, Devices, third-party apps via MDCA.",
      "eDiscovery Standard vs Premium: Premium adds custodian management, review sets, and advanced analytics.",
      "Compliance Manager score is improvement-based — completing assessments raises it.",
    ],
  },
];

export function getModuleExplanation(slug: string): ModuleExplanation | undefined {
  return moduleExplanations.find((m) => m.moduleSlug === slug);
}
